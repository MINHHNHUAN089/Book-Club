import { useState, useMemo } from "react";
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
    <div className="authors-page">
      {/* Header */}
      <header className="authors-header">
        <div className="authors-header-left">
          <div className="authors-brand">
            <div className="authors-logo">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_6_543)">
                  <path
                    d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z"
                    fill="currentColor"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_6_543">
                    <rect fill="white" height="48" width="48" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <h2 className="authors-brand-title">BookClub</h2>
          </div>
        </div>
        <div className="authors-header-right">
          <button className="authors-add-btn">+ Thêm sách</button>
          <div
            className="authors-avatar"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDF3FJbtVTxS_Xx77pIiOAPd32DJgeayGhR0bIkc2mPnP2_QnhsST40kyjrf69QI2OERzFLj2H0BJ-G6MqkhYyYmFEi51ozJqqbBy9qGzNFDgUsMZ-ef5Km8Y8aDdRunT00P5hJcWv90ADWIMWt7kwugu7Kj1sGtaAwZLmH494iRSuSlx8uHs7-zc6-rMKaoosWQ30KmzfWTzle0fnxLES_aGWYn7RyAsU6ozp-4pV6rWa7DN7Vb-zcWk3eFjKdxvqg2zAjadM1GBVt")'
            }}
          />
        </div>
      </header>

      <main className="authors-main">
        {/* Title Section */}
        <div className="authors-title-section">
          <div className="authors-title-wrapper">
            <h1 className="authors-title">Tác giả đang theo dõi</h1>
            <p className="authors-subtitle">Cập nhật mới nhất từ những tác giả bạn yêu thích</p>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="authors-controls">
          <div className="authors-search-wrapper">
            <div className="authors-search-icon">🔍</div>
            <input
              className="authors-search-input"
              type="text"
              placeholder="Tìm kiếm tác giả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="authors-tabs">
            <button
              className={`authors-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              <p>Tất cả</p>
            </button>
            <button
              className={`authors-tab ${activeTab === "new_books" ? "active" : ""}`}
              onClick={() => setActiveTab("new_books")}
            >
              <p>Có sách mới</p>
            </button>
            <button
              className={`authors-tab ${activeTab === "recent" ? "active" : ""}`}
              onClick={() => setActiveTab("recent")}
            >
              <p>Hoạt động gần đây</p>
            </button>
          </div>
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


