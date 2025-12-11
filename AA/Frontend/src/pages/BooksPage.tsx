import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookList from "../components/BookList";
import Navigation from "../components/Navigation";
import { Book } from "../types";

type Filter = "all" | "reading" | "want_to_read" | "finished";

interface BooksPageProps {
  books: Book[];
  onUpdateProgress: (bookId: string, progress: number) => void;
}

const BooksPage = ({ books, onUpdateProgress }: BooksPageProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filteredBooks = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase();
    return books.filter((b) => {
      const matchesSearch =
        !search.trim() ||
        normalize(b.title).includes(normalize(search)) ||
        normalize(b.author).includes(normalize(search));

      if (!matchesSearch) return false;

      if (filter === "all") return true;
      if (filter === "want_to_read") return b.progress === 0;
      if (filter === "finished") return b.progress >= 100;
      return b.progress > 0 && b.progress < 100;
    });
  }, [books, filter, search]);

  return (
    <div className="dark-page">
      <header className="dark-header">
        <div className="brand">
          <div className="brand-icon">📘</div>
          <div>
            <div className="brand-title">BookClub</div>
            <div className="brand-sub">Danh sách sách của tôi</div>
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
        <div className="search">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Tìm kiếm theo tên sách, tác giả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="tabs">
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
      </section>

      <BookList
        books={filteredBooks}
        onUpdateProgress={onUpdateProgress}
        onSelect={(book) => navigate(`/review?bookId=${book.id}`)}
      />
    </div>
  );
};

export default BooksPage;


