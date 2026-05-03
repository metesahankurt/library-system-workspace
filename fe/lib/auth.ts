import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const SESSION_COOKIE = 'library_session';

export type UserRole = 'kutuphaneci' | 'administrator' | 'authenticated' | string;

export interface SessionUser {
  id: number;
  username: string;
  email: string;
  name?: string;
  student_id?: string;
  role: {
    id: number;
    name: string;
    type: UserRole;
  };
}

export interface Session {
  jwt: string;
  user: SessionUser;
}

// ─── Strapi API ──────────────────────────────────────────────────────────────

export async function strapiLogin(
  identifier: string,
  password: string,
): Promise<{ jwt: string; user: SessionUser }> {
  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? 'Giriş başarısız');
  }

  const data = await res.json();

  // Fetch full user with role populated
  const meRes = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
    headers: { Authorization: `Bearer ${data.jwt}` },
    cache: 'no-store',
  });

  if (!meRes.ok) {
    throw new Error('Kullanıcı bilgisi alınamadı. Lütfen tekrar deneyin.');
  }

  const me = await meRes.json();

  // Strapi sometimes returns error object instead of user
  if (!me?.id) {
    throw new Error('Geçersiz kullanıcı yanıtı.');
  }

  return { jwt: data.jwt, user: me as SessionUser };
}

export async function strapiRegister(
  email: string,
  password: string,
  name: string,
  student_id: string,
): Promise<{ jwt: string; user: SessionUser }> {
  const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: email, // Strapi requires username, using email as fallback
      email,
      password,
      name,
      student_id
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? 'Kayıt başarısız');
  }

  const data = await res.json();
  return { jwt: data.jwt, user: data.user as SessionUser };
}

// ─── Session helpers (Server-side only) ──────────────────────────────────────

export async function createSession(jwt: string, user: SessionUser) {
  const cookieStore = await cookies();
  const session: Session = { jwt, user };
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// ─── Role checks ─────────────────────────────────────────────────────────────

export function canAccessDashboard(session: Session | null): boolean {
  if (!session) return false;
  const roleType = session.user.role?.type?.toLowerCase();
  return roleType === 'kutuphaneci' || roleType === 'administrator';
}
