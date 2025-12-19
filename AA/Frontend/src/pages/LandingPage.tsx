import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import { getBooks } from "../api/backend";
import { Book } from "../types";

const LandingPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const booksData = await getBooks();
        // Convert to Book format
        const convertedBooks: Book[] = booksData
          .filter((book: any) => book && book.id && book.title)
          .map((book: any) => {
            const authorName = book.authors && book.authors.length > 0
              ? book.authors.map((a: any) => a.name).join(", ")
              : book.author || "Unknown";
            
            return {
              id: book.id.toString(),
              title: book.title,
              author: authorName,
              coverUrl: book.cover_url,
              fileUrl: book.file_url,
              progress: 0,
              description: book.description,
            };
          });
        setBooks(convertedBooks.slice(0, 12)); // Show first 12 books
        console.log("LandingPage: Loaded", convertedBooks.length, "books");
      } catch (err) {
        console.error("Error loading books for landing page:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, []);
  return (
    <div className="dark-page" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      {/* Header */}
      <header style={{ padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="brand-icon" style={{ width: "48px", height: "48px", fontSize: "32px" }}>
            📘
          </div>
          <div className="brand-title" style={{ fontSize: "24px", fontWeight: 800 }}>
            BookClub
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            to="/login"
            className="secondary-btn"
            style={{
              padding: "10px 20px",
              fontSize: "15px",
              textDecoration: "none",
              display: "inline-block"
            }}
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="primary-btn"
            style={{
              padding: "10px 20px",
              fontSize: "15px",
              textDecoration: "none",
              display: "inline-block"
            }}
          >
            Đăng ký
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "calc(100vh - 100px)",
        padding: "40px 20px"
      }}>
        <div style={{ textAlign: "center", maxWidth: "800px" }}>
          {/* Hero Section */}
          <div style={{ marginBottom: "60px" }}>
            <h1 style={{ 
              color: "#e2e8f0", 
              fontSize: "64px", 
              fontWeight: 800, 
              margin: "0 0 24px",
              lineHeight: "1.2"
            }}>
              Chào mừng đến với<br />BookClub
            </h1>
            <p style={{ 
              color: "#94a3b8", 
              fontSize: "22px", 
              margin: "0 0 40px", 
              lineHeight: "1.6",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto"
            }}>
              Nền tảng hoàn chỉnh để theo dõi sách, viết đánh giá, và tham gia câu lạc bộ đọc sách cùng bạn bè
            </p>
            <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                to="/register"
                className="primary-btn"
                style={{
                  padding: "18px 40px",
                  fontSize: "18px",
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-block",
                  borderRadius: "12px"
                }}
              >
                Bắt đầu ngay
              </Link>
              <Link
                to="/login"
                className="secondary-btn"
                style={{
                  padding: "18px 40px",
                  fontSize: "18px",
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-block",
                  borderRadius: "12px"
                }}
              >
                Đăng nhập
              </Link>
            </div>
          </div>

          {/* Popular Books Section */}
          {!loading && books.length > 0 && (
            <div style={{ marginTop: "80px", marginBottom: "80px" }}>
              <h2 style={{ 
                color: "#e2e8f0", 
                fontSize: "36px", 
                fontWeight: 700, 
                margin: "0 0 32px",
                textAlign: "center"
              }}>
                Sách phổ biến
              </h2>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
                gap: "24px",
                maxWidth: "1200px",
                margin: "0 auto"
              }}>
                {books.map((book) => (
                  <Link
                    key={book.id}
                    to={`/review?bookId=${book.id}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit"
                    }}
                  >
                    <div style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      padding: "16px",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    >
                      {book.coverUrl ? (
                        <img 
                          src={book.coverUrl} 
                          alt={book.title}
                          style={{
                            width: "100%",
                            height: "280px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            marginBottom: "12px"
                          }}
                        />
                      ) : (
                        <div style={{
                          width: "100%",
                          height: "280px",
                          background: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "48px",
                          marginBottom: "12px"
                        }}>
                          📚
                        </div>
                      )}
                      <h3 style={{ 
                        color: "#e2e8f0", 
                        fontSize: "16px", 
                        fontWeight: 600, 
                        margin: "0 0 4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {book.title}
                      </h3>
                      <p style={{ 
                        color: "#94a3b8", 
                        fontSize: "14px", 
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {book.author}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "32px",
            marginTop: "80px"
          }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "32px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
              <h3 style={{ color: "#e2e8f0", fontSize: "20px", fontWeight: 700, margin: "0 0 12px" }}>
                Theo dõi sách
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0, lineHeight: "1.6" }}>
                Quản lý danh sách sách đã đọc, đang đọc và muốn đọc
              </p>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "32px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⭐</div>
              <h3 style={{ color: "#e2e8f0", fontSize: "20px", fontWeight: 700, margin: "0 0 12px" }}>
                Đánh giá sách
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0, lineHeight: "1.6" }}>
                Viết đánh giá và chia sẻ cảm nhận về những cuốn sách yêu thích
              </p>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "32px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>👥</div>
              <h3 style={{ color: "#e2e8f0", fontSize: "20px", fontWeight: 700, margin: "0 0 12px" }}>
                Câu lạc bộ
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0, lineHeight: "1.6" }}>
                Tham gia các câu lạc bộ đọc sách và thảo luận cùng bạn bè
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;

