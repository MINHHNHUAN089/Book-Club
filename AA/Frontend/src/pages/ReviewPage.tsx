import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import ReviewForm from "../components/ReviewForm";
import { Book } from "../types";

interface ReviewPageProps {
  books: Book[];
  allBooks?: Book[];
  userBooks?: Array<{ id: number; book_id: number; progress: number }>;
  selectedBook: Book | null;
  onSelectBook: (book: Book) => void;
  onSaveReview: (bookId: string, rating: number, review: string) => void;
  onBookAdded?: () => void;
  onProgressUpdated?: () => void;
}

const ReviewPage = ({ books, allBooks = [], userBooks = [], selectedBook, onSelectBook, onSaveReview, onBookAdded, onProgressUpdated }: ReviewPageProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const bookIdFromUrl = searchParams.get("bookId");
  const [currentBookState, setCurrentBookState] = useState<Book | null>(null);

  // Kết hợp tất cả sách: userBooks và allBooks (loại bỏ trùng lặp)
  const allAvailableBooks = useMemo(() => {
    const combined = [...books];
    const bookIds = new Set(books.map(b => b.id));
    
    // Thêm sách từ allBooks nếu chưa có trong books
    allBooks.forEach(book => {
      if (!bookIds.has(book.id)) {
        combined.push(book);
        bookIds.add(book.id);
      }
    });
    
    return combined;
  }, [books, allBooks]);

  // Cập nhật currentBook khi bookIdFromUrl thay đổi
  useEffect(() => {
    if (bookIdFromUrl) {
      const book = allAvailableBooks.find((b) => b.id === bookIdFromUrl);
      if (book) {
        setCurrentBookState(book);
        onSelectBook(book);
      } else {
        // Nếu không tìm thấy sách, chọn sách đầu tiên
        if (allAvailableBooks.length > 0) {
          const firstBook = allAvailableBooks[0];
          setCurrentBookState(firstBook);
          setSearchParams({ bookId: firstBook.id });
        }
      }
    } else {
      // Nếu không có bookId trong URL, chọn sách đầu tiên
      if (allAvailableBooks.length > 0) {
        const firstBook = allAvailableBooks[0];
        setCurrentBookState(firstBook);
        setSearchParams({ bookId: firstBook.id });
      }
    }
  }, [bookIdFromUrl, allAvailableBooks, onSelectBook, setSearchParams]);

  const avgProgress = useMemo(() => {
    if (!allAvailableBooks.length) return 0;
    const total = allAvailableBooks.reduce((sum, b) => sum + (b.progress || 0), 0);
    return Math.round(total / allAvailableBooks.length);
  }, [allAvailableBooks]);

  // Ưu tiên currentBookState (từ URL) > selectedBook (từ props) > sách đầu tiên
  const currentBook = currentBookState || selectedBook || (allAvailableBooks.length > 0 ? allAvailableBooks[0] : null);

  const handleBookChange = (bookId: string) => {
    const book = allAvailableBooks.find((b) => b.id === bookId);
    if (book) {
      setCurrentBookState(book);
      setSearchParams({ bookId: book.id });
      onSelectBook(book);
    }
  };

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
          <button className="primary-btn" onClick={() => navigate("/discover")}>+ Thêm sách</button>
          <div 
            className="avatar" 
            aria-label="User avatar"
            onClick={() => navigate("/user")}
            style={{ cursor: "pointer" }}
          />
        </div>
      </header>

      <section className="dark-controls">
        <div className="tabs" style={{ justifyContent: "space-between", gap: 12 }}>
          <div style={{ color: "#cbd5e1", fontWeight: 700 }}>Chọn sách để review</div>
          <select
            className="detail-select"
            value={currentBook?.id ?? ""}
            onChange={(e) => handleBookChange(e.target.value)}
          >
            {allAvailableBooks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} — {b.author}
              </option>
            ))}
          </select>
        </div>
      </section>

      <ReviewForm 
        book={currentBook} 
        userBookId={currentBook ? userBooks.find(ub => ub && ub.book_id != null && ub.book_id.toString() === currentBook.id)?.id : undefined}
        onSave={onSaveReview}
        onBookAdded={onBookAdded}
        onProgressUpdated={onProgressUpdated}
      />
    </div>
  );
};

export default ReviewPage;


