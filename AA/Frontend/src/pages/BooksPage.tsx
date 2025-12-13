import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookList from "../components/BookList";
import Navigation from "../components/Navigation";
import { Book } from "../types";

type Filter = "all" | "reading" | "want_to_read" | "finished";
type ViewMode = "my_books" | "all_books";

interface BooksPageProps {
  books: Book[];
  allBooks: Book[];
  onUpdateProgress: (bookId: string, progress: number) => void;
}

const BooksPage = ({ books, allBooks, onUpdateProgress }: BooksPageProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("my_books");

  // Chọn danh sách sách để hiển thị
  const booksToShow = viewMode === "my_books" ? books : allBooks;

  const filteredBooks = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase();
    const filtered = booksToShow.filter((b) => {
      const matchesSearch =
        !search.trim() ||
        normalize(b.title).includes(normalize(search)) ||
        normalize(b.author || "").includes(normalize(search));

      if (!matchesSearch) return false;

      // Nếu là "Tất cả sách", không filter theo progress
      if (viewMode === "all_books") return true;

      // Nếu là "Sách của tôi", filter theo progress
      if (filter === "all") return true;
      if (filter === "want_to_read") return b.progress === 0;
      if (filter === "finished") return b.progress >= 100;
      return b.progress > 0 && b.progress < 100;
    });
    
    console.log(`BooksPage: ViewMode: ${viewMode}, Total books: ${booksToShow.length}, Filtered: ${filtered.length}, Filter: ${filter}, Search: "${search}"`);
    return filtered;
  }, [booksToShow, filter, search, viewMode]);

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
          <button 
            className="primary-btn"
            onClick={() => {
              console.log("Add book button clicked");
              navigate("/discover");
            }}
          >
            + Thêm sách
          </button>
          <div 
            className="avatar" 
            aria-label="User avatar"
            onClick={() => navigate("/user")}
            style={{ cursor: "pointer" }}
          />
        </div>
      </header>

      <section className="dark-controls">
        <div className="search">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Tìm kiếm theo tên sách, tác giả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
          <div className="tabs" style={{ margin: 0 }}>
            <button
              className={viewMode === "my_books" ? "tab active" : "tab"}
              onClick={() => {
                setViewMode("my_books");
                setFilter("all"); // Reset filter khi chuyển mode
              }}
              type="button"
            >
              Sách của tôi
            </button>
            <button
              className={viewMode === "all_books" ? "tab active" : "tab"}
              onClick={() => {
                setViewMode("all_books");
                setFilter("all"); // Reset filter khi chuyển mode
              }}
              type="button"
            >
              Tất cả sách
            </button>
          </div>
          {viewMode === "my_books" && (
            <div className="tabs" style={{ margin: 0 }}>
              {([
                ["all", "Tất cả"],
                ["reading", "Đang đọc"],
                ["want_to_read", "Muốn đọc"],
                ["finished", "Đã đọc"]
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  className={filter === key ? "tab active" : "tab"}
                  onClick={() => setFilter(key)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {filteredBooks.length === 0 ? (
        <div className="user-empty-state">
          {viewMode === "my_books" 
            ? "Bạn chưa có sách nào. Hãy thêm sách từ trang Khám phá!"
            : "Không tìm thấy sách nào."}
        </div>
      ) : (
        <BookList
          books={filteredBooks}
          onUpdateProgress={viewMode === "my_books" ? onUpdateProgress : undefined}
          onSelect={(book) => navigate(`/review?bookId=${book.id}`)}
        />
      )}
    </div>
  );
};

export default BooksPage;


