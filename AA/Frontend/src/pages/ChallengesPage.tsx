import { useState, useMemo } from "react";
import { Challenge } from "../types";

interface ChallengesPageProps {
  challenges: Challenge[];
}

const ChallengesPage = ({ challenges }: ChallengesPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "not_joined" | "completed">("all");

  const filteredChallenges = useMemo(() => {
    let filtered = challenges.filter((challenge) =>
      challenge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.target.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activeTab === "active") {
      filtered = filtered.filter((challenge) => challenge.status === "active");
    } else if (activeTab === "not_joined") {
      filtered = filtered.filter((challenge) => challenge.status === "not_joined");
    } else if (activeTab === "completed") {
      filtered = filtered.filter((challenge) => challenge.status === "completed");
    }

    return filtered;
  }, [challenges, searchQuery, activeTab]);

  const formatNumber = (num?: number) => {
    if (!num) return "0";
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="challenges-page">
      {/* Header */}
      <header className="challenges-header">
        <div className="challenges-header-left">
          <div className="challenges-brand">
            <div className="challenges-logo">
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
            <h2 className="challenges-brand-title">BookClub</h2>
          </div>
        </div>
        <div className="challenges-header-right">
          <div className="challenges-level-badge">
            <span className="challenges-level-icon">⚡</span>
            <span className="challenges-level-text">Level 12</span>
          </div>
          <button className="challenges-add-btn">+ Thêm sách</button>
          <div
            className="challenges-avatar"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDF3FJbtVTxS_Xx77pIiOAPd32DJgeayGhR0bIkc2mPnP2_QnhsST40kyjrf69QI2OERzFLj2H0BJ-G6MqkhYyYmFEi51ozJqqbBy9qGzNFDgUsMZ-ef5Km8Y8aDdRunT00P5hJcWv90ADWIMWt7kwugu7Kj1sGtaAwZLmH494iRSuSlx8uHs7-zc6-rMKaoosWQ30KmzfWTzle0fnxLES_aGWYn7RyAsU6ozp-4pV6rWa7DN7Vb-zcWk3eFjKdxvqg2zAjadM1GBVt")'
            }}
          />
        </div>
      </header>

      <main className="challenges-main">
        {/* Title Section */}
        <div className="challenges-title-section">
          <p className="challenges-title">Thử thách đọc</p>
        </div>

        {/* Search and Tabs */}
        <div className="challenges-controls">
          <div className="challenges-search-wrapper">
            <div className="challenges-search-icon">🔍</div>
            <input
              className="challenges-search-input"
              type="text"
              placeholder="Tìm kiếm thử thách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="challenges-tabs">
            <button
              className={`challenges-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              <p>Tất cả</p>
            </button>
            <button
              className={`challenges-tab ${activeTab === "active" ? "active" : ""}`}
              onClick={() => setActiveTab("active")}
            >
              <p>Đang tham gia</p>
            </button>
            <button
              className={`challenges-tab ${activeTab === "not_joined" ? "active" : ""}`}
              onClick={() => setActiveTab("not_joined")}
            >
              <p>Chưa tham gia</p>
            </button>
            <button
              className={`challenges-tab ${activeTab === "completed" ? "active" : ""}`}
              onClick={() => setActiveTab("completed")}
            >
              <p>Đã hoàn thành</p>
            </button>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="challenges-grid">
          {filteredChallenges.map((challenge) => {
            const progressPercent = challenge.currentCount && challenge.totalCount
              ? Math.round((challenge.currentCount / challenge.totalCount) * 100)
              : challenge.progress;

            return (
              <div
                key={challenge.id}
                className={`challenges-card ${challenge.status === "completed" ? "completed" : ""}`}
              >
                {/* Status Badge */}
                {challenge.status === "active" && (
                  <div className="challenges-status-badge active">Đang diễn ra</div>
                )}
                {challenge.status === "completed" && (
                  <div className="challenges-status-badge completed">
                    <span>🏆</span>
                    Hoàn thành
                  </div>
                )}

                {/* Cover Image */}
                <div
                  className={`challenges-cover ${challenge.status === "not_joined" ? "grayscale" : ""} ${challenge.status === "completed" ? "opacity-80" : ""}`}
                  style={{
                    backgroundImage: `url(${challenge.coverUrl || "https://via.placeholder.com/400x225"})`
                  }}
                >
                  {challenge.status === "active" && (
                    <div className="challenges-cover-gradient" />
                  )}
                </div>

                {/* Card Content */}
                <div className="challenges-content">
                  <div className="challenges-header-row">
                    <p className="challenges-name">{challenge.name}</p>
                    {challenge.status !== "completed" && challenge.xpReward && (
                      <div className="challenges-xp-badge">
                        <span className="challenges-xp-icon">⭐</span>
                        <span>{challenge.xpReward} XP</span>
                      </div>
                    )}
                    {challenge.status === "completed" && challenge.xpReward && (
                      <div className="challenges-xp-badge completed">
                        <span className="line-through">{challenge.xpReward} XP</span>
                      </div>
                    )}
                  </div>
                  <p className="challenges-description">{challenge.target}</p>

                  {/* Tags for not joined */}
                  {challenge.status === "not_joined" && challenge.tags && (
                    <div className="challenges-tags">
                      {challenge.tags.map((tag, idx) => (
                        <span key={idx} className="challenges-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Progress Bar */}
                  {challenge.status !== "not_joined" && (
                    <div className="challenges-progress-section">
                      <div className="challenges-progress-header">
                        <span className="challenges-progress-label">
                          {challenge.status === "completed" ? "Hoàn thành" : "Tiến độ"}
                        </span>
                        <span
                          className={`challenges-progress-count ${challenge.status === "completed" ? "completed" : ""}`}
                        >
                          {challenge.currentCount}/{challenge.totalCount} cuốn
                        </span>
                      </div>
                      <div className="challenges-progress-bar">
                        <div
                          className={`challenges-progress-fill ${challenge.status === "completed" ? "completed" : ""}`}
                          style={{ width: `${progressPercent}%` }}
                        >
                          {challenge.status === "active" && progressPercent > 0 && (
                            <div className="challenges-progress-dot" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  {challenge.status === "active" && (
                    <div className="challenges-stats">
                      <span className="challenges-stat">
                        <span className="challenges-stat-icon">👥</span>
                        {formatNumber(challenge.participants)} người
                      </span>
                      <span className="challenges-stat">
                        <span className="challenges-stat-icon">⏰</span>
                        {challenge.timeRemaining}
                      </span>
                    </div>
                  )}

                  {/* Badge for completed */}
                  {challenge.status === "completed" && challenge.badge && (
                    <div className="challenges-badge-section">
                      <span className="challenges-badge-icon">🏅</span>
                      <span className="challenges-badge-text">Đã nhận huy hiệu "{challenge.badge}"</span>
                    </div>
                  )}

                  {/* Join Button for not joined */}
                  {challenge.status === "not_joined" && (
                    <div className="challenges-join-section">
                      <button className="challenges-join-btn">
                        <span>Tham gia ngay</span>
                        <span className="challenges-join-arrow">→</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ChallengesPage;


