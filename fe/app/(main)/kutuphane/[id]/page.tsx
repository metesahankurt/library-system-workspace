import { BookDetail } from "@/components/book-detail";
import { Footer10 } from "@/components/footer10";
import { notFound } from "next/navigation";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

async function getBookData(id: string) {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/books/${id}?populate=*`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching book:", error);
    return null;
  }
}

async function getSimilarBooks(categoryDocumentId: string, currentBookDocumentId: string) {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/books?filters[category][documentId]=${categoryDocumentId}&filters[documentId][$ne]=${currentBookDocumentId}&pagination[pageSize]=4&populate=*`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching similar books:", error);
    return [];
  }
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBookData(id);

  if (!book) {
    notFound();
  }

  const categoryDocumentId = book.category?.documentId;
  const similarBooks = categoryDocumentId ? await getSimilarBooks(categoryDocumentId, book.documentId) : [];

  return (
    <main className="flex-1 bg-white">
      <div className="h-32 bg-zinc-50 border-b" /> {/* Simple spacer for header overlap */}
      <BookDetail book={book} similarBooks={similarBooks} />
      <Footer10 />
    </main>
  );
}
