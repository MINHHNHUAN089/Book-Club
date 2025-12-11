import { useMemo, useState } from "react";
import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router-dom";
import "./index.css";
import { mockAuthors, mockBooks, mockChallenges, mockGroups } from "./mockData";
import { Book } from "./types";
import BooksPage from "./pages/BooksPage";
import ReviewPage from "./pages/ReviewPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import GroupsPage from "./pages/GroupsPage";
import ChallengesPage from "./pages/ChallengesPage";
import AuthorsPage from "./pages/AuthorsPage";
import DiscoverPage from "./pages/DiscoverPage";
import { GoogleVolume } from "./api/googleBooks";

const App = () => {
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(mockBooks[0]?.id ?? null);

  const selectedBook = useMemo(
    () => books.find((b) => b.id === selectedBookId) ?? null,
    [books, selectedBookId]
  );

  const avgProgress = useMemo(() => {
    if (!books.length) return 0;
    const total = books.reduce((sum, b) => sum + b.progress, 0);
    return Math.round(total / books.length);
  }, [books]);

  const recommendations = useMemo(
    () =>
      [...books]
        .filter((b) => !b.review || (b.rating ?? 0) >= 4)
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 3),
    [books]
  );

  const handleUpdateProgress = (bookId: string, progress: number) => {
    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, progress } : b)));
  };

  const handleReviewSave = (bookId: string, rating: number, review: string) => {
    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, rating, review } : b)));
  };

  const handleImportBook = (volume: GoogleVolume) => {
    setBooks((prev) => {
      const newId = `gb-${volume.id}`;
      if (prev.some((b) => b.id === newId)) return prev;
      const title = volume.volumeInfo.title ?? "Sách chưa có tiêu đề";
      const author = volume.volumeInfo.authors?.join(", ") ?? "Ẩn danh";
      const coverUrl = volume.volumeInfo.imageLinks?.thumbnail;
      const review = volume.volumeInfo.description;
      const nextBooks = [
        ...prev,
        {
          id: newId,
          title,
          author,
          coverUrl,
          progress: 0,
          rating: 0,
          review
        }
      ];
      setSelectedBookId(newId);
      return nextBooks;
    });
  };

  const handleAddBookFromRecommendations = (book: Book) => {
    setBooks((prev) => {
      if (prev.some((b) => b.id === book.id)) return prev;
      return [...prev, { ...book, progress: 0, rating: 0 }];
    });
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="app-container">
          <header className="topbar">
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
            <div className="card info-card">
              <h3>Ghi chú nhanh</h3>
              <p className="small">Google Books API: tìm kiếm và import metadata sách.</p>
              <p className="small">Backend (FastAPI + Postgres): lưu user, sách, review, nhóm.</p>
              <p className="small">Kết nối API: cập nhật base URL tại lớp fetch.</p>
            </div>
          </header>

          <nav className="nav">
            <NavLink to="/books" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Danh sách
            </NavLink>
            <NavLink to="/review" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Review
            </NavLink>
            <NavLink
              to="/recommendations"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Gợi ý
            </NavLink>
            <NavLink to="/groups" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Book club
            </NavLink>
            <NavLink to="/challenges" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Thử thách
            </NavLink>
            <NavLink to="/authors" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Tác giả
            </NavLink>
            <NavLink to="/discover" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Khám phá (Google Books)
            </NavLink>
          </nav>

          <Routes>
            <Route
              path="/books"
              element={
                <BooksPage
                  books={books}
                  onUpdateProgress={handleUpdateProgress}
                />
              }
            />
            <Route
              path="/review"
              element={
                <ReviewPage
                  books={books}
                  selectedBook={selectedBook}
                  onSelectBook={(book) => setSelectedBookId(book.id)}
                  onSaveReview={handleReviewSave}
                />
              }
            />
            <Route
              path="/recommendations"
              element={<RecommendationsPage books={recommendations} onAddBook={handleAddBookFromRecommendations} />}
            />
            <Route path="/groups" element={<GroupsPage groups={mockGroups} />} />
            <Route path="/challenges" element={<ChallengesPage challenges={mockChallenges} />} />
            <Route path="/authors" element={<AuthorsPage authors={mockAuthors} />} />
            <Route path="/discover" element={<DiscoverPage onImport={handleImportBook} />} />
            <Route path="/" element={<Navigate to="/books" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;

