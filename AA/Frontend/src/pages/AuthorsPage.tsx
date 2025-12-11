import { useState, useMemo } from "react";
import Navigation from "../components/Navigation";
import { AuthorFollow } from "../types";

interface AuthorsPageProps {
  authors: AuthorFollow[];
}

const AuthorsPage = ({ authors }: AuthorsPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "new_books" | "recent">("all");

  const filteredAuthors = useMemo(() => {
    let filtered = authors.filter(
      (author) =>
        author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        author.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (activeTab === "new_books") {
      filtered = filtered.filter((author) => author.activity === "new_book" || author.activity === "upcoming");
    } else if (activeTab === "recent") {
      filtered = filtered.filter((author) => author.activity !== "none");
    }

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
          <div className="avatar" aria-label="User avatar" />
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
        <div className="authors-grid">
          {filteredAuthors.map((author) => (
            <div key={author.id} className="authors-card">
              {/* Author Header */}
              <div className="authors-card-header">
                <div className="authors-avatar-wrapper">
                  <div
                    className="authors-avatar-img"
                    style={{
                      backgroundImage: `url(${author.avatarUrl || "https://via.placeholder.com/64"})`
                    }}
                  />
                  {(author.activity === "new_book" || author.activity === "discussion") && (
                    <div className="authors-online-indicator" />
                  )}
                </div>
                <div className="authors-info">
                  <div className="authors-name-row">
                    <h3 className="authors-name">{author.name}</h3>
                    <button className="authors-notification-btn">
                      {author.notificationEnabled ? "🔔" : "🔕"}
                    </button>
                  </div>
                  <p className="authors-followers">{formatFollowers(author.followers)} người theo dõi</p>
                </div>
              </div>

              {/* Activity Section */}
              <div className="authors-activity">
                {author.activity === "new_book" && author.activityContent && (
                  <div className="authors-activity-book">
                    <div
                      className="authors-book-cover"
                      style={{
                        backgroundImage: `url(${author.activityContent.bookCover || "https://via.placeholder.com/48x64"})`
                      }}
                    />
                    <div className="authors-book-info">
                      <div className="authors-activity-badge new">Mới ra mắt</div>
                      <p className="authors-book-title">{author.activityContent.title}</p>
                      <p className="authors-book-desc">{author.activityContent.description}</p>
                      <p className="authors-activity-time">{author.activityContent.time}</p>
                    </div>
                  </div>
                )}

                {author.activity === "discussion" && author.activityContent && (
                  <div className="authors-activity-discussion">
                    <div className="authors-discussion-header">
                      <span className="authors-discussion-icon">💬</span>
                      <span className="authors-discussion-label">Thảo luận mới</span>
                      <span className="authors-activity-time">{author.activityContent.time}</span>
                    </div>
                    <p className="authors-discussion-text">{author.activityContent.description}</p>
                    <div className="authors-activity-stats">
                      <span>❤️ {formatFollowers(author.activityContent.likes)}</span>
                      <span>💬 {formatFollowers(author.activityContent.comments)}</span>
                    </div>
                    <button className="authors-join-btn">Tham gia</button>
                  </div>
                )}

                {author.activity === "upcoming" && author.activityContent && (
                  <div className="authors-activity-book">
                    <div className="authors-book-info">
                      <div className="authors-activity-badge upcoming">Sắp phát hành</div>
                      <p className="authors-book-title">{author.activityContent.title}</p>
                      <p className="authors-book-desc">{author.activityContent.description}</p>
                    </div>
                    <button className="authors-preorder-btn">
                      <span>📖</span>
                      Đặt trước
                    </button>
                  </div>
                )}

                {author.activity === "award" && author.activityContent && (
                  <div className="authors-activity-discussion">
                    <div className="authors-discussion-header">
                      <span className="authors-discussion-icon">🏆</span>
                      <span className="authors-discussion-label">Giải thưởng</span>
                      <span className="authors-activity-time">{author.activityContent.time}</span>
                    </div>
                    <p className="authors-discussion-text">{author.activityContent.description}</p>
                    <div className="authors-activity-stats">
                      <span>❤️ {formatFollowers(author.activityContent.likes)}</span>
                      <span>🔗 {formatFollowers(author.activityContent.shares)}</span>
                    </div>
                  </div>
                )}

                {author.activity === "none" && (
                  <div className="authors-activity-empty">
                    Chưa có cập nhật mới trong tuần này
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="authors-card-footer">
                {author.activity === "new_book" && (
                  <>
                    <div className="authors-avatars-stack">
                      <div className="authors-avatar-small">JD</div>
                      <div className="authors-avatar-small">AL</div>
                      <div className="authors-avatar-small">+5</div>
                    </div>
                    <button className="authors-detail-btn">Xem chi tiết</button>
                  </>
                )}
                {author.activity === "none" && (
                  <button className="authors-view-books-btn">Xem 12 sách đã xuất bản</button>
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
      </main>
    </div>
  );
};

export default AuthorsPage;


