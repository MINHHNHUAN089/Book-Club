import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { getCurrentUser, logout, User, getMyBooks, UserBook, updateBookProgress } from "../api/backend";
import BookList from "../components/BookList";

const UserPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "books" | "settings">("overview");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const [userData, booksData] = await Promise.all([
          getCurrentUser(),
          getMyBooks().catch(() => []),
        ]);
        setUser(userData);
        setUserBooks(booksData);
      } catch (err) {
        console.error("Error loading user data:", err);
        // If not authenticated, redirect to login
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      logout();
      navigate("/");
    }
  };

  // Calculate statistics
  const stats = {
    totalBooks: userBooks.length,
    reading: userBooks.filter((b) => b.status === "reading").length,
    wantToRead: userBooks.filter((b) => b.status === "want_to_read").length,
    completed: userBooks.filter((b) => b.status === "completed").length,
    avgProgress: userBooks.length > 0
      ? Math.round(userBooks.reduce((sum, b) => sum + b.progress, 0) / userBooks.length)
      : 0,
  };

  if (loading) {
    return (
      <div className="dark-page">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#e2e8f0" }}>
          Đang tải...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
          <button className="primary-btn" onClick={() => navigate("/discover")}>
            + Thêm sách
          </button>
          <div className="avatar" aria-label="User avatar" />
        </div>
      </header>

      <main className="user-page-content">
        {/* Profile Header */}
        <div className="user-profile-header">
          <div className="user-avatar-large">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h1 className="user-name">{user.name}</h1>
            <p className="user-email">{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="user-tabs">
          <button
            className={`user-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
            type="button"
          >
            Tổng quan
          </button>
          <button
            className={`user-tab ${activeTab === "books" ? "active" : ""}`}
            onClick={() => setActiveTab("books")}
            type="button"
          >
            Sách của tôi ({stats.totalBooks})
          </button>
          <button
            className={`user-tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
            type="button"
          >
            Cài đặt
          </button>
        </div>

        {/* Tab Content */}
        <div className="user-tab-content">
          {activeTab === "overview" && (
            <div className="user-overview">
              <div className="user-stats-grid">
                <div className="user-stat-card">
                  <div className="user-stat-icon">📚</div>
                  <div className="user-stat-value">{stats.totalBooks}</div>
                  <div className="user-stat-label">Tổng số sách</div>
                </div>
                <div className="user-stat-card">
                  <div className="user-stat-icon">📖</div>
                  <div className="user-stat-value">{stats.reading}</div>
                  <div className="user-stat-label">Đang đọc</div>
                </div>
                <div className="user-stat-card">
                  <div className="user-stat-icon">⭐</div>
                  <div className="user-stat-value">{stats.wantToRead}</div>
                  <div className="user-stat-label">Muốn đọc</div>
                </div>
                <div className="user-stat-card">
                  <div className="user-stat-icon">✅</div>
                  <div className="user-stat-value">{stats.completed}</div>
                  <div className="user-stat-label">Đã hoàn thành</div>
                </div>
              </div>
              <div className="user-progress-card">
                <h3 className="user-progress-title">Tiến độ đọc trung bình</h3>
                <div className="user-progress-bar">
                  <div
                    className="user-progress-fill"
                    style={{ width: `${stats.avgProgress}%` }}
                  />
                </div>
                <p className="user-progress-text">{stats.avgProgress}%</p>
              </div>
            </div>
          )}

          {activeTab === "books" && (
            <div className="user-books">
              {userBooks.length === 0 ? (
                <div className="user-empty-state">
                  <div style={{ fontSize: "64px", marginBottom: "24px" }}>📚</div>
                  <h3 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, margin: "0 0 12px" }}>
                    Chưa có sách nào
                  </h3>
                  <p style={{ color: "#94a3b8", fontSize: "16px", margin: "0 0 32px" }}>
                    Thêm sách đầu tiên của bạn để bắt đầu theo dõi
                  </p>
                  <button className="primary-btn" onClick={() => navigate("/discover")}>
                    + Thêm sách
                  </button>
                </div>
              ) : (
                <BookList
                  books={userBooks.map((ub) => ({
                    id: ub.book_id.toString(),
                    title: ub.book.title,
                    author: ub.book.author || "Unknown",
                    coverUrl: ub.book.cover_url,
                    progress: ub.progress,
                    rating: ub.rating,
                  }))}
                  onUpdateProgress={async (bookId, progress) => {
                    try {
                      const userBook = userBooks.find((ub) => ub.book_id.toString() === bookId);
                      if (!userBook) return;

                      const updated = await updateBookProgress(userBook.id, progress);
                      setUserBooks((prev) => prev.map((ub) => (ub.id === userBook.id ? updated : ub)));
                    } catch (err) {
                      console.error("Error updating progress:", err);
                      alert(err instanceof Error ? err.message : "Không thể cập nhật tiến độ");
                    }
                  }}
                  onSelect={(book) => navigate(`/review?bookId=${book.id}`)}
                />
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="user-settings">
              <div className="user-settings-section">
                <h3 className="user-settings-title">Thông tin tài khoản</h3>
                <div className="user-settings-item">
                  <label className="user-settings-label">Tên</label>
                  <input
                    type="text"
                    className="user-settings-input"
                    value={user.name}
                    readOnly
                  />
                </div>
                <div className="user-settings-item">
                  <label className="user-settings-label">Email</label>
                  <input
                    type="email"
                    className="user-settings-input"
                    value={user.email}
                    readOnly
                  />
                </div>
              </div>

              <div className="user-settings-section">
                <h3 className="user-settings-title">Hành động</h3>
                <button className="user-logout-btn" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserPage;

