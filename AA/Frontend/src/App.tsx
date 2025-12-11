import { useMemo, useState } from "react";
import "./index.css";
import BookList from "./components/BookList";
import ReviewForm from "./components/ReviewForm";
import Recommendations from "./components/Recommendations";
import Groups from "./components/Groups";
import Challenges from "./components/Challenges";
import Authors from "./components/Authors";
import { mockAuthors, mockBooks, mockChallenges, mockGroups } from "./mockData";
import { Book } from "./types";

const App = () => {
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const avgProgress = useMemo(() => {
    if (!books.length) return 0;
    const total = books.reduce((sum, b) => sum + b.progress, 0);
    return Math.round(total / books.length);
  }, [books]);

  const handleUpdateProgress = (bookId: string, progress: number) => {
    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, progress } : b)));
  };

  const handleReviewSave = (bookId: string, rating: number, review: string) => {
    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, rating, review } : b)));
  };

  const recommendations = useMemo(
    () =>
      [...books]
        .filter((b) => !b.review || (b.rating ?? 0) >= 4)
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 3),
    [books]
  );

  return (
    <div className="app-shell">
      <div className="app-container">
        <div className="hero">
          <div className="hero-card">
            <div className="hero-pill">📚 Book Club / Reading Tracker</div>
            <h1>Theo dõi sách, review, rating và thảo luận</h1>
            <p>
              Quản lý sách đang đọc, chia sẻ review, tham gia book club, thử thách đọc và theo dõi tác giả yêu thích.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
              <div className="tag">Tiến độ trung bình: {avgProgress}%</div>
              <div className="tag">Sách đã thêm: {books.length}</div>
              <div className="tag">Nhóm: {mockGroups.length} | Thử thách: {mockChallenges.length}</div>
            </div>
          </div>
          <div className="card">
            <h3>Ghi chú nhanh</h3>
            <p className="small">Google Books API: tìm kiếm và import metadata sách.</p>
            <p className="small">Backend (FastAPI + SQLite): lưu user, sách, review, nhóm.</p>
            <p className="small">Sẵn sàng kết nối API: chỉnh URL trong file fetch.</p>
          </div>
        </div>

        <div className="grid" style={{ marginBottom: 16 }}>
          <BookList books={books} onUpdateProgress={handleUpdateProgress} onSelect={setSelectedBook} />
          <ReviewForm book={selectedBook} onSave={handleReviewSave} />
        </div>

        <div className="grid" style={{ marginBottom: 16 }}>
          <Recommendations books={recommendations} />
          <Groups groups={mockGroups} />
        </div>

        <div className="grid">
          <Challenges challenges={mockChallenges} />
          <Authors authors={mockAuthors} />
        </div>
      </div>
    </div>
  );
};

export default App;

