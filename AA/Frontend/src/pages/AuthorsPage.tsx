import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Author } from "../api/backend";
import { followAuthor } from "../api/backend";

interface AuthorsPageProps {
  authors: Author[];
}

const AuthorsPage = ({ authors }: AuthorsPageProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "new_books" | "recent">("all");

  const filteredAuthors = useMemo(() => {
    let filtered = authors.filter(
      (author) =>
        author.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Note: API Author doesn't have activity field, so we'll show all for now
    return filtered;
  }, [authors, searchQuery, activeTab]);

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
          <button className="primary-btn">+ Thêm sách</button>
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
                <div className="authors-avatar-wrapper">
                  <div
                    className="authors-avatar-img"
                    style={{
                      backgroundImage: `url(${author.avatar_url || "https://via.placeholder.com/64"})`
                    }}
                  />
                </div>
                <div className="authors-info">
                  <div className="authors-name-row">
                    <h3 className="authors-name">{author.name}</h3>
                  </div>
                  <p className="authors-followers">{author.bio || "Chưa có mô tả"}</p>
                </div>
              </div>

              {/* Activity Section */}
              <div className="authors-activity">
                <div className="authors-activity-empty">
                  {author.bio || "Chưa có thông tin hoạt động"}
                </div>
              </div>

              {/* Card Footer */}
              <div className="authors-card-footer">
                <button
                  className="authors-view-books-btn"
                  onClick={async () => {
                    try {
                      await followAuthor(author.id);
                      alert("Đã follow tác giả thành công!");
                    } catch (err) {
                      console.error("Error following author:", err);
                      alert(err instanceof Error ? err.message : "Không thể follow tác giả");
                    }
                  }}
                >
                  Theo dõi
                </button>
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
    </div>
  );
};

export default AuthorsPage;


