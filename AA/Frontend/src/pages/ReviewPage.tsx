import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "../components/Navigation";
import ReviewForm from "../components/ReviewForm";
import { Book } from "../types";

interface ReviewPageProps {
  books: Book[];
  selectedBook: Book | null;
  onSelectBook: (book: Book) => void;
  onSaveReview: (bookId: string, rating: number, review: string) => void;
}

const ReviewPage = ({ books, selectedBook, onSelectBook, onSaveReview }: ReviewPageProps) => {
  const [searchParams] = useSearchParams();
  const bookIdFromUrl = searchParams.get("bookId");

  useEffect(() => {
    if (bookIdFromUrl) {
      const book = books.find((b) => b.id === bookIdFromUrl);
      if (book) {
        onSelectBook(book);
      }
    }
  }, [bookIdFromUrl, books, onSelectBook]);

  const avgProgress = useMemo(() => {
    if (!books.length) return 0;
    const total = books.reduce((sum, b) => sum + b.progress, 0);
    return Math.round(total / books.length);
  }, [books]);

  const currentBook = selectedBook || (bookIdFromUrl ? books.find((b) => b.id === bookIdFromUrl) : null) || books[0] || null;

  return (
    <div className="dark-page">
      <header className="dark-header">
        <div className="brand">
          <div className="brand-icon">📘</div>
          <div>
            <div className="brand-title">BookClub</div>
          </div>
        </div>
        <div className="header-nav">
          <Navigation />
        </div>
        <div className="header-actions">
          <button className="primary-btn">+ Thêm sách</button>
          <div className="avatar" aria-label="User avatar" />
        </div>
      </header>

      <section className="dark-controls">
        <div className="tabs" style={{ justifyContent: "space-between", gap: 12 }}>
          <div style={{ color: "#cbd5e1", fontWeight: 700 }}>Chọn sách để review</div>
          <select
            className="detail-select"
            value={selectedBook?.id ?? ""}
            onChange={(e) => {
              const book = books.find((b) => b.id === e.target.value);
              if (book) onSelectBook(book);
            }}
          >
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} — {b.author}
              </option>
            ))}
          </select>
        </div>
      </section>

      <ReviewForm book={currentBook} onSave={onSaveReview} />
    </div>
  );
};

export default ReviewPage;


