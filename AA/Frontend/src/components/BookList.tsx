import { Book } from "../types";

interface BookListProps {
  books: Book[];
  onUpdateProgress: (bookId: string, progress: number) => void;
  onSelect: (book: Book) => void;
}

const getStatus = (progress: number) => {
  if (progress >= 100) return "Đã đọc";
  if (progress === 0) return "Muốn đọc";
  return "Đang đọc";
};

const BookList = ({ books, onUpdateProgress, onSelect }: BookListProps) => {
  return (
    <div className="book-grid">
      {books.map((book) => (
        <div className="book-card" key={book.id} onClick={() => onSelect(book)} style={{ cursor: "pointer" }}>
          <div
            className="book-cover"
            style={{ backgroundImage: `url(${book.coverUrl ?? "https://via.placeholder.com/240x320"})` }}
            role="img"
            aria-label={`Bìa sách ${book.title}`}
          />

          <div className="book-meta">
            <div>
              <p className="book-title">{book.title}</p>
              <p className="book-author">{book.author}</p>
            </div>

            <div className="book-progress">
              <div className="book-progress-row">
                <span>Tiến độ</span>
                <span>{book.progress}%</span>
              </div>
              <div className="book-progress-bar">
                <div className="book-progress-fill" style={{ width: `${book.progress}%` }} />
              </div>
            </div>

            <div className="book-rating">
              {Array.from({ length: 5 }).map((_, idx) => {
                const filled = (book.rating ?? 0) >= idx + 1;
                return (
                  <span key={idx} className={filled ? "rating-star filled" : "rating-star"} aria-hidden>
                    ★
                  </span>
                );
              })}
            </div>

            <div className="book-status">{getStatus(book.progress)}</div>

            <div className="book-actions">
              <input
                className="range"
                type="range"
                min={0}
                max={100}
                value={book.progress}
                onChange={(e) => onUpdateProgress(book.id, Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                className="secondary-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(book);
                }}
              >
                Review
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookList;

