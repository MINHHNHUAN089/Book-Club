import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Challenge as APIChallenge, UserChallenge } from "../api/backend";
import { joinChallenge, leaveChallenge, getMyChallenges } from "../api/backend";

interface ChallengesPageProps {
  challenges: APIChallenge[];
}

const ChallengesPage = ({ challenges }: ChallengesPageProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "not_joined" | "completed">("all");
  const [myChallenges, setMyChallenges] = useState<UserChallenge[]>([]);
  const [loadingMyChallenges, setLoadingMyChallenges] = useState(false);

  // Fetch my challenges to get progress
  useEffect(() => {
    const fetchMyChallenges = async () => {
      setLoadingMyChallenges(true);
      try {
        const myChallengesData = await getMyChallenges();
        setMyChallenges(myChallengesData);
      } catch (err) {
        console.error("Error fetching my challenges:", err);
        setMyChallenges([]);
      } finally {
        setLoadingMyChallenges(false);
      }
    };

    fetchMyChallenges();
  }, []);

  // Helper to get challenge progress
  const getChallengeProgress = (challengeId: number): { progress: number; completed: boolean } => {
    const myChallenge = myChallenges.find(uc => uc.challenge.id === challengeId);
    return {
      progress: myChallenge?.progress || 0,
      completed: myChallenge?.completed || false
    };
  };

  // Check if user is participating in a challenge
  const isParticipating = (challengeId: number): boolean => {
    return myChallenges.some(uc => uc.challenge.id === challengeId);
  };

  // Tính status cho mỗi challenge dựa trên thời gian và participation
  const challengesWithStatus = useMemo(() => {
    const now = new Date();
    return challenges.map((challenge) => {
      const startDate = new Date(challenge.start_date);
      const endDate = new Date(challenge.end_date);
      const { progress, completed } = getChallengeProgress(challenge.id);
      const participating = isParticipating(challenge.id);
      
      let status: "active" | "not_joined" | "completed" = "not_joined";
      
      if (completed) {
        status = "completed";
      } else if (participating) {
        // Nếu đang tham gia và trong thời gian
        if (now >= startDate && now <= endDate) {
          status = "active";
        } else if (now > endDate) {
          status = "completed"; // Đã hết hạn nhưng chưa hoàn thành
        } else {
          status = "active"; // Chưa bắt đầu nhưng đã join
        }
      } else {
        // Chưa tham gia
        if (now < startDate) {
          status = "not_joined"; // Chưa bắt đầu
        } else if (now >= startDate && now <= endDate) {
          status = "not_joined"; // Đang diễn ra nhưng chưa join
        } else {
          status = "completed"; // Đã kết thúc
        }
      }
      
      return { ...challenge, status, progress, completed };
    });
  }, [challenges, myChallenges]);

  const filteredChallenges = useMemo(() => {
    let filtered = challengesWithStatus.filter((challenge) =>
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (challenge.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activeTab === "active") {
      filtered = filtered.filter((challenge) => challenge.status === "active");
    } else if (activeTab === "not_joined") {
      filtered = filtered.filter((challenge) => challenge.status === "not_joined");
    } else if (activeTab === "completed") {
      filtered = filtered.filter((challenge) => challenge.status === "completed");
    }

    return filtered;
  }, [challengesWithStatus, searchQuery, activeTab]);

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
        {filteredChallenges.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "#94a3b8"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "24px" }}>🏆</div>
            <h3 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, margin: "0 0 12px" }}>
              Chưa có thử thách nào
            </h3>
            <p style={{ fontSize: "16px", margin: "0 0 32px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
              Tham gia các thử thách đọc sách để nhận phần thưởng và huy hiệu
            </p>
          </div>
        ) : (
          <div className="challenges-grid">
            {filteredChallenges.map((challenge) => {
            const { progress, completed } = getChallengeProgress(challenge.id);
            const progressPercent = challenge.target_books > 0 
              ? Math.min(100, (progress / challenge.target_books) * 100)
              : 0;
            const participating = isParticipating(challenge.id);

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
                    backgroundImage: `url(${challenge.cover_url || "https://via.placeholder.com/400x225"})`
                  }}
                >
                  {challenge.status === "active" && (
                    <div className="challenges-cover-gradient" />
                  )}
                </div>

                {/* Card Content */}
                <div className="challenges-content">
                  <div className="challenges-header-row">
                    <p className="challenges-name">{challenge.title}</p>
                  </div>
                  <p className="challenges-description">{challenge.description || `Đọc ${challenge.target_books} cuốn sách`}</p>

                  {/* Tags for not joined - API doesn't provide tags yet */}
                  {challenge.status === "not_joined" && (
                    <div className="challenges-tags">
                      <span className="challenges-tag">Đọc sách</span>
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
                          {progress}/{challenge.target_books} cuốn
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
                        <span className="challenges-stat-icon">📅</span>
                        {new Date(challenge.start_date).toLocaleDateString('vi-VN')} - {new Date(challenge.end_date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}

                  {/* Join/Leave Buttons */}
                  {!participating && challenge.status === "not_joined" && (
                    <div className="challenges-join-section">
                      <button
                        className="challenges-join-btn"
                        onClick={async () => {
                          try {
                            await joinChallenge(challenge.id);
                            alert("Đã tham gia thử thách thành công!");
                            // Refresh my challenges
                            const myChallengesData = await getMyChallenges();
                            setMyChallenges(myChallengesData);
                            window.location.reload();
                          } catch (err) {
                            console.error("Error joining challenge:", err);
                            alert(err instanceof Error ? err.message : "Không thể tham gia thử thách");
                          }
                        }}
                      >
                        <span>Tham gia ngay</span>
                        <span className="challenges-join-arrow">→</span>
                      </button>
                    </div>
                  )}
                  {participating && challenge.status !== "completed" && (
                    <div className="challenges-join-section">
                      <button
                        className="challenges-leave-btn"
                        onClick={async () => {
                          if (!confirm("Bạn có chắc chắn muốn rời thử thách này?")) {
                            return;
                          }
                          try {
                            await leaveChallenge(challenge.id);
                            alert("Đã rời thử thách thành công!");
                            // Refresh my challenges
                            const myChallengesData = await getMyChallenges();
                            setMyChallenges(myChallengesData);
                            window.location.reload();
                          } catch (err) {
                            console.error("Error leaving challenge:", err);
                            alert(err instanceof Error ? err.message : "Không thể rời thử thách");
                          }
                        }}
                      >
                        Rời thử thách
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ChallengesPage;


