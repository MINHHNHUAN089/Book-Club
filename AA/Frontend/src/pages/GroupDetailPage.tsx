import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Group, getGroup, joinGroup, leaveGroup, getMyGroups } from "../api/backend";

const GroupDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isCheckingMember, setIsCheckingMember] = useState(true);
  const [activeTab, setActiveTab] = useState<"discussion" | "schedule" | "members" | "events">("discussion");

  useEffect(() => {
    const loadGroup = async () => {
      if (!id) {
        setError("ID câu lạc bộ không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const groupData = await getGroup(Number(id));
        setGroup(groupData);

        // Check if user is a member
        try {
          const myGroups = await getMyGroups();
          setIsMember(myGroups.some(g => g.id === groupData.id));
        } catch (err) {
          console.error("Error checking membership:", err);
          setIsMember(false);
        } finally {
          setIsCheckingMember(false);
        }
      } catch (err) {
        console.error("Error loading group:", err);
        setError(err instanceof Error ? err.message : "Không thể tải thông tin câu lạc bộ");
      } finally {
        setLoading(false);
      }
    };

    loadGroup();
  }, [id]);

  const handleJoin = async () => {
    if (!group || !id) return;

    try {
      await joinGroup(Number(id));
      setIsMember(true);
      const updatedGroup = await getGroup(Number(id));
      setGroup(updatedGroup);
      alert("Đã tham gia câu lạc bộ thành công!");
    } catch (err) {
      console.error("Error joining group:", err);
      alert(err instanceof Error ? err.message : "Không thể tham gia câu lạc bộ");
    }
  };

  const handleLeave = async () => {
    if (!group || !id) return;

    if (!confirm("Bạn có chắc chắn muốn rời câu lạc bộ này?")) {
      return;
    }

    try {
      await leaveGroup(Number(id));
      setIsMember(false);
      const updatedGroup = await getGroup(Number(id));
      setGroup(updatedGroup);
      alert("Đã rời câu lạc bộ thành công!");
    } catch (err) {
      console.error("Error leaving group:", err);
      alert(err instanceof Error ? err.message : "Không thể rời câu lạc bộ");
    }
  };

  if (loading || isCheckingMember) {
    return (
      <div className="dark-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ color: "#e2e8f0", fontSize: "18px" }}>Đang tải...</div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="dark-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#fca5a5", fontSize: "18px", marginBottom: "16px" }}>Lỗi: {error || "Không tìm thấy câu lạc bộ"}</div>
          <button
            className="primary-btn"
            onClick={() => navigate("/groups")}
            style={{ padding: "10px 20px" }}
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const currentBookTitle = group.current_book 
    ? (typeof group.current_book === 'object' ? group.current_book.title : group.current_book)
    : "Chưa có sách";

  const heroBackground = group.cover_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAU2KHLOwxZRsk-snK2trnLJW2OU3Jnv9kfnDHS-F5Iu1DTcjMcpBIPQHpgadmNj-U7X1LOw_VbBDOwEX7e5xd7qeEEyiI6n7bB4tqaI_MAxy9pugw6seB0ahNNU48ZDUbzpzUeJh-mWLIYLQAeByLpEKWLJgQlx0SVdKDlYhWdzpOBpkSBGCxm0mnNyUc2FRwuMaA3TvjIpyjZx0NsFZV-QTpfrsPTuUtVtgjtd9dwkfKkUDKb5kdRL9y0XT7hpCsy78kI9QWbk7Eo";

  return (
    <div className="dark-page" style={{ minHeight: "100vh" }}>
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

      {/* Hero Section */}
      <div style={{ padding: "20px 40px", maxWidth: "1440px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <button
            onClick={() => navigate("/groups")}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px"
            }}
          >
            ← Quay lại
          </button>

          <div style={{
            borderRadius: "12px",
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
          }}>
            {/* Hero Image & Gradient */}
            <div style={{
              minHeight: "400px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              backgroundImage: `linear-gradient(180deg, rgba(16, 28, 34, 0.2) 0%, rgba(16, 28, 34, 0.95) 100%), url(${heroBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              padding: "40px",
              justifyContent: "flex-end",
              position: "relative"
            }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                width: "100%",
                maxWidth: "800px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{
                    background: "rgba(19, 164, 236, 0.2)",
                    color: "#13a4ec",
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "4px 8px",
                    borderRadius: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    Câu lạc bộ ưu tú
                  </span>
                  <span style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    🌐 Công khai
                  </span>
                </div>
                <h1 style={{
                  color: "#fff",
                  fontSize: "48px",
                  fontWeight: 900,
                  lineHeight: "1.2",
                  letterSpacing: "-0.02em",
                  margin: 0
                }}>
                  {group.name}
                </h1>
                <p style={{
                  color: "#d1d5db",
                  fontSize: "16px",
                  lineHeight: "1.5",
                  maxWidth: "600px",
                  margin: 0
                }}>
                  {group.description || "Nơi hội tụ những tâm hồn yêu thích đọc sách. Chúng ta cùng nhau khám phá thế giới qua từng trang sách."}
                </p>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "8px"
                }}>
                  <div style={{
                    display: "flex",
                    gap: "-12px",
                    marginRight: "8px"
                  }}>
                    {/* Member avatars placeholder */}
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "2px solid #101c22",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      color: "#fff",
                      fontWeight: 600
                    }}>
                      +{Math.max(0, (group.members_count || 1) - 3)}
                    </div>
                  </div>
                  <span style={{ color: "#9ca3af", fontSize: "14px" }}>
                    {group.members_count || 0} thành viên
                  </span>
                </div>
              </div>
              <div style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap"
              }}>
                {!isMember ? (
                  <button
                    onClick={handleJoin}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      background: "#13a4ec",
                      color: "#fff",
                      border: "none",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 4px 6px rgba(19, 164, 236, 0.2)"
                    }}
                  >
                    <span>👤</span>
                    <span>Tham gia</span>
                  </button>
                ) : (
                  <button
                    onClick={handleLeave}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      backdropFilter: "blur(4px)"
                    }}
                  >
                    <span>⚙️</span>
                    <span>Rời nhóm</span>
                  </button>
                )}
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    cursor: "pointer",
                    backdropFilter: "blur(4px)"
                  }}
                >
                  ⚙️
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            marginTop: "24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <div style={{
              display: "flex",
              gap: "32px",
              overflowX: "auto",
              paddingBottom: "4px"
            }}>
              {[
                { key: "discussion", label: "Thảo luận", icon: "💬" },
                { key: "schedule", label: "Lịch trình", icon: "📅" },
                { key: "members", label: "Thành viên", icon: "👥" },
                { key: "events", label: "Sự kiện", icon: "🎉" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    borderBottom: activeTab === tab.key ? "3px solid #13a4ec" : "3px solid transparent",
                    color: activeTab === tab.key ? "#e2e8f0" : "#94a3b8",
                    paddingBottom: "12px",
                    paddingLeft: "4px",
                    paddingRight: "4px",
                    background: "transparent",
                    borderTop: "none",
                    borderLeft: "none",
                    borderRight: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    transition: "all 0.2s"
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "32px",
          paddingBottom: "80px"
        }}>
          {/* For now, show simple content based on active tab */}
          <div style={{
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "16px",
            padding: "32px"
          }}>
            {activeTab === "discussion" && (
              <div>
                <h2 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>
                  Thảo luận
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "16px" }}>
                  Tính năng thảo luận sẽ được phát triển trong tương lai.
                </p>
              </div>
            )}
            {activeTab === "schedule" && (
              <div>
                <h2 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>
                  Lịch trình
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "16px" }}>
                  Lịch trình hoạt động của câu lạc bộ sẽ được hiển thị ở đây.
                </p>
              </div>
            )}
            {activeTab === "members" && (
              <div>
                <h2 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>
                  Thành viên ({group.members_count || 0})
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "16px" }}>
                  Danh sách thành viên sẽ được hiển thị ở đây.
                </p>
              </div>
            )}
            {activeTab === "events" && (
              <div>
                <h2 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>
                  Sự kiện
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "16px" }}>
                  Các sự kiện sắp tới của câu lạc bộ sẽ được hiển thị ở đây.
                </p>
              </div>
            )}
          </div>

          {/* Current Book Card - Sidebar style */}
          {group.current_book && (
            <div style={{
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "16px",
              padding: "20px"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px"
              }}>
                <h3 style={{ color: "#e2e8f0", fontSize: "18px", fontWeight: 700 }}>Đang đọc</h3>
                <span style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#13a4ec",
                  background: "rgba(19, 164, 236, 0.1)",
                  padding: "4px 8px",
                  borderRadius: "4px"
                }}>
                  Tháng {new Date().getMonth() + 1}
                </span>
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{
                  width: "96px",
                  height: "144px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.1)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontSize: "32px"
                }}>
                  📖
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    color: "#e2e8f0",
                    fontSize: "18px",
                    fontWeight: 700,
                    marginBottom: "4px"
                  }}>
                    {currentBookTitle}
                  </h4>
                  <p style={{
                    color: "#94a3b8",
                    fontSize: "14px"
                  }}>
                    {typeof group.current_book === 'object' && group.current_book.authors
                      ? group.current_book.authors.map((a: any) => a.name).join(", ")
                      : "Tác giả"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default GroupDetailPage;
