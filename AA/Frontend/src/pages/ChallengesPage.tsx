import { useState, useMemo } from "react";
import Navigation from "../components/Navigation";
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
            placeholder="Tìm kiếm thử thách..."
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
            className={`tab ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
            type="button"
          >
            Đang tham gia
          </button>
          <button
            className={`tab ${activeTab === "not_joined" ? "active" : ""}`}
            onClick={() => setActiveTab("not_joined")}
            type="button"
          >
            Chưa tham gia
          </button>
          <button
            className={`tab ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
            type="button"
          >
            Đã hoàn thành
          </button>
        </div>
      </section>

      <main className="dark-page-content" style={{ padding: "24px 16px" }}>

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


