import { useNavigate } from "react-router-dom";
import { Book } from "../types";

interface BookListProps {
  books: Book[];
  onUpdateProgress?: (bookId: string, progress: number) => void;
  onSelect: (book: Book) => void;
}

// SVG placeholder as data URI (no external dependency)
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='320'%3E%3Crect width='240' height='320' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%2394a3b8'%3ENo Cover%3C/text%3E%3C/svg%3E";

// Helper function to get book cover URL
const getBookCoverUrl = (coverUrl: string | undefined | null, bookTitle?: string): string => {
  // Log original value for debugging
  if (coverUrl) {
    console.log(`[BookList] Processing cover URL for "${bookTitle || 'unknown'}":`, coverUrl);
  } else {
    console.warn(`[BookList] No cover URL for "${bookTitle || 'unknown'}", using placeholder`);
    return PLACEHOLDER_IMAGE;
  }
  
  // Trim whitespace
  const trimmedUrl = coverUrl.trim();
  if (!trimmedUrl) {
    console.warn(`[BookList] Empty cover URL for "${bookTitle || 'unknown'}", using placeholder`);
    return PLACEHOLDER_IMAGE;
  }
  
  // If it's already a full URL (http:// or https://), return as is
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    console.log(`[BookList] Using full URL for "${bookTitle || 'unknown'}":`, trimmedUrl);
    return trimmedUrl;
  }
  
  // If it's a relative path starting with /static, add base URL
  if (trimmedUrl.startsWith("/static") || trimmedUrl.startsWith("static/")) {
    const baseUrl = "http://localhost:8000";
    const fullUrl = trimmedUrl.startsWith("/") 
      ? `${baseUrl}${trimmedUrl}` 
      : `${baseUrl}/${trimmedUrl}`;
    console.log(`[BookList] Resolved relative URL for "${bookTitle || 'unknown'}": ${trimmedUrl} -> ${fullUrl}`);
    return fullUrl;
  }
  
  // If it's just a filename (e.g., "book_1.jpg"), construct full path
  if (!trimmedUrl.includes("/") && !trimmedUrl.includes("\\")) {
    const baseUrl = "http://localhost:8000";
    const fullUrl = `${baseUrl}/static/images/books/${trimmedUrl}`;
    console.log(`[BookList] Constructed URL from filename for "${bookTitle || 'unknown'}": ${trimmedUrl} -> ${fullUrl}`);
    return fullUrl;
  }
  
  // Return as is for other cases (might be a Google Books URL or other format)
  console.log(`[BookList] Using URL as-is for "${bookTitle || 'unknown'}":`, trimmedUrl);
  return trimmedUrl;
};

const BookList = ({ books, onUpdateProgress, onSelect }: BookListProps) => {
  const navigate = useNavigate();
  
  const handleSelect = (book: Book) => {
    console.log("Book selected:", book);
    try {
      onSelect(book);
    } catch (error) {
      console.error("Error selecting book:", error);
    }
  };

  const handleReadBook = (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    if (book.fileUrl) {
      navigate(`/reading?bookId=${book.id}`);
    } else {
      alert("Sách này chưa có file PDF. Vui lòng liên hệ admin để thêm file.");
    }
  };

  if (books.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "80px 20px",
        color: "#94a3b8"
      }}>
        <div style={{ fontSize: "64px", marginBottom: "24px" }}>📚</div>
        <h3 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, margin: "0 0 12px" }}>
          Chưa có sách nào
        </h3>
        <p style={{ fontSize: "16px", margin: "0 0 32px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
          Bắt đầu bằng cách thêm sách đầu tiên vào danh sách của bạn
        </p>
      </div>
    );
  }

  return (
    <div className="book-grid">
      {books.map((book) => {
        const coverUrl = getBookCoverUrl(book.coverUrl, book.title);
        return (
        <div className="book-card" key={book.id} onClick={() => handleSelect(book)} style={{ cursor: "pointer" }}>
          <div className="book-cover" style={{ position: "relative", overflow: "hidden" }}>
            <img
              src={coverUrl}
              alt={`Bìa sách ${book.title}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block"
              }}
              onError={(e) => {
                // Fallback nếu hình ảnh không load được
                const target = e.target as HTMLImageElement;
                console.warn(`[BookList] Failed to load image for book "${book.title}": ${coverUrl}`);
                // Chỉ set placeholder nếu chưa phải placeholder để tránh vòng lặp vô hạn
                if (target.src !== PLACEHOLDER_IMAGE) {
                  target.src = PLACEHOLDER_IMAGE;
                  target.onerror = null; // Prevent infinite loop
                }
              }}
              onLoad={() => {
                console.log(`[BookList] Successfully loaded image for book "${book.title}": ${coverUrl}`);
              }}
            />
          </div>

          <div className="book-meta">
            <div>
              <p className="book-title">{book.title}</p>
              <p className="book-author">{book.author}</p>
            </div>

              <div className="book-progress">
                <div className="book-progress-row">
                  <span>Tiến độ</span>
                <span>{book.progress || 0}%</span>
                </div>
                <div className="book-progress-bar">
                <div className="book-progress-fill" style={{ width: `${book.progress || 0}%` }} />
              </div>
            </div>

            <div className="book-rating">
              {Array.from({ length: 5 }).map((_, idx) => {
                // Rating should be a number between 0-5
                const ratingValue = book.rating != null ? Number(book.rating) : 0;
                const filled = ratingValue >= idx + 1;
                return (
                  <span key={idx} className={filled ? "rating-star filled" : "rating-star"} aria-hidden>
                    ★
                  </span>
                );
              })}
            </div>


            <div className="book-actions">
              {onUpdateProgress && (
                <>
                  <input
                    className="range"
                    type="range"
                    min={0}
                    max={100}
                    value={book.progress}
                    onChange={(e) => onUpdateProgress && onUpdateProgress(book.id, Number(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                  />
                </>
              )}
              <button
                className={book.fileUrl ? "primary-btn" : "secondary-btn"}
                onClick={(e) => handleReadBook(e, book)}
                style={!book.fileUrl ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                title={book.fileUrl ? "Đọc sách" : "Sách này chưa có file PDF"}
              >
                {book.fileUrl ? "Đọc sách" : "Chưa có PDF"}
              </button>
              <button
                className="secondary-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Review button clicked for book:", book);
                  handleSelect(book);
                }}
              >
                Review
              </button>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
};

export default BookList;
