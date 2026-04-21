import { Hero232 } from "@/components/hero232";
import { BookGrid } from "@/components/book-grid";
import { Footer10 } from "@/components/footer10";

const PAGE_SIZE = 16;
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

async function fetchBooks(page: number) {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/books?populate=category&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}&sort=title:asc`,
      { cache: "no-store" },
    );
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
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { books, totalPages, total } = await fetchBooks(page);

  return (
    <main className="flex-1">
      <Hero232 />
      <BookGrid books={books} page={page} totalPages={totalPages} total={total} />
      <Footer10 />
    </main>
  );
}
