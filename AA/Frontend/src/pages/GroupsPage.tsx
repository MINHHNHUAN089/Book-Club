import { useState } from "react";
import Navigation from "../components/Navigation";
import { ClubGroup } from "../types";

interface GroupsPageProps {
  groups: ClubGroup[];
}

const GroupsPage = ({ groups }: GroupsPageProps) => {
  const [activeTab, setActiveTab] = useState<"explore" | "my-clubs">("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"members" | "activity" | "date">("members");

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (sortBy === "members") {
      return b.members - a.members;
    }
    // For activity and date, just use members as placeholder
    return b.members - a.members;
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
          <div className="avatar" aria-label="User avatar" />
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
      <div className="groups-grid">
        {sortedGroups.map((group) => (
          <div key={group.id} className="groups-club-card">
            <div
              className="groups-club-cover"
              style={{
                backgroundImage: `url(${group.coverUrl || "https://via.placeholder.com/300x400"})`
              }}
            />
            <div className="groups-club-content">
              <p className="groups-club-name">{group.name}</p>
              {group.currentBook && (
                <p className="groups-club-book">Sách đang đọc: {group.currentBook}</p>
              )}
              <div className="groups-club-members">
                <span className="groups-club-icon">👥</span>
                <span>{group.members} thành viên</span>
              </div>
              <button className="groups-club-join-btn">Tham gia</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupsPage;


