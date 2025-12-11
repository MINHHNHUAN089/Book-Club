import { useState } from "react";
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
    <div className="groups-page">
      {/* Header */}
      <header className="groups-header">
        <div className="groups-header-left">
          <div className="groups-brand">
            <span className="groups-icon">📚</span>
            <h2 className="groups-title">Câu lạc bộ sách</h2>
          </div>
        </div>
        <div className="groups-header-right">
          <div className="groups-search-desktop">
            <div className="groups-search-icon">🔍</div>
            <input
              className="groups-search-input"
              type="text"
              placeholder="Search for clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="groups-create-btn">
            <span className="groups-create-icon">+</span>
            <span>Tạo Câu lạc bộ</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="groups-tabs-container">
        <div className="groups-tabs">
          <button
            className={`groups-tab ${activeTab === "explore" ? "active" : ""}`}
            onClick={() => setActiveTab("explore")}
          >
            <p>Khám phá</p>
          </button>
          <button
            className={`groups-tab ${activeTab === "my-clubs" ? "active" : ""}`}
            onClick={() => setActiveTab("my-clubs")}
          >
            <p>Câu lạc bộ của tôi</p>
          </button>
        </div>
      </div>

      {/* Search and Filter Chips */}
      <div className="groups-filters">
        <div className="groups-search-mobile">
          <div className="groups-search-icon">🔍</div>
          <input
            className="groups-search-input"
            type="text"
            placeholder="Tìm kiếm câu lạc bộ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="groups-filter-chips">
          <button
            className={`groups-filter-chip ${sortBy === "members" ? "active" : ""}`}
            onClick={() => setSortBy("members")}
          >
            <p>Theo số lượng thành viên</p>
            <span className="groups-filter-arrow">▼</span>
          </button>
          <button
            className={`groups-filter-chip ${sortBy === "activity" ? "active" : ""}`}
            onClick={() => setSortBy("activity")}
          >
            <p>Theo hoạt động gần đây</p>
            <span className="groups-filter-arrow">▼</span>
          </button>
          <button
            className={`groups-filter-chip ${sortBy === "date" ? "active" : ""}`}
            onClick={() => setSortBy("date")}
          >
            <p>Theo ngày tạo</p>
            <span className="groups-filter-arrow">▼</span>
          </button>
        </div>
      </div>

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


