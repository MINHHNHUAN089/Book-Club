import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import {
  getCurrentUser,
  User,
  getAdminStats,
  getAllUsers,
  updateUserAdmin,
  deleteUserAdmin,
  deleteBookAdmin,
  deleteReviewAdmin,
  deleteGroupAdmin,
  deleteChallengeAdmin,
  getBooks,
  getGroups,
  getChallenges,
  Book as APIBook,
  Group,
  Challenge,
} from "../api/backend";

const AdminPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "books" | "reviews" | "groups" | "challenges">("dashboard");
  
  // Stats
  const [stats, setStats] = useState<any>(null);
  
  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("");
  
  // Books
  const [books, setBooks] = useState<APIBook[]>([]);
  const [bookSearch, setBookSearch] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        setUser(userData);
        
        // Check if user is admin
        if (userData.role !== "admin") {
          alert("Bạn không có quyền truy cập trang này");
          navigate("/books");
          return;
        }
        
        // Load stats
        const statsData = await getAdminStats();
        setStats(statsData);
        
        // Load users
        const usersData = await getAllUsers();
        setUsers(usersData);
        
        // Load books
        const booksData = await getBooks();
        setBooks(booksData);
      } catch (err) {
        console.error("Error loading admin data:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleUpdateUser = async (userId: number, data: { role?: string; is_active?: boolean }) => {
    try {
      await updateUserAdmin(userId, data);
      alert("Đã cập nhật thành công!");
      const updatedUsers = await getAllUsers(userSearch || undefined, userRoleFilter || undefined);
      setUsers(updatedUsers);
    } catch (err) {
      console.error("Error updating user:", err);
      alert(err instanceof Error ? err.message : "Không thể cập nhật");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    
    try {
      await deleteUserAdmin(userId);
      alert("Đã xóa thành công!");
      const updatedUsers = await getAllUsers(userSearch || undefined, userRoleFilter || undefined);
      setUsers(updatedUsers);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(err instanceof Error ? err.message : "Không thể xóa");
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa sách này?")) return;
    
    try {
      await deleteBookAdmin(bookId);
      alert("Đã xóa thành công!");
      const updatedBooks = await getBooks();
      setBooks(updatedBooks);
    } catch (err) {
      console.error("Error deleting book:", err);
      alert(err instanceof Error ? err.message : "Không thể xóa");
    }
  };

  const handleSearchUsers = async () => {
    try {
      const results = await getAllUsers(userSearch || undefined, userRoleFilter || undefined);
      setUsers(results);
    } catch (err) {
      console.error("Error searching users:", err);
    }
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

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="dark-page">
      <header className="dark-header">
        <div className="brand">
          <div className="brand-icon">📘</div>
          <div>
            <div className="brand-title">BookClub - Admin</div>
          </div>
        </div>
        <div className="header-nav">
          <Navigation />
        </div>
        <div className="header-actions">
          <button className="primary-btn" onClick={() => navigate("/discover")}>+ Thêm sách</button>
          <div className="avatar" aria-label="User avatar" onClick={() => navigate("/user")} style={{ cursor: "pointer" }} />
        </div>
      </header>

      <main style={{ marginTop: "32px" }}>
        <div className="tabs" style={{ marginBottom: "24px" }}>
          <button
            className={`tab ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Tổng quan
          </button>
          <button
            className={`tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Người dùng
          </button>
          <button
            className={`tab ${activeTab === "books" ? "active" : ""}`}
            onClick={() => setActiveTab("books")}
          >
            Sách
          </button>
          <button
            className={`tab ${activeTab === "groups" ? "active" : ""}`}
            onClick={() => setActiveTab("groups")}
          >
            Câu lạc bộ
          </button>
          <button
            className={`tab ${activeTab === "challenges" ? "active" : ""}`}
            onClick={() => setActiveTab("challenges")}
          >
            Thử thách
          </button>
        </div>

        {activeTab === "dashboard" && stats && (
          <div>
            <h2 style={{ color: "#e2e8f0", fontSize: "28px", fontWeight: 700, marginBottom: "24px" }}>
              Tổng quan hệ thống
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
              <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Tổng người dùng</div>
                <div style={{ color: "#e2e8f0", fontSize: "32px", fontWeight: 700 }}>{stats.total_users}</div>
                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>
                  {stats.active_users} đang hoạt động
                </div>
              </div>
              <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Tổng sách</div>
                <div style={{ color: "#e2e8f0", fontSize: "32px", fontWeight: 700 }}>{stats.total_books}</div>
              </div>
              <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Tổng đánh giá</div>
                <div style={{ color: "#e2e8f0", fontSize: "32px", fontWeight: 700 }}>{stats.total_reviews}</div>
              </div>
              <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Câu lạc bộ</div>
                <div style={{ color: "#e2e8f0", fontSize: "32px", fontWeight: 700 }}>{stats.total_groups}</div>
              </div>
              <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Thử thách</div>
                <div style={{ color: "#e2e8f0", fontSize: "32px", fontWeight: 700 }}>{stats.total_challenges}</div>
              </div>
              <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Admin</div>
                <div style={{ color: "#e2e8f0", fontSize: "32px", fontWeight: 700 }}>{stats.admin_users}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2 style={{ color: "#e2e8f0", fontSize: "28px", fontWeight: 700, marginBottom: "24px" }}>
              Quản lý người dùng
            </h2>
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                }}
              />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                }}
              >
                <option value="">Tất cả</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button className="primary-btn" onClick={handleSearchUsers}>
                Tìm kiếm
              </button>
            </div>
            <div style={{ backgroundColor: "#1e293b", borderRadius: "12px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>ID</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Tên</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Email</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Vai trò</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Trạng thái</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "16px", color: "#e2e8f0" }}>{u.id}</td>
                      <td style={{ padding: "16px", color: "#e2e8f0" }}>{u.name}</td>
                      <td style={{ padding: "16px", color: "#e2e8f0" }}>{u.email}</td>
                      <td style={{ padding: "16px" }}>
                        <select
                          value={u.role || "user"}
                          onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            backgroundColor: "#0f172a",
                            color: "#e2e8f0",
                          }}
                          disabled={u.id === user.id}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <select
                          value={u.is_active ? "active" : "inactive"}
                          onChange={(e) => handleUpdateUser(u.id, { is_active: e.target.value === "active" })}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            backgroundColor: "#0f172a",
                            color: "#e2e8f0",
                          }}
                          disabled={u.id === user.id}
                        >
                          <option value="active">Hoạt động</option>
                          <option value="inactive">Vô hiệu hóa</option>
                        </select>
                      </td>
                      <td style={{ padding: "16px" }}>
                        {u.id !== user.id && (
                          <button
                            className="secondary-btn"
                            onClick={() => handleDeleteUser(u.id)}
                            style={{ padding: "6px 12px", fontSize: "14px" }}
                          >
                            Xóa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "books" && (
          <div>
            <h2 style={{ color: "#e2e8f0", fontSize: "28px", fontWeight: 700, marginBottom: "24px" }}>
              Quản lý sách
            </h2>
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <input
                type="text"
                placeholder="Tìm kiếm sách..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
              {books
                .filter((b) => !bookSearch || b.title.toLowerCase().includes(bookSearch.toLowerCase()))
                .map((book) => (
                  <div
                    key={book.id}
                    style={{
                      backgroundColor: "#1e293b",
                      borderRadius: "12px",
                      padding: "16px",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div style={{ color: "#e2e8f0", fontWeight: 600, marginBottom: "8px" }}>{book.title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "12px" }}>
                      {book.authors && book.authors.length > 0
                        ? book.authors.map((a: any) => a.name).join(", ")
                        : "Unknown"}
                    </div>
                    <button
                      className="secondary-btn"
                      onClick={() => handleDeleteBook(book.id)}
                      style={{ width: "100%", padding: "8px", fontSize: "14px" }}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;

