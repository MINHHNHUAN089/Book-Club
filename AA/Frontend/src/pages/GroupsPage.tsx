import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Group } from "../api/backend";
import { joinGroup } from "../api/backend";

interface GroupsPageProps {
  groups: Group[];
}

const GroupsPage = ({ groups }: GroupsPageProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"explore" | "my-clubs">("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"members" | "activity" | "date">("members");

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (group.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (sortBy === "members") {
      return (b.member_count || 0) - (a.member_count || 0);
    }
    // For activity and date, just use member_count as placeholder
    return (b.member_count || 0) - (a.member_count || 0);
  });

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
          <button className="primary-btn">+ Tạo Câu lạc bộ</button>
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
            placeholder="Tìm kiếm câu lạc bộ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="tabs">
          <button
            className={`tab ${activeTab === "explore" ? "active" : ""}`}
            onClick={() => setActiveTab("explore")}
            type="button"
          >
            Khám phá
          </button>
          <button
            className={`tab ${activeTab === "my-clubs" ? "active" : ""}`}
            onClick={() => setActiveTab("my-clubs")}
            type="button"
          >
            Câu lạc bộ của tôi
          </button>
        </div>
      </section>

      {/* Club Grid */}
      {sortedGroups.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "80px 20px",
          color: "#94a3b8"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>👥</div>
          <h3 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, margin: "0 0 12px" }}>
            Chưa có câu lạc bộ nào
          </h3>
          <p style={{ fontSize: "16px", margin: "0 0 32px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
            Tạo hoặc tham gia câu lạc bộ đọc sách để kết nối với bạn bè
          </p>
        </div>
      ) : (
        <div className="groups-grid">
          {sortedGroups.map((group) => (
          <div key={group.id} className="groups-club-card">
            <div
              className="groups-club-cover"
              style={{
                backgroundImage: `url(${group.cover_url || "https://via.placeholder.com/300x400"})`
              }}
            />
            <div className="groups-club-content">
              <p className="groups-club-name">{group.name}</p>
              {group.current_book && (
                <p className="groups-club-book">Sách đang đọc: {group.current_book}</p>
              )}
              <div className="groups-club-members">
                <span className="groups-club-icon">👥</span>
                <span>{group.member_count || 0} thành viên</span>
              </div>
              <button
                className="groups-club-join-btn"
                onClick={async () => {
                  try {
                    const groupId = typeof group.id === 'number' ? group.id : Number(group.id);
                    await joinGroup(groupId);
                    alert("Đã tham gia câu lạc bộ thành công!");
                    window.location.reload();
                  } catch (err) {
                    console.error("Error joining group:", err);
                    alert(err instanceof Error ? err.message : "Không thể tham gia câu lạc bộ");
                  }
                }}
              >
                Tham gia
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default GroupsPage;


