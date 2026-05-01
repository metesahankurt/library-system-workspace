import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

async function strapiGet(path: string, jwt: string | null) {
  const headers: Record<string, string> = {};
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    console.warn(`[dashboard-stats] ${res.status} ${path}`);
    return null;
  }
  return res.json();
}

export async function GET(req: NextRequest) {
  // Try session cookie first, then Authorization header
  const session = await getSession();
  const headerAuth = req.headers.get('authorization');
  const jwt: string | null =
    session?.jwt ?? (headerAuth?.startsWith('Bearer ') ? headerAuth.slice(7) : null);

  console.log('[dashboard-stats] session:', !!session, '| jwt:', jwt ? jwt.substring(0,20)+'...' : 'null');

  try {
    // ── Parallel fetches ──────────────────────────────────────────────────────

    const [
      booksData,
      activeLoansData,
      overdueLoansData,
      allLoansData,
      usersData,
      categoriesData,
    ] = await Promise.all([
      // Total books (active only)
      strapiGet('/api/books?filters[status]=active&pagination[pageSize]=1&pagination[page]=1', jwt),
      // Active loans
      strapiGet('/api/loans?filters[status]=active&pagination[pageSize]=1&pagination[page]=1', jwt),
      // Overdue loans
      strapiGet('/api/loans?filters[status]=overdue&pagination[pageSize]=1&pagination[page]=1', jwt),
      // All loans for monthly chart (last 12 months, get up to 1000)
      strapiGet('/api/loans?pagination[pageSize]=1000&pagination[page]=1&sort=loanedAt:desc', jwt),
      // Total members (authenticated users)
      strapiGet('/api/users?filters[role][type]=authenticated&pagination[pageSize]=1', jwt),
      // Categories with book counts
      strapiGet('/api/categories?populate[books][count]=true&pagination[pageSize]=50', jwt),
    ]);

    // ── Process KPI stats ──────────────────────────────────────────────────────

    const totalBooks = booksData?.meta?.pagination?.total ?? 0;
    const activeLoans = activeLoansData?.meta?.pagination?.total ?? 0;
    const overdueLoans = overdueLoansData?.meta?.pagination?.total ?? 0;

    // Users count — /api/users returns an array (no meta pagination wrapper)
    let totalMembers = 0;
    if (Array.isArray(usersData)) {
      totalMembers = usersData.length;
    } else if (usersData?.meta?.pagination?.total !== undefined) {
      totalMembers = usersData.meta.pagination.total;
    }

    // ── Monthly loans chart (last 12 months) ──────────────────────────────────

    const now = new Date();
    const monthlyLoans: Record<string, number> = {};

    // Initialise all 12 months to 0
    const monthKeys: string[] = [];
    const monthLabels: string[] = ['OCA', 'ŞUB', 'MAR', 'NİS', 'MAY', 'HAZ', 'TEM', 'AĞU', 'EYL', 'EKİ', 'KAS', 'ARA'];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyLoans[key] = 0;
      monthKeys.push(key);
    }

    if (allLoansData?.data) {
      for (const loan of allLoansData.data) {
        const loanedAt = loan.attributes?.loanedAt ?? loan.loanedAt;
        if (!loanedAt) continue;
        const d = new Date(loanedAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key in monthlyLoans) {
          monthlyLoans[key]++;
        }
      }
    }

    const monthlyChartData = monthKeys.map((key) => {
      const [year, month] = key.split('-').map(Number);
      const label = monthLabels[month - 1];
      return { month: label, loans: monthlyLoans[key] };
    });

    // ── Category distribution ──────────────────────────────────────────────────

    const categoryData: { name: string; value: number }[] = [];
    if (categoriesData?.data) {
      for (const cat of categoriesData.data) {
        const attrs = cat.attributes ?? cat;
        const name = attrs.name ?? 'Diğer';
        // books might be a relation count or an array
        let count = 0;
        if (typeof attrs.books?.count === 'number') {
          count = attrs.books.count;
        } else if (Array.isArray(attrs.books?.data)) {
          count = attrs.books.data.length;
        }
        if (count > 0) categoryData.push({ name, value: count });
      }
    }

    // ── Weekly loan trend (last 7 days) ───────────────────────────────────────
    const weeklyTrend: Record<string, number> = {};
    const dayLabels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const dayKeys: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
      weeklyTrend[key] = 0;
      dayKeys.push(key);
    }
    if (allLoansData?.data) {
      for (const loan of allLoansData.data) {
        const loanedAt = loan.attributes?.loanedAt ?? loan.loanedAt;
        if (!loanedAt) continue;
        const key = new Date(loanedAt).toISOString().split('T')[0];
        if (key in weeklyTrend) weeklyTrend[key]++;
      }
    }
    const weeklyChartData = dayKeys.map((key, i) => ({
      day: dayLabels[new Date(key).getDay() === 0 ? 6 : new Date(key).getDay() - 1],
      loans: weeklyTrend[key],
    }));

    return NextResponse.json({
      kpi: {
        totalBooks,
        activeLoans,
        overdueLoans,
        totalMembers,
      },
      monthlyChartData,
      weeklyChartData,
      categoryData,
    });
  } catch (err) {
    console.error('[dashboard-stats]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
