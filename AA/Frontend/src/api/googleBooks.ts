const GOOGLE_BOOKS_BASE = "https://www.googleapis.com/books/v1/volumes";

export interface GoogleVolume {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    description?: string;
    imageLinks?: { thumbnail?: string };
  };
}

export async function searchBooks(query: string): Promise<GoogleVolume[]> {
  if (!query.trim()) return [];
  const url = `${GOOGLE_BOOKS_BASE}?q=${encodeURIComponent(query)}&maxResults=5`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Google Books API error");
  }
  const data = await res.json();
  return data.items ?? [];
}

