import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { 
  Group, getGroup, joinGroup, leaveGroup, getMyGroups, getCurrentUser,
  GroupMember, getGroupMembers,
  GroupDiscussion, getGroupDiscussions, createGroupDiscussion, deleteGroupDiscussion,
  GroupSchedule, getGroupSchedules, createGroupSchedule, updateGroupSchedule, deleteGroupSchedule,
  GroupEvent, getGroupEvents, createGroupEvent, updateGroupEvent, deleteGroupEvent
} from "../api/backend";

const GroupDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isCheckingMember, setIsCheckingMember] = useState(true);
  const [activeTab, setActiveTab] = useState<"discussion" | "schedule" | "members" | "events">("discussion");
  
  // Current user info
  const [currentUser, setCurrentUser] = useState<{ id: number; role?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Discussion state
  const [discussions, setDiscussions] = useState<GroupDiscussion[]>([]);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  
  // Members state
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  // Schedule state
  const [schedules, setSchedules] = useState<GroupSchedule[]>([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<GroupSchedule | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ title: "", description: "", scheduled_date: "" });
  
  // Event state
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GroupEvent | null>(null);
  const [eventForm, setEventForm] = useState({ title: "", description: "", event_date: "", location: "" });

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

        // Get current user
        try {
          const user = await getCurrentUser();
          setCurrentUser(user);
          // Check if user is group creator or admin
          setIsAdmin(groupData.created_by === user.id || user.role === "admin");
        } catch (err) {
          console.error("Error getting current user:", err);
        }

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

  // Load discussions when tab changes
  useEffect(() => {
    if (activeTab === "discussion" && id) {
      loadDiscussions();
    } else if (activeTab === "members" && id) {
      loadMembers();
    } else if (activeTab === "schedule" && id) {
      loadSchedules();
    } else if (activeTab === "events" && id) {
      loadEvents();
    }
  }, [activeTab, id]);

  const loadDiscussions = async () => {
    try {
      const data = await getGroupDiscussions(Number(id));
      setDiscussions(data);
    } catch (err) {
      console.error("Error loading discussions:", err);
    }
  };

  const loadMembers = async () => {
    try {
      setLoadingMembers(true);
      const data = await getGroupMembers(Number(id));
      setMembers(data);
    } catch (err) {
      console.error("Error loading members:", err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const data = await getGroupSchedules(Number(id));
      setSchedules(data);
    } catch (err) {
      console.error("Error loading schedules:", err);
    }
  };

  const loadEvents = async () => {
    try {
      const data = await getGroupEvents(Number(id));
      setEvents(data);
    } catch (err) {
      console.error("Error loading events:", err);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !id) return;
    
    try {
      setPostingComment(true);
      await createGroupDiscussion(Number(id), newComment.trim());
      setNewComment("");
      await loadDiscussions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể đăng bình luận");
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (discussionId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    
    try {
      await deleteGroupDiscussion(Number(id), discussionId);
      await loadDiscussions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể xóa bình luận");
    }
  };

  const handleSaveSchedule = async () => {
    if (!scheduleForm.title.trim() || !scheduleForm.scheduled_date || !id) return;
    
    try {
      if (editingSchedule) {
        await updateGroupSchedule(Number(id), editingSchedule.id, scheduleForm);
      } else {
        await createGroupSchedule(Number(id), scheduleForm);
      }
      setShowScheduleForm(false);
      setEditingSchedule(null);
      setScheduleForm({ title: "", description: "", scheduled_date: "" });
      await loadSchedules();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể lưu lịch trình");
    }
  };

  const handleEditSchedule = (schedule: GroupSchedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      title: schedule.title,
      description: schedule.description || "",
      scheduled_date: schedule.scheduled_date.slice(0, 16)
    });
    setShowScheduleForm(true);
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch trình này?")) return;
    
    try {
      await deleteGroupSchedule(Number(id), scheduleId);
      await loadSchedules();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể xóa lịch trình");
    }
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title.trim() || !eventForm.event_date || !id) return;
    
    try {
      if (editingEvent) {
        await updateGroupEvent(Number(id), editingEvent.id, eventForm);
      } else {
        await createGroupEvent(Number(id), eventForm);
      }
      setShowEventForm(false);
      setEditingEvent(null);
      setEventForm({ title: "", description: "", event_date: "", location: "" });
      await loadEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể lưu sự kiện");
    }
  };

  const handleEditEvent = (event: GroupEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || "",
      event_date: event.event_date.slice(0, 16),
      location: event.location || ""
    });
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) return;
    
    try {
      await deleteGroupEvent(Number(id), eventId);
      await loadEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể xóa sự kiện");
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
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
                  {isAdmin && (
                    <span style={{
                      background: "rgba(234, 179, 8, 0.2)",
                      color: "#eab308",
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: "4px"
                    }}>
                      👑 Quản trị viên
                    </span>
                  )}
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
          {/* Discussion Tab */}
          {activeTab === "discussion" && (
            <div style={{
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "16px",
              padding: "32px"
            }}>
              <h2 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>
                💬 Thảo luận
              </h2>
              
              {/* Comment Form */}
              {isMember ? (
                <div style={{ marginBottom: "24px" }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận của bạn..."
                    style={{
                      width: "100%",
                      minHeight: "100px",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "#e2e8f0",
                      fontSize: "14px",
                      resize: "vertical",
                      marginBottom: "12px"
                    }}
                  />
                  <button
                    onClick={handlePostComment}
                    disabled={!newComment.trim() || postingComment}
                    style={{
                      padding: "10px 24px",
                      borderRadius: "8px",
                      background: newComment.trim() ? "#13a4ec" : "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      border: "none",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: newComment.trim() ? "pointer" : "not-allowed",
                      opacity: postingComment ? 0.7 : 1
                    }}
                  >
                    {postingComment ? "Đang đăng..." : "Đăng bình luận"}
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: "16px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                  marginBottom: "24px",
                  textAlign: "center",
                  color: "#94a3b8"
                }}>
                  Tham gia nhóm để có thể bình luận
                </div>
              )}
              
              {/* Comments List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {discussions.length === 0 ? (
                  <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>
                    Chưa có bình luận nào. Hãy là người đầu tiên thảo luận!
                  </p>
                ) : (
                  discussions.map((discussion) => (
                    <div
                      key={discussion.id}
                      style={{
                        padding: "16px",
                        background: "rgba(255, 255, 255, 0.03)",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.06)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #13a4ec, #667eea)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "16px"
                          }}>
                            {discussion.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "14px" }}>
                              {discussion.user.name}
                            </div>
                            <div style={{ color: "#64748b", fontSize: "12px" }}>
                              {formatRelativeTime(discussion.created_at)}
                            </div>
                          </div>
                        </div>
                        {(currentUser?.id === discussion.user_id || isAdmin) && (
                          <button
                            onClick={() => handleDeleteComment(discussion.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              fontSize: "12px",
                              padding: "4px 8px"
                            }}
                          >
                            🗑️ Xóa
                          </button>
                        )}
                      </div>
                      <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                        {discussion.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === "schedule" && (
            <div style={{
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "16px",
              padding: "32px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, margin: 0 }}>
                  📅 Lịch trình
                </h2>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditingSchedule(null);
                      setScheduleForm({ title: "", description: "", scheduled_date: "" });
                      setShowScheduleForm(true);
                    }}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      background: "#13a4ec",
                      color: "#fff",
                      border: "none",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    + Thêm lịch trình
                  </button>
                )}
              </div>
              
              {/* Schedule Form Modal */}
              {showScheduleForm && (
                <div style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000
                }}>
                  <div style={{
                    background: "#1e293b",
                    borderRadius: "16px",
                    padding: "32px",
                    width: "100%",
                    maxWidth: "500px"
                  }}>
                    <h3 style={{ color: "#e2e8f0", marginBottom: "24px" }}>
                      {editingSchedule ? "Sửa lịch trình" : "Thêm lịch trình mới"}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <input
                        type="text"
                        placeholder="Tiêu đề"
                        value={scheduleForm.title}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "#e2e8f0",
                          fontSize: "14px"
                        }}
                      />
                      <textarea
                        placeholder="Mô tả (tùy chọn)"
                        value={scheduleForm.description}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "#e2e8f0",
                          fontSize: "14px",
                          minHeight: "80px",
                          resize: "vertical"
                        }}
                      />
                      <input
                        type="datetime-local"
                        value={scheduleForm.scheduled_date}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_date: e.target.value })}
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "#e2e8f0",
                          fontSize: "14px"
                        }}
                      />
                      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                        <button
                          onClick={handleSaveSchedule}
                          style={{
                            flex: 1,
                            padding: "12px",
                            borderRadius: "8px",
                            background: "#13a4ec",
                            color: "#fff",
                            border: "none",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          {editingSchedule ? "Cập nhật" : "Tạo"}
                        </button>
                        <button
                          onClick={() => {
                            setShowScheduleForm(false);
                            setEditingSchedule(null);
                          }}
                          style={{
                            flex: 1,
                            padding: "12px",
                            borderRadius: "8px",
                            background: "rgba(255, 255, 255, 0.1)",
                            color: "#fff",
                            border: "none",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Schedules List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {schedules.length === 0 ? (
                  <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>
                    Chưa có lịch trình nào.
                  </p>
                ) : (
                  schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      style={{
                        padding: "16px",
                        background: "rgba(255, 255, 255, 0.03)",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "16px", marginBottom: "4px" }}>
                          {schedule.title}
                        </div>
                        {schedule.description && (
                          <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>
                            {schedule.description}
                          </div>
                        )}
                        <div style={{ color: "#13a4ec", fontSize: "13px" }}>
                          📅 {formatDate(schedule.scheduled_date)}
                        </div>
                      </div>
                      {isAdmin && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleEditSchedule(schedule)}
                            style={{
                              padding: "8px 12px",
                              borderRadius: "6px",
                              background: "rgba(255, 255, 255, 0.1)",
                              color: "#fff",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            style={{
                              padding: "8px 12px",
                              borderRadius: "6px",
                              background: "rgba(239, 68, 68, 0.2)",
                              color: "#ef4444",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <div style={{
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "16px",
              padding: "32px"
            }}>
              <h2 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>
                👥 Thành viên ({group.members_count || 0})
              </h2>
              
              {loadingMembers ? (
                <p style={{ color: "#94a3b8", textAlign: "center" }}>Đang tải...</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
                  {members.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        padding: "16px",
                        background: "rgba(255, 255, 255, 0.03)",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                      }}
                    >
                      <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #13a4ec, #667eea)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "18px",
                        flexShrink: 0
                      }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          color: "#e2e8f0", 
                          fontWeight: 600, 
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          {member.name}
                          {group.created_by === member.id && (
                            <span style={{
                              background: "rgba(234, 179, 8, 0.2)",
                              color: "#eab308",
                              fontSize: "10px",
                              padding: "2px 6px",
                              borderRadius: "4px"
                            }}>
                              👑 Admin
                            </span>
                          )}
                        </div>
                        <div style={{ 
                          color: "#64748b", 
                          fontSize: "12px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {member.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div style={{
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "16px",
              padding: "32px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, margin: 0 }}>
                  🎉 Sự kiện
                </h2>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditingEvent(null);
                      setEventForm({ title: "", description: "", event_date: "", location: "" });
                      setShowEventForm(true);
                    }}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      background: "#13a4ec",
                      color: "#fff",
                      border: "none",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    + Thêm sự kiện
                  </button>
                )}
              </div>
              
              {/* Event Form Modal */}
              {showEventForm && (
                <div style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000
                }}>
                  <div style={{
                    background: "#1e293b",
                    borderRadius: "16px",
                    padding: "32px",
                    width: "100%",
                    maxWidth: "500px"
                  }}>
                    <h3 style={{ color: "#e2e8f0", marginBottom: "24px" }}>
                      {editingEvent ? "Sửa sự kiện" : "Thêm sự kiện mới"}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <input
                        type="text"
                        placeholder="Tiêu đề"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "#e2e8f0",
                          fontSize: "14px"
                        }}
                      />
                      <textarea
                        placeholder="Mô tả (tùy chọn)"
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "#e2e8f0",
                          fontSize: "14px",
                          minHeight: "80px",
                          resize: "vertical"
                        }}
                      />
                      <input
                        type="datetime-local"
                        value={eventForm.event_date}
                        onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "#e2e8f0",
                          fontSize: "14px"
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Địa điểm (tùy chọn)"
                        value={eventForm.location}
                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "#e2e8f0",
                          fontSize: "14px"
                        }}
                      />
                      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                        <button
                          onClick={handleSaveEvent}
                          style={{
                            flex: 1,
                            padding: "12px",
                            borderRadius: "8px",
                            background: "#13a4ec",
                            color: "#fff",
                            border: "none",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          {editingEvent ? "Cập nhật" : "Tạo"}
                        </button>
                        <button
                          onClick={() => {
                            setShowEventForm(false);
                            setEditingEvent(null);
                          }}
                          style={{
                            flex: 1,
                            padding: "12px",
                            borderRadius: "8px",
                            background: "rgba(255, 255, 255, 0.1)",
                            color: "#fff",
                            border: "none",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Events List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {events.length === 0 ? (
                  <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>
                    Chưa có sự kiện nào.
                  </p>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      style={{
                        padding: "20px",
                        background: "rgba(255, 255, 255, 0.03)",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.06)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "18px", marginBottom: "8px" }}>
                            🎉 {event.title}
                          </div>
                          {event.description && (
                            <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "12px", lineHeight: "1.5" }}>
                              {event.description}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                            <div style={{ color: "#13a4ec", fontSize: "13px" }}>
                              📅 {formatDate(event.event_date)}
                            </div>
                            {event.location && (
                              <div style={{ color: "#10b981", fontSize: "13px" }}>
                                📍 {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                        {isAdmin && (
                          <div style={{ display: "flex", gap: "8px", marginLeft: "16px" }}>
                            <button
                              onClick={() => handleEditEvent(event)}
                              style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                background: "rgba(255, 255, 255, 0.1)",
                                color: "#fff",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "12px"
                              }}
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                background: "rgba(239, 68, 68, 0.2)",
                                color: "#ef4444",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "12px"
                              }}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

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
