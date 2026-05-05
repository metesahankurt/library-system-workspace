import { Hero232 } from "@/components/hero232";
import { BookGrid } from "@/components/book-grid";
import { Footer10 } from "@/components/footer10";

const PAGE_SIZE = 16;
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

async function fetchCategories() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

async function fetchBooks(page: number, categoryId?: string) {
  try {
    let url = `${STRAPI_URL}/api/books?populate[category]=true&populate[frontCover]=true&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}&sort=title:asc`;
    if (categoryId) {
      url += `&filters[category][id][$eq]=${categoryId}`;
    }
    
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { books: [], totalPages: 1, total: 0 };
    const data = await res.json();
    return {
      books: data.data ?? [],
      totalPages: data.meta?.pagination?.pageCount ?? 1,
      total: data.meta?.pagination?.total ?? 0,
    };
  } catch {
    return { books: [], totalPages: 1, total: 0 };
  }
}

export default async function KutuphanePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const categoryId = params.category;
  
  const [categories, { books, totalPages, total }] = await Promise.all([
    fetchCategories(),
    fetchBooks(page, categoryId),
  ]);

  return (
    <main className="flex-1">
      <Hero232 />
      <BookGrid 
        books={books} 
        page={page} 
        totalPages={totalPages} 
        total={total} 
        categories={categories}
        currentCategory={categoryId}
      />
      <Footer10 />
    </main>
  );
}
