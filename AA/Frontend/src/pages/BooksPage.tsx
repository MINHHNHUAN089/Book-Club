import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookList from "../components/BookList";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Book } from "../types";

type Filter = "all" | "reading";

interface BooksPageProps {
  books: Book[];
  allBooks: Book[];
  onUpdateProgress: (bookId: string, progress: number) => void;
}

const BooksPage = ({ books, allBooks, onUpdateProgress }: BooksPageProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filteredBooks = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase();
    
    // Debug: Log để kiểm tra
    console.log("BooksPage - books:", books.length, "allBooks:", allBooks.length, "filter:", filter);
    console.log("BooksPage - allBooks sample:", allBooks.slice(0, 3));
    
    // Chọn danh sách sách để hiển thị
    const booksToShow = filter === "all" ? allBooks : books;
    
    console.log("BooksPage - booksToShow:", booksToShow.length, "Sample:", booksToShow.slice(0, 3));
    
    if (booksToShow.length === 0) {
      console.warn("BooksPage: No books to show! Check if allBooks is loaded correctly.");
      return [];
    }
    
    const filtered = booksToShow.filter((b) => {
      if (!b || !b.title) {
        console.warn("BooksPage: Invalid book found:", b);
        return false;
      }
      
      const matchesSearch =
        !search.trim() ||
        normalize(b.title).includes(normalize(search)) ||
        normalize(b.author || "").includes(normalize(search));

      if (!matchesSearch) return false;

      // Nếu là "Tất cả sách", hiển thị tất cả
      if (filter === "all") return true;
      
      // Nếu là "Đang đọc", chỉ hiển thị sách có progress > 0 && < 100
      if (filter === "reading") {
        return (b.progress || 0) > 0 && (b.progress || 0) < 100;
      }
      
      return true;
    });
    
    console.log(`BooksPage: Total books: ${booksToShow.length}, Filtered: ${filtered.length}, Filter: ${filter}, Search: "${search}"`);
    return filtered;
  }, [allBooks, books, filter, search]);

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
        <div className="tabs" style={{ marginBottom: "16px" }}>
          <button
            className={filter === "all" ? "tab active" : "tab"}
            onClick={() => setFilter("all")}
            type="button"
          >
            Tất cả sách
          </button>
          <button
            className={filter === "reading" ? "tab active" : "tab"}
            onClick={() => setFilter("reading")}
            type="button"
          >
            Đang đọc
          </button>
        </div>
      </section>

      {filteredBooks.length === 0 ? (
        <div className="user-empty-state">
          {filter === "reading" 
            ? "Bạn chưa có sách nào đang đọc."
            : "Không tìm thấy sách nào."}
        </div>
      ) : (
        <BookList
          books={filteredBooks}
          onUpdateProgress={filter === "reading" ? onUpdateProgress : undefined}
          onSelect={(book) => navigate(`/review?bookId=${book.id}`)}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default BooksPage;


