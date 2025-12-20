import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Book } from "../types";
import { getBook, getMyBooks, updateBookProgress } from "../api/backend";

const ReadingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get("bookId");
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [userBookId, setUserBookId] = useState<number | null>(null);

  // Load book and user progress
  useEffect(() => {
    const loadBook = async () => {
      if (!bookId) {
        setError("Không tìm thấy ID sách");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const bookData = await getBook(parseInt(bookId));
        
        const authorName = bookData.authors && bookData.authors.length > 0
          ? bookData.authors.map((a: any) => a.name).join(", ")
          : bookData.author || "Unknown";
        
        const convertedBook: Book = {
          id: bookData.id.toString(),
          title: bookData.title,
          author: authorName,
          coverUrl: bookData.cover_url,
          fileUrl: bookData.file_url,
          progress: 0,
          description: bookData.description,
        };
        
        setBook(convertedBook);

        // Load user's progress for this book
        try {
          const userBooks = await getMyBooks();
          const userBook = userBooks.find(ub => ub.book_id === parseInt(bookId));
          if (userBook) {
            setUserBookId(userBook.id);
            setProgress(userBook.progress || 0);
          }
        } catch (err) {
          console.error("Error loading user progress:", err);
        }

        setError(null);
      } catch (err) {
        console.error("Error loading book:", err);
        setError(err instanceof Error ? err.message : "Không thể tải thông tin sách");
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [bookId]);

  // Mark as complete
  const markAsComplete = async () => {
    if (!userBookId) return;
    
    try {
      await updateBookProgress(userBookId, 100);
      setProgress(100);
      window.dispatchEvent(new CustomEvent('bookProgressUpdated', {
        detail: { bookId: bookId, progress: 100 }
      }));
      alert("Đã đánh dấu hoàn thành!");
    } catch (err) {
      console.error("Error updating progress:", err);
      alert("Không thể cập nhật tiến độ");
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        backgroundColor: "#101c22",
        color: "#e2e8f0"
      }}>
        <div style={{ fontSize: "18px" }}>Đang tải...</div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: "#101c22",
        color: "#e2e8f0"
      }}>
        <h2 style={{ marginBottom: "16px" }}>Lỗi</h2>
        <p style={{ marginBottom: "24px", color: "#94a3b8" }}>{error || "Không tìm thấy sách"}</p>
        <button 
          className="primary-btn"
          onClick={() => navigate("/books")}
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!book.fileUrl) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: "#101c22",
        color: "#e2e8f0"
      }}>
        <h2 style={{ marginBottom: "16px" }}>Chưa có file PDF</h2>
        <p style={{ marginBottom: "24px", color: "#94a3b8" }}>Sách này chưa có file PDF để đọc.</p>
        <button 
          className="primary-btn"
          onClick={() => navigate(`/review?bookId=${book.id}`)}
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="dark-page" style={{ 
      width: "100%",
      height: "100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div className="brand" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="brand-icon">📘</div>
          <div className="brand-title">BookClub</div>
        </div>
        
        <div className="header-nav">
          <Navigation />
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {userBookId && (
            <button
              onClick={markAsComplete}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "rgba(19, 164, 236, 0.1)",
                color: "#13a4ec",
                border: "1px solid rgba(19, 164, 236, 0.3)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              ✓ Đánh dấu đã đọc xong
            </button>
          )}
          <div 
            className="avatar" 
            onClick={() => navigate("/user")}
            style={{ cursor: "pointer" }}
          />
        </div>
      </header>

      {/* PDF Viewer */}
      <div style={{ 
        flex: 1, 
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1a1f2e"
      }}>
        <iframe
          src={book.fileUrl}
          style={{
            flex: 1,
            width: "100%",
            border: "none"
          }}
          title={`Đọc sách: ${book.title}`}
        />
      </div>

      {/* Footer with progress */}
      <footer style={{
        backgroundColor: "#152028",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "12px 24px"
      }}>
        <div style={{
          maxWidth: "960px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>
            📖 {book.title}
          </div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px" 
          }}>
            <span style={{ color: "#64748b", fontSize: "12px" }}>
              Tiến độ: {progress}%
            </span>
            <div style={{
              width: "200px",
              height: "6px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "9999px",
              overflow: "hidden"
            }}>
              <div style={{
                height: "100%",
                backgroundColor: "#13a4ec",
                borderRadius: "9999px",
                width: `${progress}%`,
                transition: "width 0.3s ease"
              }} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ReadingPage;
