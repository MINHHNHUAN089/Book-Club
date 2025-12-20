import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Author, AuthorNotification } from "../api/backend";
import { followAuthor, unfollowAuthor, getFollowedAuthors, getMyAuthorNotifications } from "../api/backend";

interface AuthorsPageProps {
  authors: Author[];
}

const AuthorsPage = ({ authors }: AuthorsPageProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "followed" | "new_books" | "recent">("all");
  const [followedAuthors, setFollowedAuthors] = useState<Author[]>([]);
  const [loadingFollowed, setLoadingFollowed] = useState(false);
  const [notifications, setNotifications] = useState<AuthorNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch followed authors
  useEffect(() => {
    const fetchFollowedAuthors = async () => {
      setLoadingFollowed(true);
      try {
        const followedData = await getFollowedAuthors();
        setFollowedAuthors(followedData);
      } catch (err) {
        console.error("Error fetching followed authors:", err);
        setFollowedAuthors([]);
      } finally {
        setLoadingFollowed(false);
      }
    };

    fetchFollowedAuthors();
  }, []);

  // Fetch notifications for followed authors
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      try {
        const notificationsData = await getMyAuthorNotifications();
        console.log("Loaded notifications:", notificationsData);
        console.log("Number of notifications:", notificationsData.length);
        setNotifications(notificationsData);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setNotifications([]);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, []);

  // Check if author is followed
  const isFollowed = (authorId: number): boolean => {
    return followedAuthors.some(a => a.id === authorId);
  };

  const filteredAuthors = useMemo(() => {
    let filtered = authors.filter(
      (author) =>
        author.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter by tab
    if (activeTab === "followed") {
      filtered = filtered.filter(author => isFollowed(author.id));
    }
    // Note: API Author doesn't have activity field, so "new_books" and "recent" show all for now

    return filtered;
  }, [authors, searchQuery, activeTab, followedAuthors]);

  const formatFollowers = (count?: number) => {
    if (!count) return "0";
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

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
            placeholder="Tìm kiếm tác giả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="tabs">
          <button
            className={`tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
            type="button"
          >
            Tất cả
          </button>
          <button
            className={`tab ${activeTab === "followed" ? "active" : ""}`}
            onClick={() => setActiveTab("followed")}
            type="button"
          >
            Đang theo dõi
          </button>
          <button
            className={`tab ${activeTab === "new_books" ? "active" : ""}`}
            onClick={() => setActiveTab("new_books")}
            type="button"
          >
            Có sách mới
          </button>
          <button
            className={`tab ${activeTab === "recent" ? "active" : ""}`}
            onClick={() => setActiveTab("recent")}
            type="button"
          >
            Hoạt động gần đây
          </button>
        </div>
      </section>

      <main className="dark-page-content" style={{ padding: "24px 16px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, margin: "0 0 8px" }}>
            Tác giả đang theo dõi
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
            Cập nhật mới nhất từ những tác giả bạn yêu thích
          </p>
        </div>

        {/* Notifications Section */}
        {loadingNotifications && (
          <div style={{ marginBottom: "32px", textAlign: "center", color: "#94a3b8" }}>
            Đang tải thông báo...
          </div>
        )}
        {!loadingNotifications && notifications.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ color: "#e2e8f0", fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>
              🔔 Thông báo mới
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    backgroundColor: "#1e293b",
                    borderRadius: "12px",
                    padding: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: notification.book_id ? "pointer" : "default",
                  }}
                  onClick={() => {
                    if (notification.book_id) {
                      navigate(`/review?bookId=${notification.book_id}`);
                    }
                  }}
                >
                  <div style={{ display: "flex", gap: "12px" }}>
                    {notification.cover_url && (
                      <img
                        src={notification.cover_url}
                        alt={notification.title}
                        style={{
                          width: "60px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ color: "#13a4ec", fontSize: "12px", fontWeight: 600 }}>
                          {notification.author?.name || "Tác giả"}
                        </span>
                        <span style={{ color: "#64748b", fontSize: "12px" }}>•</span>
                        <span style={{ color: "#64748b", fontSize: "12px" }}>
                          {notification.notification_type === "new_book" ? "Sách mới" :
                           notification.notification_type === "announcement" ? "Thông báo" : "Cập nhật"}
                        </span>
                      </div>
                      <h3 style={{ color: "#e2e8f0", fontSize: "16px", fontWeight: 700, margin: "0 0 8px" }}>
                        {notification.title}
                      </h3>
                      <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 8px", lineHeight: "1.5" }}>
                        {notification.content.length > 150 
                          ? notification.content.substring(0, 150) + "..." 
                          : notification.content}
                      </p>
                      <div style={{ color: "#64748b", fontSize: "12px" }}>
                        {new Date(notification.created_at).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!loadingNotifications && notifications.length === 0 && followedAuthors.length > 0 && (
          <div style={{ 
            marginBottom: "32px", 
            padding: "20px", 
            backgroundColor: "#1e293b", 
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔔</div>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
              Chưa có thông báo mới từ các tác giả bạn đang theo dõi
            </p>
          </div>
        )}

        {/* Authors Grid */}
        {filteredAuthors.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "#94a3b8"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "24px" }}>✍️</div>
            <h3 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, margin: "0 0 12px" }}>
              Chưa có tác giả nào
            </h3>
            <p style={{ fontSize: "16px", margin: "0 0 32px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
              Theo dõi các tác giả yêu thích để nhận cập nhật về sách mới
            </p>
          </div>
        ) : (
          <div className="authors-grid">
            {filteredAuthors.map((author) => (
            <div key={author.id} className="authors-card">
              {/* Author Header */}
              <div className="authors-card-header">
                <div className="authors-info">
                  <div className="authors-name-row">
                    <h3 className="authors-name">{author.name}</h3>
                  </div>
                  <p className="authors-followers">{author.bio || "Chưa có mô tả"}</p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="authors-card-footer">
                {isFollowed(author.id) ? (
                  <button
                    className="authors-unfollow-btn"
                    onClick={async () => {
                      if (!confirm("Bạn có chắc chắn muốn bỏ theo dõi tác giả này?")) {
                        return;
                      }
                      try {
                        await unfollowAuthor(author.id);
                        alert("Đã bỏ theo dõi tác giả!");
                        // Refresh followed authors
                        const followedData = await getFollowedAuthors();
                        setFollowedAuthors(followedData);
                      } catch (err) {
                        console.error("Error unfollowing author:", err);
                        alert(err instanceof Error ? err.message : "Không thể bỏ theo dõi tác giả");
                      }
                    }}
                  >
                    Đã theo dõi
                  </button>
                ) : (
                  <button
                    className="authors-view-books-btn"
                    onClick={async () => {
                      try {
                        await followAuthor(author.id);
                        alert("Đã follow tác giả thành công!");
                        // Refresh followed authors
                        const followedData = await getFollowedAuthors();
                        setFollowedAuthors(followedData);
                      } catch (err) {
                        console.error("Error following author:", err);
                        alert(err instanceof Error ? err.message : "Không thể follow tác giả");
                      }
                    }}
                  >
                    Theo dõi
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add More Authors Card */}
          <div className="authors-card add-more">
            <div className="authors-add-more-icon">👤</div>
            <div className="authors-add-more-content">
              <h3 className="authors-add-more-title">Tìm thêm tác giả?</h3>
              <p className="authors-add-more-desc">Khám phá các tác giả mới dựa trên sở thích đọc của bạn.</p>
            </div>
            <button className="authors-add-more-btn">Khám phá ngay</button>
          </div>
        </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AuthorsPage;


