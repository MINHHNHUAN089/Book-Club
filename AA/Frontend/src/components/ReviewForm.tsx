import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Book } from "../types";
import { addBookToMyList, updateBookProgress, getBookReviews, Review, getCurrentUser, deleteReview, followBook, unfollowBook, getFollowedBooks } from "../api/backend";

interface ReviewFormProps {
  book: Book | null;
  userBookId?: number; // ID của UserBook nếu sách đã có trong danh sách
  onSave: (bookId: string, rating: number, review: string) => void;
  onBookAdded?: () => void; // Callback khi thêm sách thành công
  onProgressUpdated?: () => void; // Callback khi cập nhật tiến độ thành công
}

const mockCommunity = [
  {
    id: "rv-1",
    user: "An Nguyen",
    time: "2 ngày trước",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBDEGYhuH9uT9d0wbMB9FM1g0nv7iqkrqAiy43ehdavyiKCSj6BdspuyvLNJWImfSZgWBNega_oUASzjkVQNgt8FfpB_LtwHfNcokrPLMjNdJOZ64VSyDOETff8QHfOi4ADFLTH9FaYa-Y9wD9Xml6fjvcyeZatwAwPTndPueim0dYiGbMJQPTRBCn2Yij9wUQB1-JgsT7wAzxesOzENhBd2p9en4d6FkP_k1giBC-Ucg9Fzp4UwnqetNdEAaUCmCwGS9AeEJZ6Dgpe",
    rating: 5,
    content:
      "Một kiệt tác khoa học viễn tưởng. Thế giới Arrakis được xây dựng cực kỳ chi tiết, đọc cuốn hút từ đầu đến cuối."
  },
  {
    id: "rv-2",
    user: "Bich Tran",
    time: "1 tuần trước",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAahR_x5NuCLUsGEDlm7DpldF90EgS3H27G8UwdjPW8OFnLH04ZVCV2e6EG21pkRSXHILSeTebKraC-HSLR1eTSsHP9_ulWvJsbQtBvqG7NhTiQ6MpKN1NcGtQfZ1TOAtPIWTLlPPCskBAO1VpE1Ql7PqvVjs2khzbETPjxNlaPMewg_XIKFgwV75Hp394jLxsfloIHoxmJvnzh_yR9lScz6dnz7QmpBMbJjL8xxkvmNOo4u5qUFxVnfm1HkSiZopwMkxfUzx7N1GOx",
    rating: 4,
    content: "Nhịp hơi chậm lúc đầu nhưng càng về sau càng cuốn. Nhiều tầng ý nghĩa để nghiền ngẫm."
  },
  {
    id: "rv-3",
    user: "Cuong Le",
    time: "3 tuần trước",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB7zLwCs7e0pqLGnYFdYldfmOWOPRcoU7JBbwM_8aU241VXzqOEF27xFUEKzLJ5YC_Yo4eCfyUs-IGELgJHy5fjHJvso4NapSfV__3Ml6TkaVI_rs9_5TiyGh2eXP_jP8qtqxbSWtZy0kQHIb2AruBytkR1Q7D08w7rk_L9EFQ1TRv3bud0bQf8czjRH6wtQSjjkfrmUXmyFOrBy6BxT40lEbw2C7wFR5-HXNC8tn_QL26H-OL8oDG8vzzqIlfdcluZFNQ7f9VeYxC8",
    rating: 5,
    content: "Đọc lại nhiều lần vẫn mê. Mỗi lần lại phát hiện thêm lớp nghĩa mới."
  }
];

const ReviewForm = ({ book, userBookId, onSave, onBookAdded, onProgressUpdated }: ReviewFormProps) => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(book?.rating ?? 0);
  const [review, setReview] = useState(book?.review ?? "");
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reading">("description");
  const [communityReviews, setCommunityReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  useEffect(() => {
    // Reset rating và review khi book thay đổi (theo book.id)
    if (book) {
      // Update rating from book prop (this will sync with external rating)
      setRating(book.rating ?? 0);
      setReview(""); // Reset review text - will be loaded from reviews table
      setActiveTab("description");
      setCommunityReviews([]); // Reset reviews khi đổi sách
    }
  }, [book?.id, book?.rating]); // Also watch book.rating to sync when it changes

  const loadCommunityReviews = async () => {
    if (!book?.id) return;
    setLoadingReviews(true);
    try {
      const [reviews, currentUser] = await Promise.all([
        getBookReviews(parseInt(book.id)),
        getCurrentUser().catch(() => null) // Get current user, but don't fail if it errors
      ]);
      
      // Store current user ID and role
      if (currentUser) {
        console.log("Current user ID:", currentUser.id, "Role:", currentUser.role);
        setCurrentUserId(currentUser.id);
        setCurrentUserRole(currentUser.role || null);
      } else {
        console.log("No current user found");
        setCurrentUserId(null);
        setCurrentUserRole(null);
      }
      
      // Sắp xếp reviews theo thời gian mới nhất (created_at giảm dần)
      const sortedReviews = reviews.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA; // Mới nhất trước
      });
      setCommunityReviews(sortedReviews);
      
      // Don't auto-load review text - allow user to create multiple reviews
      // Only reset if review text is empty (when switching books)
      if (!review) {
        setReview("");
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
      setCommunityReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Load community reviews when book changes (load immediately, not just when tab is active)
  useEffect(() => {
    if (book?.id) {
      loadCommunityReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id]);

  // Check follow status when book changes
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (book?.id) {
        try {
          const followed = await getFollowedBooks();
          // Compare book.id (string) with followed book id (number or string)
          const bookIdNum = parseInt(book.id);
          const isBookFollowed = followed.some(fb => {
            const followedId = typeof fb.id === 'string' ? parseInt(fb.id) : fb.id;
            return followedId === bookIdNum;
          });
          console.log(`[ReviewForm] Check follow status for book ${book.id}:`, isBookFollowed, "Followed books:", followed.map(fb => ({ id: fb.id, title: fb.title })));
          setIsFollowing(isBookFollowed);
        } catch (err) {
          console.error("Error checking follow status:", err);
          setIsFollowing(false);
        }
      } else {
        setIsFollowing(false);
      }
    };
    checkFollowStatus();
  }, [book?.id]);

  // Calculate average rating from all reviews
  const avgRating = useMemo(() => {
    if (communityReviews.length > 0) {
      const total = communityReviews.reduce((sum, r) => sum + r.rating, 0);
      return total / communityReviews.length;
    }
    // Fallback to book rating if no reviews yet
    if (book?.rating) {
      return book.rating;
    }
    return 0; // No rating yet
  }, [book, communityReviews]);

  // Calculate rating distribution from real data
  const ratingDistribution = useMemo(() => {
    if (communityReviews.length === 0) {
      return [
        { label: "5 sao", count: 0, percentage: 0 },
        { label: "4 sao", count: 0, percentage: 0 },
        { label: "3 sao", count: 0, percentage: 0 },
        { label: "2 sao", count: 0, percentage: 0 },
        { label: "1 sao", count: 0, percentage: 0 },
      ];
    }

    // Count reviews by rating
    const counts: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    communityReviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        counts[review.rating as keyof typeof counts]++;
      }
    });

    // Calculate percentages
    const total = communityReviews.length;
    return [
      { label: "5 sao", count: counts[5], percentage: Math.round((counts[5] / total) * 100) },
      { label: "4 sao", count: counts[4], percentage: Math.round((counts[4] / total) * 100) },
      { label: "3 sao", count: counts[3], percentage: Math.round((counts[3] / total) * 100) },
      { label: "2 sao", count: counts[2], percentage: Math.round((counts[2] / total) * 100) },
      { label: "1 sao", count: counts[1], percentage: Math.round((counts[1] / total) * 100) },
    ];
  }, [communityReviews]);

  const handleAddToLibrary = async () => {
    if (!book?.id) return;
    setIsAddingBook(true);
    try {
      await addBookToMyList(parseInt(book.id));
      alert("Đã thêm sách vào thư viện thành công!");
      if (onBookAdded) onBookAdded();
    } catch (err) {
      console.error("Error adding book:", err);
      alert(err instanceof Error ? err.message : "Không thể thêm sách vào thư viện");
    } finally {
      setIsAddingBook(false);
    }
  };

  const handleMarkAsRead = async () => {
    if (!userBookId) return;
    setIsMarkingRead(true);
    try {
      await updateBookProgress(userBookId, 100);
      alert("Đã đánh dấu sách là đã đọc!");
      if (onProgressUpdated) onProgressUpdated();
    } catch (err) {
      console.error("Error marking as read:", err);
      alert(err instanceof Error ? err.message : "Không thể đánh dấu đã đọc");
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!book?.id) return;
    setIsTogglingFollow(true);
    try {
      if (isFollowing) {
        await unfollowBook(parseInt(book.id));
        setIsFollowing(false);
        alert("Đã bỏ theo dõi sách");
      } else {
        await followBook(parseInt(book.id));
        setIsFollowing(true);
        alert("Đã theo dõi sách thành công!");
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      alert(err instanceof Error ? err.message : "Không thể thay đổi trạng thái theo dõi");
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const handleViewFollowedBooks = () => {
    navigate("/books?tab=following");
  };

  const handleSaveReview = async () => {
    if (!book?.id || rating === 0) {
      alert("Vui lòng chọn số sao đánh giá");
      return;
    }
    setIsSaving(true);
    try {
      await onSave(book.id, rating, review);
      // Đợi một chút để đảm bảo API đã cập nhật review mới
      await new Promise(resolve => setTimeout(resolve, 500));
      // Luôn reload reviews sau khi save thành công để hiển thị review mới
      try {
        await loadCommunityReviews();
      } catch (reloadErr) {
        console.error("Error reloading reviews:", reloadErr);
        // Don't show error, review was saved successfully
      }
      alert("Đã gửi đánh giá thành công!");
      // Clear review text after saving to allow new review
      setReview("");
      setRating(0); // Reset rating để có thể chọn lại
    } catch (err) {
      console.error("Error saving review:", err);
      alert(err instanceof Error ? err.message : "Không thể gửi đánh giá");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      return;
    }
    
    setDeletingReviewId(reviewId);
    try {
      await deleteReview(reviewId);
      // Reload reviews after deletion
      await loadCommunityReviews();
      alert("Đã xóa đánh giá thành công!");
    } catch (err) {
      console.error("Error deleting review:", err);
      alert(err instanceof Error ? err.message : "Không thể xóa đánh giá");
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (!book) {
    return (
      <div className="card">
        <h3>Review</h3>
        <p className="small">Chọn sách để xem chi tiết và thêm review.</p>
      </div>
    );
  }

  return (
    <div className="detail-stack">
      <div className="detail-grid">
        <div className="detail-left">
          <div className="detail-card">
            <img
              className="detail-cover"
              src={
                book.coverUrl ??
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBZE4pH7Rem8ApN9MY9tSgLx4J2hxaLfwdXtejD_RLt3feFHYKRzWTgy6Kax0F8r1WQUMGYqS-E02zQA9-zbIE-8H7vym5qsH93dFNY5wkrEjC7R1Dr2-lGnNbZm9bT7SwGYm9hJjzh3LoyaMVd-JIM5MSWMjj0ZUeVACFx7h7wR6Hum93loHSDqtXTuyNLGz44OckDPX4W55h71qikshdGdi3dMPO3HaIGU8XBwxQGsYc27hb73eWtUknSiSNu3aIOjMeZFb9vA_5b"
              }
              alt={book.title}
            />
            <div className="detail-center">
              <h1 className="detail-title">{book.title}</h1>
              <p className="detail-author">{book.author}</p>
              <p className="detail-sub">Series: Sách của bạn</p>
            </div>
            <div className="detail-actions">
              {userBookId && (
                <button 
                  className="primary-btn full" 
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                >
                  ✓ Đã có trong thư viện
                </button>
              )}
              {userBookId ? (
                <button 
                  className="secondary-btn full"
                  onClick={handleMarkAsRead}
                  disabled={isMarkingRead || book?.progress === 100}
                >
                  {isMarkingRead ? "Đang cập nhật..." : book?.progress === 100 ? "✓ Đã đọc" : "Đánh dấu đã đọc"}
                </button>
              ) : (
                <button 
                  className="secondary-btn full"
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                >
                  Đánh dấu đã đọc
                </button>
              )}
              <button 
                className={isFollowing ? "secondary-btn full" : "primary-btn full"}
                onClick={handleToggleFollow}
                disabled={isTogglingFollow || !book?.id}
                style={{ marginTop: "8px" }}
              >
                {isTogglingFollow ? "Đang xử lý..." : isFollowing ? "✓ Đang theo dõi" : "📌 Theo dõi sách"}
              </button>
              {isFollowing && (
                <button 
                  className="primary-btn full"
                  onClick={handleViewFollowedBooks}
                  style={{ marginTop: "8px" }}
                >
                  📚 Xem danh sách theo dõi
                </button>
              )}
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-tabs">
              <button 
                className={`tab ${activeTab === "description" ? "active" : ""}`}
                onClick={() => setActiveTab("description")}
                type="button"
              >
                Reviews
              </button>
              <button 
                className={`tab ${activeTab === "details" ? "active" : ""}`}
                onClick={() => setActiveTab("details")}
                type="button"
              >
                Chi tiết
              </button>
              <button 
                className={`tab ${activeTab === "reading" ? "active" : ""}`}
                onClick={() => {
                  if (book?.fileUrl) {
                    navigate(`/reading?bookId=${book.id}`);
                  } else {
                    setActiveTab("reading");
                  }
                }}
                type="button"
              >
                Đọc sách
              </button>
            </div>
            <div className="detail-desc">
              {activeTab === "description" && (
                <>
                  <p>
                    {book.description || "Chưa có mô tả cho cuốn sách này."}
                  </p>
                  {userBookId && (
                    <p>Cuốn sách bạn đang đọc: ghi chú, nhận xét, và tiến độ sẽ hiển thị tại đây.</p>
                  )}
                </>
              )}
              {activeTab === "details" && (
                <div>
                  <p><strong>Tác giả:</strong> {book.author || "Chưa có thông tin"}</p>
                  <p><strong>Tiến độ:</strong> {book.progress || 0}%</p>
                  {book.rating && <p><strong>Đánh giá của bạn:</strong> {book.rating}/5 sao</p>}
                  <p><strong>ID sách:</strong> {book.id}</p>
                </div>
              )}
              {activeTab === "reading" && (
                <div>
                  {book?.fileUrl ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <p>Nhấn vào nút "Đọc sách" ở trên để mở trang đọc sách.</p>
                      <button
                        className="primary-btn"
                        onClick={() => navigate(`/reading?bookId=${book.id}`)}
                        style={{ marginTop: "16px" }}
                      >
                        Mở trang đọc sách
                      </button>
                    </div>
                  ) : (
                    <p>Chưa có file PDF cho cuốn sách này. Vui lòng liên hệ admin để thêm file.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="detail-right">
          <div className="detail-card">
            <h3 className="detail-heading">Tổng quan xếp hạng</h3>
            <div className="rating-summary">
              <div className="rating-avg">
                <div className="rating-score">
                  {communityReviews.length > 0 ? avgRating.toFixed(1) : "—"}
                </div>
                <div className="rating-stars">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starValue = i + 1;
                    const isFilled = starValue <= Math.floor(avgRating);
                    const isHalfFilled = !isFilled && starValue - 0.5 <= avgRating;
                    return (
                      <span 
                        key={i} 
                        style={{ 
                          color: isFilled || isHalfFilled ? "#fbbf24" : "#475569",
                          opacity: isHalfFilled ? 0.7 : 1
                        }}
                      >
                        {isFilled ? "★" : "☆"}
                      </span>
                    );
                  })}
                </div>
                <div className="rating-count">
                  {communityReviews.length > 0 
                    ? `${communityReviews.length} xếp hạng`
                    : "Chưa có xếp hạng"}
                </div>
              </div>
              <div className="rating-bars">
                {ratingDistribution.map(({ label, percentage }) => (
                  <div key={label} className="rating-row">
                    <span>{label}</span>
                    <div className="rating-bar">
                      <div className="rating-fill" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="rating-pct">{percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3 className="detail-heading">Viết đánh giá của bạn</h3>
            <div className="rating-input">
              {Array.from({ length: 5 }).map((_, idx) => {
                const val = idx + 1;
                return (
                  <button
                    key={val}
                    type="button"
                    className={val <= rating ? "rating-btn active" : "rating-btn"}
                    onClick={() => setRating(val)}
                    aria-label={`Chọn ${val} sao`}
                  >
                    ★
                  </button>
                );
              })}
            </div>
            <textarea
              className="detail-textarea"
              rows={4}
              placeholder="Bạn nghĩ gì về cuốn sách này?"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <div className="detail-actions" style={{ marginTop: 10 }}>
              <button 
                className="primary-btn" 
                onClick={handleSaveReview}
                disabled={isSaving || rating === 0}
              >
                {isSaving ? "Đang gửi..." : "Gửi"}
              </button>
              {rating === 0 && (
                <p style={{ color: "#fca5a5", fontSize: "12px", marginTop: "8px" }}>
                  Vui lòng chọn số sao đánh giá
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {activeTab !== "reading" && (
        <div className="detail-card">
          <div className="detail-list-header">
            <h3 className="detail-heading">Đánh giá từ cộng đồng ({communityReviews.length})</h3>
            <select 
              className="detail-select" 
              defaultValue="newest"
              onChange={(e) => {
                // Có thể thêm logic sắp xếp sau
                loadCommunityReviews();
              }}
            >
              <option value="newest">Gần đây nhất</option>
              <option value="high">Xếp hạng cao</option>
              <option value="low">Xếp hạng thấp</option>
            </select>
          </div>
          <div className="detail-community">
            {loadingReviews ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>Đang tải...</p>
            ) : communityReviews.length === 0 ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>Chưa có đánh giá từ cộng đồng.</p>
            ) : (
              communityReviews.map((item) => (
                <div key={item.id} className="detail-review">
                  <div className="detail-review-body">
                    <div className="detail-review-top">
                      <div>
                        <p className="detail-review-name">
                          {item.user?.name || item.user_name || `Người dùng #${item.user_id}`}
                        </p>
                        <p className="detail-review-time">
                          {new Date(item.created_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="detail-review-stars">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < item.rating ? "★" : "☆"}</span>
                          ))}
                        </div>
                        {(() => {
                          // Get user ID from either user_id or user.id (handle both API formats)
                          const reviewUserId = item.user_id ?? item.user?.id;
                          const reviewUserIdNum = Number(reviewUserId);
                          const currentUserIdNum = Number(currentUserId);
                          const isMyReview = currentUserId != null && !isNaN(reviewUserIdNum) && reviewUserIdNum === currentUserIdNum;
                          const isAdmin = currentUserRole === "admin";
                          const canDelete = isMyReview || isAdmin;
                          
                          return canDelete ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteReview(item.id);
                              }}
                              disabled={deletingReviewId === item.id}
                              style={{
                                padding: "6px 12px",
                                fontSize: "12px",
                                background: "rgba(239, 68, 68, 0.15)",
                                color: "#ef4444",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                borderRadius: "6px",
                                cursor: deletingReviewId === item.id ? "not-allowed" : "pointer",
                                opacity: deletingReviewId === item.id ? 0.6 : 1,
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                              title={isMyReview ? "Xóa đánh giá của bạn" : "Xóa đánh giá (Admin)"}
                            >
                              🗑️ {deletingReviewId === item.id ? "Đang xóa..." : "Xóa"}
                            </button>
                          ) : null;
                        })()}
                      </div>
                    </div>
                    <p className="detail-review-text">{item.review_text || "Không có nội dung đánh giá."}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewForm;

