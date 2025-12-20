import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import {
  getCurrentUser,
  User,
  getAdminStats,
  getAllUsers,
  updateUserAdmin,
  deleteUserAdmin,
  deleteBookAdmin,
  deleteReviewAdmin,
  deleteGroupAdmin,
  deleteChallengeAdmin,
  getBooks,
  getGroups,
  getChallenges,
  Book as APIBook,
  Group,
  Challenge,
  createBook,
  updateBook,
  uploadBookFile,
  uploadBookCover,
  createGroup,
  getHeaders,
  getAllReviewsAdmin,
  AdminReview,
  Author,
  getAuthors,
  AuthorNotification,
  createAuthorNotification,
  getAuthorNotificationsAdmin,
  updateAuthorNotificationAdmin,
  deleteAuthorNotificationAdmin,
} from "../api/backend";

const AdminPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "books" | "reviews" | "groups" | "challenges" | "notifications">("dashboard");
  
  // Stats
  const [stats, setStats] = useState<any>(null);
  
  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("");
  
  // Books
  const [books, setBooks] = useState<APIBook[]>([]);
  const [bookSearch, setBookSearch] = useState("");
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<APIBook | null>(null);
  const [bookFormData, setBookFormData] = useState({
    title: "",
    author: "",
    description: "",
    cover_url: "",
    file_url: "",
    isbn: "",
    page_count: "",
    published_date: "",
  });
  const [isSavingBook, setIsSavingBook] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCover, setSelectedCover] = useState<File | null>(null);

  // Groups
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupSearch, setGroupSearch] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    description: "",
    topic: "",
    current_book_id: "",
  });
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [reviewSearch, setReviewSearch] = useState("");

  // Challenges
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeSearch, setChallengeSearch] = useState("");
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [challengeFormData, setChallengeFormData] = useState({
    title: "",
    description: "",
    target_books: "",
    start_date: "",
    end_date: "",
    cover_url: "",
    xp_reward: "",
  });
  const [isSavingChallenge, setIsSavingChallenge] = useState(false);

  // Author Notifications
  const [notifications, setNotifications] = useState<AuthorNotification[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<AuthorNotification | null>(null);
  const [notificationFormData, setNotificationFormData] = useState({
    author_id: "",
    title: "",
    content: "",
    notification_type: "new_book",
    book_id: "",
    cover_url: "",
  });
  const [isSavingNotification, setIsSavingNotification] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        setUser(userData);
        
        // Check if user is admin
        if (userData.role !== "admin") {
          alert("Bạn không có quyền truy cập trang này");
          navigate("/books");
          return;
        }
        
        // Load stats
        const statsData = await getAdminStats();
        setStats(statsData);
        
        // Load users
        const usersData = await getAllUsers();
        setUsers(usersData);
        
        // Load books
        const booksData = await getBooks();
        setBooks(booksData);
      } catch (err) {
        console.error("Error loading admin data:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Load groups when groups tab is active
  useEffect(() => {
    const loadGroups = async () => {
      if (activeTab === "groups") {
        try {
          const groupsData = await getGroups();
          setGroups(groupsData);
        } catch (err) {
          console.error("Error loading groups:", err);
        }
      }
    };
    loadGroups();
  }, [activeTab]);

  // Load reviews when reviews tab is active
  useEffect(() => {
    const loadReviews = async () => {
      if (activeTab === "reviews") {
        try {
          const reviewsData = await getAllReviewsAdmin();
          setReviews(reviewsData);
        } catch (err) {
          console.error("Error loading reviews:", err);
        }
      }
    };
    loadReviews();
  }, [activeTab]);

  // Load challenges when challenges tab is active
  useEffect(() => {
    const loadChallenges = async () => {
      if (activeTab === "challenges") {
        try {
          const challengesData = await getChallenges();
          setChallenges(challengesData);
        } catch (err) {
          console.error("Error loading challenges:", err);
        }
      }
    };
    loadChallenges();
  }, [activeTab]);

  // Load authors and notifications when notifications tab is active
  useEffect(() => {
    const loadNotificationsData = async () => {
      if (activeTab === "notifications") {
        try {
          const [notificationsData, authorsData] = await Promise.all([
            getAuthorNotificationsAdmin(),
            getAuthors(),
          ]);
          setNotifications(notificationsData);
          setAuthors(authorsData);
        } catch (err) {
          console.error("Error loading notifications data:", err);
        }
      }
    };
    loadNotificationsData();
  }, [activeTab]);

  const handleUpdateUser = async (userId: number, data: { role?: string; is_active?: boolean }) => {
    try {
      await updateUserAdmin(userId, data);
      alert("Đã cập nhật thành công!");
      const updatedUsers = await getAllUsers(userSearch || undefined, userRoleFilter || undefined);
      setUsers(updatedUsers);
    } catch (err) {
      console.error("Error updating user:", err);
      alert(err instanceof Error ? err.message : "Không thể cập nhật");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    
    try {
      await deleteUserAdmin(userId);
      alert("Đã xóa thành công!");
      const updatedUsers = await getAllUsers(userSearch || undefined, userRoleFilter || undefined);
      setUsers(updatedUsers);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(err instanceof Error ? err.message : "Không thể xóa");
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa sách này?")) return;
    
    try {
      await deleteBookAdmin(bookId);
      alert("Đã xóa thành công!");
      const updatedBooks = await getBooks();
      setBooks(updatedBooks);
    } catch (err) {
      console.error("Error deleting book:", err);
      alert(err instanceof Error ? err.message : "Không thể xóa");
    }
  };

  const handleOpenAddBook = () => {
    setEditingBook(null);
    setBookFormData({
      title: "",
      author: "",
      description: "",
      cover_url: "",
      file_url: "",
      isbn: "",
      page_count: "",
      published_date: "",
    });
    setSelectedFile(null);
    setSelectedCover(null);
    setShowBookModal(true);
  };

  const handleOpenEditBook = (book: APIBook) => {
    setEditingBook(book);
    setBookFormData({
      title: book.title || "",
      author: book.authors && book.authors.length > 0 
        ? book.authors.map((a: any) => a.name).join(", ")
        : book.author || "",
      description: book.description || "",
      cover_url: book.cover_url || "",
      file_url: (book as any).file_url || "",
      isbn: book.isbn || "",
      page_count: book.page_count?.toString() || "",
      published_date: book.published_date || "",
    });
    setSelectedFile(null);
    setSelectedCover(null);
    setShowBookModal(true);
  };


  const handleSaveBook = async () => {
    if (!bookFormData.title.trim()) {
      alert("Vui lòng nhập tên sách");
      return;
    }

    setIsSavingBook(true);
    try {
      // Upload file nếu có file mới được chọn
      let fileUrl = bookFormData.file_url;
      if (selectedFile) {
        setUploadingFile(true);
        try {
          const fileResult = await uploadBookFile(selectedFile);
          fileUrl = fileResult.url;
        } catch (err) {
          console.error("Error uploading file:", err);
          alert("Lỗi khi upload file sách. Vui lòng thử lại.");
          setIsSavingBook(false);
          setUploadingFile(false);
          return;
        } finally {
          setUploadingFile(false);
        }
      }

      // Upload cover nếu có cover mới được chọn
      let coverUrl = bookFormData.cover_url;
      if (selectedCover) {
        setUploadingCover(true);
        try {
          const coverResult = await uploadBookCover(selectedCover);
          coverUrl = coverResult.url;
        } catch (err) {
          console.error("Error uploading cover:", err);
          alert("Lỗi khi upload ảnh bìa. Vui lòng thử lại.");
          setIsSavingBook(false);
          setUploadingCover(false);
          return;
        } finally {
          setUploadingCover(false);
        }
      }

      const bookData: any = {
        title: bookFormData.title,
        description: bookFormData.description || undefined,
        cover_url: coverUrl || undefined,
        file_url: fileUrl || undefined,
        isbn: bookFormData.isbn || undefined,
        page_count: bookFormData.page_count ? parseInt(bookFormData.page_count) : undefined,
        published_date: bookFormData.published_date || undefined,
      };

      // Handle author names
      if (bookFormData.author.trim()) {
        bookData.author_names = bookFormData.author.split(",").map(a => a.trim()).filter(Boolean);
      }

      if (editingBook) {
        await updateBook(editingBook.id, bookData);
        alert("Đã cập nhật sách thành công!");
      } else {
        await createBook(bookData);
        alert("Đã thêm sách thành công!");
      }

      setShowBookModal(false);
      setSelectedFile(null);
      setSelectedCover(null);
      const updatedBooks = await getBooks();
      setBooks(updatedBooks);
    } catch (err) {
      console.error("Error saving book:", err);
      alert(err instanceof Error ? err.message : "Không thể lưu sách");
    } finally {
      setIsSavingBook(false);
    }
  };

  const handleSearchUsers = async () => {
    try {
      const results = await getAllUsers(userSearch || undefined, userRoleFilter || undefined);
      setUsers(results);
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };

  // Group handlers
  const handleDeleteGroup = async (groupId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa câu lạc bộ này?")) return;
    
    try {
      await deleteGroupAdmin(groupId);
      alert("Đã xóa thành công!");
      const updatedGroups = await getGroups();
      setGroups(updatedGroups);
      
      // Dispatch event to notify App.tsx to reload groups
      window.dispatchEvent(new CustomEvent('groupsUpdated'));
    } catch (err) {
      console.error("Error deleting group:", err);
      alert(err instanceof Error ? err.message : "Không thể xóa");
    }
  };

  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    setGroupFormData({
      name: "",
      description: "",
      topic: "",
      current_book_id: "",
    });
    setShowGroupModal(true);
  };

  const handleOpenEditGroup = (group: Group) => {
    setEditingGroup(group);
    setGroupFormData({
      name: group.name || "",
      description: group.description || "",
      topic: group.topic || "",
      current_book_id: group.current_book_id?.toString() || "",
    });
    setShowGroupModal(true);
  };

  const handleSaveGroup = async () => {
    if (!groupFormData.name.trim()) {
      alert("Vui lòng nhập tên câu lạc bộ");
      return;
    }

    setIsSavingGroup(true);
    try {
      const groupData: any = {
        name: groupFormData.name,
        description: groupFormData.description || undefined,
        topic: groupFormData.topic || undefined,
        current_book_id: groupFormData.current_book_id ? parseInt(groupFormData.current_book_id) : undefined,
      };

      if (editingGroup) {
        // Update group using PATCH API
        const API_BASE_URL = "http://localhost:8000/api";
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/groups/${editingGroup.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(groupData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Không thể cập nhật câu lạc bộ");
        }

        alert("Đã cập nhật câu lạc bộ thành công!");
      } else {
        await createGroup(groupData);
        alert("Đã thêm câu lạc bộ thành công!");
      }

      setShowGroupModal(false);
      const updatedGroups = await getGroups();
      setGroups(updatedGroups);
      
      // Dispatch event to notify App.tsx to reload groups
      window.dispatchEvent(new CustomEvent('groupsUpdated'));
    } catch (err) {
      console.error("Error saving group:", err);
      alert(err instanceof Error ? err.message : "Không thể lưu câu lạc bộ");
    } finally {
      setIsSavingGroup(false);
    }
  };

  // Challenge handlers
  const handleDeleteChallenge = async (challengeId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa thử thách này?")) return;
    
    try {
      await deleteChallengeAdmin(challengeId);
      alert("Đã xóa thành công!");
      const updatedChallenges = await getChallenges();
      setChallenges(updatedChallenges);
      
      // Dispatch event to notify App.tsx to reload challenges
      window.dispatchEvent(new CustomEvent('challengesUpdated'));
    } catch (err) {
      console.error("Error deleting challenge:", err);
      alert(err instanceof Error ? err.message : "Không thể xóa");
    }
  };

  // Notification handlers
  const handleOpenAddNotification = async () => {
    // Ensure authors are loaded before opening modal
    if (authors.length === 0) {
      try {
        const authorsData = await getAuthors();
        setAuthors(authorsData);
      } catch (err) {
        console.error("Error loading authors:", err);
        alert("Không thể tải danh sách tác giả. Vui lòng thử lại.");
        return;
      }
    }
    
    setEditingNotification(null);
    setNotificationFormData({
      author_id: "",
      title: "",
      content: "",
      notification_type: "new_book",
      book_id: "",
      cover_url: "",
    });
    setShowNotificationModal(true);
  };

  const handleSaveNotification = async () => {
    if (!notificationFormData.author_id || !notificationFormData.title || !notificationFormData.content) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsSavingNotification(true);
    try {
      const data: any = {
        author_id: parseInt(notificationFormData.author_id),
        title: notificationFormData.title,
        content: notificationFormData.content,
        notification_type: notificationFormData.notification_type,
      };
      
      if (notificationFormData.book_id) {
        data.book_id = parseInt(notificationFormData.book_id);
      }
      if (notificationFormData.cover_url) {
        data.cover_url = notificationFormData.cover_url;
      }

      if (editingNotification) {
        await updateAuthorNotificationAdmin(editingNotification.id, data);
        alert("Đã cập nhật thông báo thành công!");
      } else {
        await createAuthorNotification(data);
        alert("Đã tạo thông báo thành công!");
      }

      setShowNotificationModal(false);
      const updatedNotifications = await getAuthorNotificationsAdmin();
      setNotifications(updatedNotifications);
    } catch (err) {
      console.error("Error saving notification:", err);
      alert(err instanceof Error ? err.message : "Không thể lưu thông báo");
    } finally {
      setIsSavingNotification(false);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return;
    
    try {
      await deleteAuthorNotificationAdmin(notificationId);
      alert("Đã xóa thành công!");
      const updatedNotifications = await getAuthorNotificationsAdmin();
      setNotifications(updatedNotifications);
    } catch (err) {
      console.error("Error deleting notification:", err);
      alert(err instanceof Error ? err.message : "Không thể xóa");
    }
  };

  const handleOpenAddChallenge = () => {
    setEditingChallenge(null);
    setChallengeFormData({
      title: "",
      description: "",
      target_books: "",
      start_date: "",
      end_date: "",
      cover_url: "",
      xp_reward: "",
    });
    setShowChallengeModal(true);
  };

  const handleOpenEditChallenge = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setChallengeFormData({
      title: challenge.title || "",
      description: challenge.description || "",
      target_books: challenge.target_books?.toString() || "",
      start_date: challenge.start_date || "",
      end_date: challenge.end_date || "",
      cover_url: challenge.cover_url || "",
      xp_reward: challenge.xp_reward?.toString() || "",
    });
    setShowChallengeModal(true);
  };

  const handleSaveChallenge = async () => {
    if (!challengeFormData.title.trim()) {
      alert("Vui lòng nhập tên thử thách");
      return;
    }

    setIsSavingChallenge(true);
    try {
      const challengeData: any = {
        title: challengeFormData.title,
        description: challengeFormData.description || undefined,
        target_books: challengeFormData.target_books ? parseInt(challengeFormData.target_books) : 0,
        start_date: challengeFormData.start_date || undefined,
        end_date: challengeFormData.end_date || undefined,
        cover_url: challengeFormData.cover_url || undefined,
        xp_reward: challengeFormData.xp_reward ? parseInt(challengeFormData.xp_reward) : undefined,
      };

      // Note: Need to implement createChallenge API in backend.ts
      // For now, using fetch directly
      const API_BASE_URL = "http://localhost:8000/api";
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/challenges`, {
        method: "POST",
        headers,
        body: JSON.stringify(challengeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Không thể lưu thử thách");
      }

      alert(editingChallenge ? "Đã cập nhật thử thách thành công!" : "Đã thêm thử thách thành công!");

      setShowChallengeModal(false);
      const updatedChallenges = await getChallenges();
      setChallenges(updatedChallenges);
      
      // Dispatch event to notify App.tsx to reload challenges
      window.dispatchEvent(new CustomEvent('challengesUpdated'));
    } catch (err) {
      console.error("Error saving challenge:", err);
      alert(err instanceof Error ? err.message : "Không thể lưu thử thách");
    } finally {
      setIsSavingChallenge(false);
    }
  };

  if (loading) {
    return (
      <div className="dark-page">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#e2e8f0" }}>
          Đang tải...
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="dark-page">
      <header className="dark-header">
        <div className="brand">
          <div className="brand-icon">📘</div>
          <div>
            <div className="brand-title">BookClub - Admin</div>
          </div>
        </div>
        <div className="header-nav">
          <Navigation />
        </div>
        <div className="header-actions">
          <div className="avatar" aria-label="User avatar" onClick={() => navigate("/user")} style={{ cursor: "pointer" }} />
        </div>
      </header>

      <main style={{ marginTop: "32px" }}>
        <div className="tabs" style={{ marginBottom: "24px" }}>
          <button
            className={`tab ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Tổng quan
          </button>
          <button
            className={`tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Người dùng
          </button>
          <button
            className={`tab ${activeTab === "books" ? "active" : ""}`}
            onClick={() => setActiveTab("books")}
          >
            Sách
          </button>
          <button
            className={`tab ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Đánh giá
          </button>
          <button
            className={`tab ${activeTab === "groups" ? "active" : ""}`}
            onClick={() => setActiveTab("groups")}
          >
            Câu lạc bộ
          </button>
          <button
            className={`tab ${activeTab === "challenges" ? "active" : ""}`}
            onClick={() => setActiveTab("challenges")}
          >
            Thử thách
          </button>
          <button
            className={`tab ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            Thông báo
          </button>
        </div>

        {activeTab === "dashboard" && stats && (
          <div>
            <h2 style={{ color: "#e2e8f0", fontSize: "28px", fontWeight: 700, marginBottom: "24px" }}>
              Tổng quan hệ thống
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
              <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Tổng người dùng</div>
                <div style={{ color: "#e2e8f0", fontSize: "32px", fontWeight: 700 }}>{stats.total_users}</div>
                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>
                  {stats.active_users} đang hoạt động
                </div>
              </div>
              <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Tổng sách</div>
                <div style={{ color: "#e2e8f0", fontSize: "32px", fontWeight: 700 }}>{stats.total_books}</div>
              </div>
              <div 
                style={{ 
                  backgroundColor: "#1e293b", 
                  padding: "24px", 
                  borderRadius: "12px", 
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onClick={() => setActiveTab("reviews")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#13a4ec";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Tổng đánh giá</div>
                <div style={{ color: "#e2e8f0", fontSize: "32px", fontWeight: 700 }}>{stats.total_reviews}</div>
                <div style={{ color: "#13a4ec", fontSize: "12px", marginTop: "4px" }}>
                  👆 Click để xem chi tiết
                </div>
              </div>
              <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Câu lạc bộ</div>
                <div style={{ color: "#e2e8f0", fontSize: "32px", fontWeight: 700 }}>{stats.total_groups}</div>
              </div>
              <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Thử thách</div>
                <div style={{ color: "#e2e8f0", fontSize: "32px", fontWeight: 700 }}>{stats.total_challenges}</div>
              </div>
              <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Admin</div>
                <div style={{ color: "#e2e8f0", fontSize: "32px", fontWeight: 700 }}>{stats.admin_users}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2 style={{ color: "#e2e8f0", fontSize: "28px", fontWeight: 700, marginBottom: "24px" }}>
              Quản lý người dùng
            </h2>
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                }}
              />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                }}
              >
                <option value="">Tất cả</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button className="primary-btn" onClick={handleSearchUsers}>
                Tìm kiếm
              </button>
            </div>
            <div style={{ backgroundColor: "#1e293b", borderRadius: "12px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>ID</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Tên</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Email</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Vai trò</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Trạng thái</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "16px", color: "#e2e8f0" }}>{u.id}</td>
                      <td style={{ padding: "16px", color: "#e2e8f0" }}>{u.name}</td>
                      <td style={{ padding: "16px", color: "#e2e8f0" }}>{u.email}</td>
                      <td style={{ padding: "16px" }}>
                        <select
                          value={u.role || "user"}
                          onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            backgroundColor: "#0f172a",
                            color: "#e2e8f0",
                          }}
                          disabled={u.id === user.id}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <select
                          value={u.is_active ? "active" : "inactive"}
                          onChange={(e) => handleUpdateUser(u.id, { is_active: e.target.value === "active" })}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            backgroundColor: "#0f172a",
                            color: "#e2e8f0",
                          }}
                          disabled={u.id === user.id}
                        >
                          <option value="active">Hoạt động</option>
                          <option value="inactive">Vô hiệu hóa</option>
                        </select>
                      </td>
                      <td style={{ padding: "16px" }}>
                        {u.id !== user.id && (
                          <button
                            className="secondary-btn"
                            onClick={() => handleDeleteUser(u.id)}
                            style={{ padding: "6px 12px", fontSize: "14px" }}
                          >
                            Xóa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "books" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: "28px", fontWeight: 700 }}>
                Quản lý sách
              </h2>
              <button className="primary-btn" onClick={handleOpenAddBook}>
                + Thêm sách
              </button>
            </div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <input
                type="text"
                placeholder="Tìm kiếm sách..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
              {books
                .filter((b) => !bookSearch || b.title.toLowerCase().includes(bookSearch.toLowerCase()))
                .map((book) => (
                  <div
                    key={book.id}
                    style={{
                      backgroundColor: "#1e293b",
                      borderRadius: "12px",
                      padding: "16px",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div style={{ color: "#e2e8f0", fontWeight: 600, marginBottom: "8px" }}>{book.title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "12px" }}>
                      {book.authors && book.authors.length > 0
                        ? book.authors.map((a: any) => a.name).join(", ")
                        : book.author || "Unknown"}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="primary-btn"
                        onClick={() => handleOpenEditBook(book)}
                        style={{ flex: 1, padding: "8px", fontSize: "14px" }}
                      >
                        Sửa
                      </button>
                      <button
                        className="secondary-btn"
                        onClick={() => handleDeleteBook(book.id)}
                        style={{ flex: 1, padding: "8px", fontSize: "14px" }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <h2 style={{ color: "#e2e8f0", fontSize: "28px", fontWeight: 700, marginBottom: "24px" }}>
              Quản lý đánh giá ({reviews.length})
            </h2>
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <input
                type="text"
                placeholder="Tìm kiếm đánh giá..."
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                }}
              />
            </div>
            <div style={{ backgroundColor: "#1e293b", borderRadius: "12px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>ID</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Sách</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Người dùng</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Rating</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Nội dung</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Ngày tạo</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews
                    .filter((r) => 
                      !reviewSearch || 
                      r.content?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                      r.book?.title?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                      r.user?.name?.toLowerCase().includes(reviewSearch.toLowerCase())
                    )
                    .map((review) => (
                      <tr key={review.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "16px", color: "#e2e8f0" }}>{review.id}</td>
                        <td style={{ padding: "16px", color: "#e2e8f0" }}>
                          {review.book?.title || `Book #${review.book_id}`}
                        </td>
                        <td style={{ padding: "16px", color: "#94a3b8" }}>
                          {review.user?.name || `User #${review.user_id}`}
                        </td>
                        <td style={{ padding: "16px", color: "#fbbf24" }}>
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </td>
                        <td style={{ padding: "16px", color: "#94a3b8", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {review.content || "-"}
                        </td>
                        <td style={{ padding: "16px", color: "#64748b", fontSize: "12px" }}>
                          {review.created_at ? new Date(review.created_at).toLocaleDateString("vi-VN") : "-"}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <button
                            className="secondary-btn"
                            onClick={async () => {
                              if (window.confirm("Bạn có chắc muốn xóa đánh giá này?")) {
                                try {
                                  await deleteReviewAdmin(review.id);
                                  alert("Đã xóa thành công!");
                                  const updatedReviews = await getAllReviewsAdmin();
                                  setReviews(updatedReviews);
                                } catch (err) {
                                  console.error("Error deleting review:", err);
                                  alert(err instanceof Error ? err.message : "Không thể xóa");
                                }
                              }
                            }}
                            style={{ padding: "6px 12px", fontSize: "14px" }}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {reviews.length === 0 && (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  Chưa có đánh giá nào
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "groups" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: "28px", fontWeight: 700 }}>
                Quản lý câu lạc bộ
              </h2>
              <button className="primary-btn" onClick={handleOpenAddGroup}>
                + Thêm câu lạc bộ
              </button>
            </div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <input
                type="text"
                placeholder="Tìm kiếm câu lạc bộ..."
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                }}
              />
            </div>
            <div style={{ backgroundColor: "#1e293b", borderRadius: "12px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>ID</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Tên</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Chủ đề</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Thành viên</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {groups
                    .filter((g) => !groupSearch || g.name.toLowerCase().includes(groupSearch.toLowerCase()))
                    .map((group) => (
                      <tr key={group.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "16px", color: "#e2e8f0" }}>{group.id}</td>
                        <td style={{ padding: "16px", color: "#e2e8f0" }}>{group.name}</td>
                        <td style={{ padding: "16px", color: "#94a3b8" }}>{group.topic || "-"}</td>
                        <td style={{ padding: "16px", color: "#e2e8f0" }}>{group.members_count || 0}</td>
                        <td style={{ padding: "16px", display: "flex", gap: "8px" }}>
                          <button
                            className="primary-btn"
                            onClick={() => handleOpenEditGroup(group)}
                            style={{ padding: "6px 12px", fontSize: "14px" }}
                          >
                            Sửa
                          </button>
                          <button
                            className="secondary-btn"
                            onClick={() => handleDeleteGroup(group.id)}
                            style={{ padding: "6px 12px", fontSize: "14px" }}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "challenges" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: "28px", fontWeight: 700 }}>
                Quản lý thử thách
              </h2>
              <button className="primary-btn" onClick={handleOpenAddChallenge}>
                + Thêm thử thách
              </button>
            </div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <input
                type="text"
                placeholder="Tìm kiếm thử thách..."
                value={challengeSearch}
                onChange={(e) => setChallengeSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                }}
              />
            </div>
            <div style={{ backgroundColor: "#1e293b", borderRadius: "12px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>ID</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Tên</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Mục tiêu</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Ngày bắt đầu</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Ngày kết thúc</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {challenges
                    .filter((c) => !challengeSearch || c.title.toLowerCase().includes(challengeSearch.toLowerCase()))
                    .map((challenge) => (
                      <tr key={challenge.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "16px", color: "#e2e8f0" }}>{challenge.id}</td>
                        <td style={{ padding: "16px", color: "#e2e8f0" }}>{challenge.title}</td>
                        <td style={{ padding: "16px", color: "#94a3b8" }}>{challenge.target_books} sách</td>
                        <td style={{ padding: "16px", color: "#94a3b8" }}>{challenge.start_date || "-"}</td>
                        <td style={{ padding: "16px", color: "#94a3b8" }}>{challenge.end_date || "-"}</td>
                        <td style={{ padding: "16px", display: "flex", gap: "8px" }}>
                          <button
                            className="primary-btn"
                            onClick={() => handleOpenEditChallenge(challenge)}
                            style={{ padding: "6px 12px", fontSize: "14px" }}
                          >
                            Sửa
                          </button>
                          <button
                            className="secondary-btn"
                            onClick={() => handleDeleteChallenge(challenge.id)}
                            style={{ padding: "6px 12px", fontSize: "14px" }}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: "28px", fontWeight: 700 }}>
                Quản lý thông báo tác giả
              </h2>
              <button className="primary-btn" onClick={handleOpenAddNotification}>
                + Thêm thông báo
              </button>
            </div>
            <div style={{ backgroundColor: "#1e293b", borderRadius: "12px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>ID</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Tác giả</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Tiêu đề</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Loại</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Trạng thái</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Ngày tạo</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#cbd5e1" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification) => (
                    <tr key={notification.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "16px", color: "#e2e8f0" }}>{notification.id}</td>
                      <td style={{ padding: "16px", color: "#e2e8f0" }}>
                        {notification.author?.name || `ID: ${notification.author_id}`}
                      </td>
                      <td style={{ padding: "16px", color: "#e2e8f0" }}>{notification.title}</td>
                      <td style={{ padding: "16px", color: "#94a3b8" }}>
                        {notification.notification_type === "new_book" ? "Sách mới" : 
                         notification.notification_type === "announcement" ? "Thông báo" : "Cập nhật"}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          backgroundColor: notification.is_active ? "#22c55e" : "#64748b",
                          color: "#fff"
                        }}>
                          {notification.is_active ? "Hoạt động" : "Ẩn"}
                        </span>
                      </td>
                      <td style={{ padding: "16px", color: "#94a3b8" }}>
                        {new Date(notification.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td style={{ padding: "16px", display: "flex", gap: "8px" }}>
                        <button
                          className="primary-btn"
                          onClick={() => {
                            setEditingNotification(notification);
                            setNotificationFormData({
                              author_id: notification.author_id.toString(),
                              title: notification.title,
                              content: notification.content,
                              notification_type: notification.notification_type,
                              book_id: notification.book_id?.toString() || "",
                              cover_url: notification.cover_url || "",
                            });
                            setShowNotificationModal(true);
                          }}
                          style={{ padding: "6px 12px", fontSize: "14px" }}
                        >
                          Sửa
                        </button>
                        <button
                          className="secondary-btn"
                          onClick={() => handleDeleteNotification(notification.id)}
                          style={{ padding: "6px 12px", fontSize: "14px" }}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                  {notifications.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                        Chưa có thông báo nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notification Add/Edit Modal */}
        {showNotificationModal && (
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
            onClick={() => setShowNotificationModal(false)}
          >
            <div
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "16px",
                padding: "32px",
                width: "90%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>
                {editingNotification ? "Sửa thông báo" : "Thêm thông báo mới"}
              </h2>
              
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontSize: "14px" }}>
                  Tác giả *
                </label>
                <select
                  value={notificationFormData.author_id}
                  onChange={(e) => setNotificationFormData({ ...notificationFormData, author_id: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                  }}
                  disabled={authors.length === 0}
                >
                  <option value="">
                    {authors.length === 0 ? "Đang tải danh sách tác giả..." : "Chọn tác giả"}
                  </option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
                {authors.length === 0 && (
                  <div style={{ color: "#fca5a5", fontSize: "12px", marginTop: "4px" }}>
                    Chưa có tác giả nào. Vui lòng thêm tác giả trước.
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontSize: "14px" }}>
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={notificationFormData.title}
                  onChange={(e) => setNotificationFormData({ ...notificationFormData, title: e.target.value })}
                  placeholder="Ví dụ: Sách mới của tác giả..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontSize: "14px" }}>
                  Nội dung *
                </label>
                <textarea
                  value={notificationFormData.content}
                  onChange={(e) => setNotificationFormData({ ...notificationFormData, content: e.target.value })}
                  placeholder="Nhập nội dung thông báo..."
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontSize: "14px" }}>
                  Loại thông báo
                </label>
                <select
                  value={notificationFormData.notification_type}
                  onChange={(e) => setNotificationFormData({ ...notificationFormData, notification_type: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                  }}
                >
                  <option value="new_book">Sách mới</option>
                  <option value="announcement">Thông báo</option>
                  <option value="update">Cập nhật</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontSize: "14px" }}>
                  ID Sách (nếu là thông báo sách mới)
                </label>
                <input
                  type="number"
                  value={notificationFormData.book_id}
                  onChange={(e) => setNotificationFormData({ ...notificationFormData, book_id: e.target.value })}
                  placeholder="Nhập ID sách (tùy chọn)"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontSize: "14px" }}>
                  URL Ảnh bìa (tùy chọn)
                </label>
                <input
                  type="text"
                  value={notificationFormData.cover_url}
                  onChange={(e) => setNotificationFormData({ ...notificationFormData, cover_url: e.target.value })}
                  placeholder="https://..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  className="secondary-btn"
                  onClick={() => setShowNotificationModal(false)}
                  disabled={isSavingNotification}
                >
                  Hủy
                </button>
                <button
                  className="primary-btn"
                  onClick={handleSaveNotification}
                  disabled={isSavingNotification}
                >
                  {isSavingNotification ? "Đang lưu..." : editingNotification ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Book Add/Edit Modal */}
        {showBookModal && (
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
            onClick={() => setShowBookModal(false)}
          >
            <div
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "16px",
                padding: "32px",
                width: "90%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>
                {editingBook ? "Sửa sách" : "Thêm sách mới"}
              </h2>

              <div style={{ display: "grid", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                    Tên sách <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={bookFormData.title}
                    onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                    placeholder="Nhập tên sách"
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

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                    Tác giả (phân cách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={bookFormData.author}
                    onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                    placeholder="Ví dụ: Frank Herbert, Jane Austen"
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

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                    Mô tả
                  </label>
                  <textarea
                    value={bookFormData.description}
                    onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                    placeholder="Nhập mô tả về sách"
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

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                    Ảnh bìa sách
                  </label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedCover(file);
                        }
                      }}
                      style={{ display: "none" }}
                      id="cover-upload"
                      disabled={uploadingCover}
                    />
                    <label
                      htmlFor="cover-upload"
                      style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        backgroundColor: uploadingCover ? "#475569" : "transparent",
                        color: "#cbd5e1",
                        cursor: uploadingCover ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: 600,
                        display: "inline-block",
                      }}
                    >
                      {uploadingCover ? "Đang upload..." : "📷 Chọn ảnh bìa"}
                    </label>
                    {bookFormData.cover_url && (
                      <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                        ✓ Đã có ảnh bìa
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={bookFormData.cover_url}
                    onChange={(e) => setBookFormData({ ...bookFormData, cover_url: e.target.value })}
                    placeholder="Hoặc nhập URL ảnh bìa"
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

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                    File sách (PDF, EPUB, MOBI, TXT, DOC, DOCX)
                  </label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <input
                      type="file"
                      accept=".pdf,.epub,.mobi,.txt,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                        }
                      }}
                      style={{ display: "none" }}
                      id="file-upload"
                      disabled={uploadingFile}
                    />
                    <label
                      htmlFor="file-upload"
                      style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        backgroundColor: uploadingFile ? "#475569" : "transparent",
                        color: "#cbd5e1",
                        cursor: uploadingFile ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: 600,
                        display: "inline-block",
                      }}
                    >
                      {uploadingFile ? "Đang upload..." : "📄 Chọn file sách"}
                    </label>
                    {bookFormData.file_url && (
                      <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                        ✓ Đã có file sách
                      </div>
                    )}
                  </div>
                    {selectedFile && (
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                        File đã chọn: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        <br />
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          File sẽ được upload khi bạn lưu sách
                        </span>
                      </div>
                    )}
                    {selectedCover && (
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                        Ảnh đã chọn: {selectedCover.name} ({(selectedCover.size / 1024 / 1024).toFixed(2)} MB)
                        <br />
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          Ảnh sẽ được upload khi bạn lưu sách
                        </span>
                      </div>
                    )}
                  {bookFormData.file_url && (
                    <div style={{ marginTop: "8px" }}>
                      <a
                        href={bookFormData.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#13a4ec",
                          textDecoration: "none",
                          fontSize: "14px",
                        }}
                      >
                        📎 Xem file hiện tại
                      </a>
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                      ISBN
                    </label>
                    <input
                      type="text"
                      value={bookFormData.isbn}
                      onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                      placeholder="978-0-123456-78-9"
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

                  <div>
                    <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                      Số trang
                    </label>
                    <input
                      type="number"
                      value={bookFormData.page_count}
                      onChange={(e) => setBookFormData({ ...bookFormData, page_count: e.target.value })}
                      placeholder="500"
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
                </div>

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                    Ngày xuất bản
                  </label>
                  <input
                    type="text"
                    value={bookFormData.published_date}
                    onChange={(e) => setBookFormData({ ...bookFormData, published_date: e.target.value })}
                    placeholder="2024-01-01"
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
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
                <button
                  onClick={() => setShowBookModal(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backgroundColor: "transparent",
                    color: "#cbd5e1",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  disabled={isSavingBook}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveBook}
                  disabled={isSavingBook || uploadingFile || uploadingCover || !bookFormData.title.trim()}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: isSavingBook || uploadingFile || uploadingCover || !bookFormData.title.trim() ? "#475569" : "#13a4ec",
                    color: "white",
                    cursor: isSavingBook || uploadingFile || uploadingCover || !bookFormData.title.trim() ? "not-allowed" : "pointer",
                    fontWeight: 700,
                  }}
                >
                  {uploadingFile || uploadingCover 
                    ? "Đang upload..." 
                    : isSavingBook 
                    ? "Đang lưu..." 
                    : editingBook 
                    ? "Cập nhật" 
                    : "Thêm sách"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Group Add/Edit Modal */}
        {showGroupModal && (
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
            onClick={() => setShowGroupModal(false)}
          >
            <div
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "16px",
                padding: "32px",
                width: "90%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>
                {editingGroup ? "Sửa câu lạc bộ" : "Thêm câu lạc bộ mới"}
              </h2>

              <div style={{ display: "grid", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                    Tên câu lạc bộ <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={groupFormData.name}
                    onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
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

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                    Mô tả
                  </label>
                  <textarea
                    value={groupFormData.description}
                    onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                    placeholder="Nhập mô tả câu lạc bộ"
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

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                    Chủ đề
                  </label>
                  <input
                    type="text"
                    value={groupFormData.topic}
                    onChange={(e) => setGroupFormData({ ...groupFormData, topic: e.target.value })}
                    placeholder="Ví dụ: Khoa học viễn tưởng"
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

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                    ID Sách hiện tại (tùy chọn)
                  </label>
                  <input
                    type="number"
                    value={groupFormData.current_book_id}
                    onChange={(e) => setGroupFormData({ ...groupFormData, current_book_id: e.target.value })}
                    placeholder="ID của sách đang đọc"
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
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
                <button
                  onClick={() => setShowGroupModal(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backgroundColor: "transparent",
                    color: "#cbd5e1",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  disabled={isSavingGroup}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveGroup}
                  disabled={isSavingGroup || !groupFormData.name.trim()}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: isSavingGroup || !groupFormData.name.trim() ? "#475569" : "#13a4ec",
                    color: "white",
                    cursor: isSavingGroup || !groupFormData.name.trim() ? "not-allowed" : "pointer",
                    fontWeight: 700,
                  }}
                >
                  {isSavingGroup ? "Đang lưu..." : editingGroup ? "Cập nhật" : "Thêm câu lạc bộ"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Challenge Add/Edit Modal */}
        {showChallengeModal && (
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
            onClick={() => setShowChallengeModal(false)}
          >
            <div
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "16px",
                padding: "32px",
                width: "90%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>
                {editingChallenge ? "Sửa thử thách" : "Thêm thử thách mới"}
              </h2>

              <div style={{ display: "grid", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                    Tên thử thách <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={challengeFormData.title}
                    onChange={(e) => setChallengeFormData({ ...challengeFormData, title: e.target.value })}
                    placeholder="Nhập tên thử thách"
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

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                    Mô tả
                  </label>
                  <textarea
                    value={challengeFormData.description}
                    onChange={(e) => setChallengeFormData({ ...challengeFormData, description: e.target.value })}
                    placeholder="Nhập mô tả thử thách"
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                      Mục tiêu (số sách) <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="number"
                      value={challengeFormData.target_books}
                      onChange={(e) => setChallengeFormData({ ...challengeFormData, target_books: e.target.value })}
                      placeholder="10"
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

                  <div>
                    <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                      XP thưởng
                    </label>
                    <input
                      type="number"
                      value={challengeFormData.xp_reward}
                      onChange={(e) => setChallengeFormData({ ...challengeFormData, xp_reward: e.target.value })}
                      placeholder="100"
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
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={challengeFormData.start_date}
                      onChange={(e) => setChallengeFormData({ ...challengeFormData, start_date: e.target.value })}
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

                  <div>
                    <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      value={challengeFormData.end_date}
                      onChange={(e) => setChallengeFormData({ ...challengeFormData, end_date: e.target.value })}
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
                </div>

                <div>
                  <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>
                    URL ảnh bìa
                  </label>
                  <input
                    type="text"
                    value={challengeFormData.cover_url}
                    onChange={(e) => setChallengeFormData({ ...challengeFormData, cover_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
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
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
                <button
                  onClick={() => setShowChallengeModal(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backgroundColor: "transparent",
                    color: "#cbd5e1",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  disabled={isSavingChallenge}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveChallenge}
                  disabled={isSavingChallenge || !challengeFormData.title.trim() || !challengeFormData.target_books}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: isSavingChallenge || !challengeFormData.title.trim() || !challengeFormData.target_books ? "#475569" : "#13a4ec",
                    color: "white",
                    cursor: isSavingChallenge || !challengeFormData.title.trim() || !challengeFormData.target_books ? "not-allowed" : "pointer",
                    fontWeight: 700,
                  }}
                >
                  {isSavingChallenge ? "Đang lưu..." : editingChallenge ? "Cập nhật" : "Thêm thử thách"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPage;

