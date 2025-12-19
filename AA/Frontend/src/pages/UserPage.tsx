import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { getCurrentUser, logout, User, getMyBooks, UserBook, updateUser, changePassword } from "../api/backend";

const UserPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "" });
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  // Calculate statistics based on actual progress (more reliable than status)
  const stats = useMemo(() => {
    const total = userBooks.length;
    const reading = userBooks.filter((b) => {
      const progress = b.progress || 0;
      return progress > 0 && progress < 100;
    }).length;
    const wantToRead = userBooks.filter((b) => {
      const progress = b.progress || 0;
      return progress === 0;
    }).length;
    const completed = userBooks.filter((b) => {
      const progress = b.progress || 0;
      return progress === 100;
    }).length;
    const avgProgress = total > 0
      ? Math.round(userBooks.reduce((sum, b) => sum + (b.progress || 0), 0) / total)
      : 0;

    // Debug log
    console.log("UserPage Stats:", {
      total,
      reading,
      wantToRead,
      completed,
      avgProgress,
      userBooksSample: userBooks.slice(0, 3).map(b => ({
        id: b.book_id,
        progress: b.progress,
        status: b.status
      }))
    });

    return {
      totalBooks: total,
      reading,
      wantToRead,
      completed,
      avgProgress,
    };
  }, [userBooks]);

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
            </div>
          )}

          {activeTab === "settings" && (
            <div className="user-settings">
              <div className="user-settings-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                  <h3 className="user-settings-title">Thông tin tài khoản</h3>
                  {!editMode && (
                    <button
                      className="primary-btn"
                      onClick={() => {
                        setEditMode(true);
                        setEditData({ name: user.name, email: user.email });
                      }}
                      style={{ padding: "8px 16px", fontSize: "14px" }}
                    >
                      Chỉnh sửa
                    </button>
                  )}
                </div>
                <div className="user-settings-item">
                  <label className="user-settings-label">Tên</label>
                  <input
                    type="text"
                    className="user-settings-input"
                    value={editMode ? editData.name : user.name}
                    readOnly={!editMode}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div className="user-settings-item">
                  <label className="user-settings-label">Email</label>
                  <input
                    type="email"
                    className="user-settings-input"
                    value={editMode ? editData.email : user.email}
                    readOnly={!editMode}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                </div>
                {editMode && (
                  <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                    <button
                      className="secondary-btn"
                      onClick={() => {
                        setEditMode(false);
                        setEditData({ name: user.name, email: user.email });
                      }}
                      disabled={isUpdating}
                    >
                      Hủy
                    </button>
                    <button
                      className="primary-btn"
                      onClick={async () => {
                        setIsUpdating(true);
                        try {
                          const updatedUser = await updateUser(editData);
                          setUser(updatedUser);
                          setEditMode(false);
                          alert("Đã cập nhật thông tin thành công!");
                        } catch (err) {
                          console.error("Error updating user:", err);
                          alert(err instanceof Error ? err.message : "Không thể cập nhật thông tin");
                        } finally {
                          setIsUpdating(false);
                        }
                      }}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                )}
              </div>

              <div className="user-settings-section" style={{ marginTop: "32px" }}>
                <h3 className="user-settings-title">Đổi mật khẩu</h3>
                <div className="user-settings-item">
                  <label className="user-settings-label">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    className="user-settings-input"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>
                <div className="user-settings-item">
                  <label className="user-settings-label">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="user-settings-input"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
                <div className="user-settings-item">
                  <label className="user-settings-label">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    className="user-settings-input"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
                <button
                  className="primary-btn"
                  onClick={async () => {
                    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
                      alert("Vui lòng điền đầy đủ thông tin");
                      return;
                    }
                    if (passwordData.new !== passwordData.confirm) {
                      alert("Mật khẩu mới không khớp");
                      return;
                    }
                    if (passwordData.new.length < 6) {
                      alert("Mật khẩu phải có ít nhất 6 ký tự");
                      return;
                    }
                    setIsChangingPassword(true);
                    try {
                      await changePassword(passwordData.current, passwordData.new);
                      alert("Đã đổi mật khẩu thành công!");
                      setPasswordData({ current: "", new: "", confirm: "" });
                    } catch (err) {
                      console.error("Error changing password:", err);
                      alert(err instanceof Error ? err.message : "Không thể đổi mật khẩu");
                    } finally {
                      setIsChangingPassword(false);
                    }
                  }}
                  disabled={isChangingPassword}
                  style={{ marginTop: "20px" }}
                >
                  {isChangingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
              </div>

              <div className="user-settings-section" style={{ marginTop: "32px" }}>
                <h3 className="user-settings-title">Hành động</h3>
                <button className="user-logout-btn" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserPage;

