import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Group, createGroup, joinGroup, leaveGroup, getMyGroups } from "../api/backend";

interface GroupsPageProps {
  groups: Group[];
  onGroupCreated?: () => void;
}

const GroupsPage = ({ groups, onGroupCreated }: GroupsPageProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"explore" | "my-clubs">("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"members" | "activity" | "date">("members");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    topic: "",
    current_book_id: undefined as number | undefined,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loadingMyGroups, setLoadingMyGroups] = useState(false);

  // Fetch my groups to check membership
  useEffect(() => {
    const fetchMyGroups = async () => {
      setLoadingMyGroups(true);
      try {
        const myGroupsData = await getMyGroups();
        setMyGroups(myGroupsData);
      } catch (err) {
        console.error("Error fetching my groups:", err);
        // If error, just set empty array
        setMyGroups([]);
      } finally {
        setLoadingMyGroups(false);
      }
    };

    fetchMyGroups();
  }, []);

  // Check if user is member of a group
  const isMember = (groupId: number): boolean => {
    return myGroups.some(g => g.id === groupId);
  };

  // Filter groups based on active tab
  const groupsToShow = activeTab === "my-clubs" ? myGroups : groups;

  const filteredGroups = groupsToShow.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (group.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (sortBy === "members") {
      return (b.members_count || 0) - (a.members_count || 0);
    }
    // For activity and date, just use members_count as placeholder
    return (b.members_count || 0) - (a.members_count || 0);
  });

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên câu lạc bộ");
      return;
    }

    setIsCreating(true);
    try {
      await createGroup({
        name: formData.name,
        description: formData.description || undefined,
        topic: formData.topic || undefined,
        current_book_id: formData.current_book_id || undefined,
      });
      alert("Đã tạo câu lạc bộ thành công!");
      setShowCreateModal(false);
      setFormData({ name: "", description: "", topic: "", current_book_id: undefined });
      if (onGroupCreated) {
        onGroupCreated();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error("Error creating group:", err);
      alert(err instanceof Error ? err.message : "Không thể tạo câu lạc bộ");
    } finally {
      setIsCreating(false);
    }
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
          <button className="primary-btn" onClick={() => setShowCreateModal(true)}>+ Tạo Câu lạc bộ</button>
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
      {loadingMyGroups && activeTab === "my-clubs" ? (
        <div style={{
          textAlign: "center",
          padding: "80px 20px",
          color: "#94a3b8"
        }}>
          <div style={{ fontSize: "24px", marginBottom: "12px" }}>⏳</div>
          <p style={{ fontSize: "16px" }}>Đang tải...</p>
        </div>
      ) : sortedGroups.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "80px 20px",
          color: "#94a3b8"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>👥</div>
          <h3 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, margin: "0 0 12px" }}>
            {activeTab === "my-clubs" ? "Chưa tham gia câu lạc bộ nào" : "Chưa có câu lạc bộ nào"}
          </h3>
          <p style={{ fontSize: "16px", margin: "0 0 32px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
            {activeTab === "my-clubs" 
              ? "Tham gia các câu lạc bộ để xem chúng ở đây"
              : "Tạo hoặc tham gia câu lạc bộ đọc sách để kết nối với bạn bè"
            }
          </p>
        </div>
      ) : (
        <div className="groups-grid">
          {sortedGroups.map((group) => (
          <div 
            key={group.id} 
            className="groups-club-card"
            onClick={() => navigate(`/groups/${group.id}`)}
            style={{ cursor: "pointer" }}
          >
            <div
              className="groups-club-cover"
              style={{
                backgroundImage: `url(${group.cover_url || "https://via.placeholder.com/300x400"})`
              }}
            />
            <div className="groups-club-content">
              <p className="groups-club-name">{group.name}</p>
              {group.current_book && (
                <p className="groups-club-book">Sách đang đọc: {typeof group.current_book === 'object' ? group.current_book.title : group.current_book}</p>
              )}
              <div className="groups-club-members">
                <span className="groups-club-icon">👥</span>
                <span>{group.members_count || 0} thành viên</span>
              </div>
              {isMember(typeof group.id === 'number' ? group.id : Number(group.id)) ? (
                <button
                  className="groups-club-leave-btn"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm("Bạn có chắc chắn muốn rời câu lạc bộ này?")) {
                      return;
                    }
                    try {
                      const groupId = typeof group.id === 'number' ? group.id : Number(group.id);
                      await leaveGroup(groupId);
                      alert("Đã rời câu lạc bộ thành công!");
                      // Refresh my groups
                      const myGroupsData = await getMyGroups();
                      setMyGroups(myGroupsData);
                      // Reload page to update groups list
                      window.location.reload();
                    } catch (err) {
                      console.error("Error leaving group:", err);
                      alert(err instanceof Error ? err.message : "Không thể rời câu lạc bộ");
                    }
                  }}
                >
                  Rời nhóm
                </button>
              ) : (
                <button
                  className="groups-club-join-btn"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const groupId = typeof group.id === 'number' ? group.id : Number(group.id);
                      await joinGroup(groupId);
                      alert("Đã tham gia câu lạc bộ thành công!");
                      // Refresh my groups
                      const myGroupsData = await getMyGroups();
                      setMyGroups(myGroupsData);
                      // Reload page to update groups list
                      window.location.reload();
                    } catch (err) {
                      console.error("Error joining group:", err);
                      alert(err instanceof Error ? err.message : "Không thể tham gia câu lạc bộ");
                    }
                  }}
                >
                  Tham gia
                </button>
              )}
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              backgroundColor: "#1e293b",
              borderRadius: "16px",
              padding: "32px",
              width: "90%",
              maxWidth: "500px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>
              Tạo Câu lạc bộ mới
            </h2>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                Tên câu lạc bộ <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên câu lạc bộ"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                  fontSize: "16px",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả về câu lạc bộ"
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                  fontSize: "16px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                Chủ đề
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Ví dụ: Khoa học viễn tưởng, Lịch sử..."
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                  fontSize: "16px",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  backgroundColor: "transparent",
                  color: "#cbd5e1",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                disabled={isCreating}
              >
                Hủy
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={isCreating || !formData.name.trim()}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: isCreating || !formData.name.trim() ? "#475569" : "#13a4ec",
                  color: "white",
                  cursor: isCreating || !formData.name.trim() ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                {isCreating ? "Đang tạo..." : "Tạo Câu lạc bộ"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default GroupsPage;


