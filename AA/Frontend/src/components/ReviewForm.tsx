import { useEffect, useMemo, useState } from "react";
import { Book } from "../types";
import { addBookToMyList, updateBookProgress, getBookReviews, Review } from "../api/backend";

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
  const [rating, setRating] = useState(book?.rating ?? 0);
  const [review, setReview] = useState(book?.review ?? "");
  const [activeTab, setActiveTab] = useState<"description" | "details" | "community">("description");
  const [communityReviews, setCommunityReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Reset rating và review khi book thay đổi (theo book.id)
    if (book) {
      setRating(book.rating ?? 0);
      setReview(book.review ?? "");
      setActiveTab("description");
      setCommunityReviews([]); // Reset reviews khi đổi sách
    }
  }, [book?.id]); // Chỉ theo dõi book.id để tránh re-render không cần thiết

  const loadCommunityReviews = async () => {
    if (!book?.id) return;
    setLoadingReviews(true);
    try {
      const reviews = await getBookReviews(parseInt(book.id));
      // Sắp xếp reviews theo thời gian mới nhất (created_at giảm dần)
      const sortedReviews = reviews.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA; // Mới nhất trước
      });
      setCommunityReviews(sortedReviews);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setCommunityReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Load community reviews when book changes
  useEffect(() => {
    if (book?.id && activeTab === "community") {
      loadCommunityReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id, activeTab]);

  const avgRating = useMemo(() => {
    if (communityReviews.length > 0) {
      const total = communityReviews.reduce((sum, r) => sum + r.rating, 0);
      return Math.max(0, Math.min(5, Number((total / communityReviews.length).toFixed(1))));
    }
    if (!book?.rating) return 4.7;
    return Math.max(0, Math.min(5, Number(book.rating.toFixed(1))));
  }, [book, communityReviews]);

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
        // Tự động chuyển sang tab "community" để xem review mới
        setActiveTab("community");
      } catch (reloadErr) {
        console.error("Error reloading reviews:", reloadErr);
        // Don't show error, review was saved successfully
      }
      alert("Đã gửi đánh giá thành công!");
    } catch (err) {
      console.error("Error saving review:", err);
      alert(err instanceof Error ? err.message : "Không thể gửi đánh giá");
    } finally {
      setIsSaving(false);
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
              {!userBookId ? (
                <button 
                  className="primary-btn full" 
                  onClick={handleAddToLibrary}
                  disabled={isAddingBook}
                >
                  {isAddingBook ? "Đang thêm..." : "+ Thêm vào thư viện"}
                </button>
              ) : (
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
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-tabs">
              <button 
                className={`tab ${activeTab === "description" ? "active" : ""}`}
                onClick={() => setActiveTab("description")}
                type="button"
              >
                Mô tả
              </button>
              <button 
                className={`tab ${activeTab === "details" ? "active" : ""}`}
                onClick={() => setActiveTab("details")}
                type="button"
              >
                Chi tiết
              </button>
              <button 
                className={`tab ${activeTab === "community" ? "active" : ""}`}
                onClick={() => setActiveTab("community")}
                type="button"
              >
                Cộng đồng
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
              {activeTab === "community" && (
                <div>
                  {loadingReviews ? (
                    <p>Đang tải đánh giá...</p>
                  ) : communityReviews.length === 0 ? (
                    <p>Chưa có đánh giá từ cộng đồng cho cuốn sách này.</p>
                  ) : (
                    <div className="detail-community">
                      {communityReviews.map((item) => (
                        <div key={item.id} className="detail-review">
                          <div className="detail-review-body">
                            <div className="detail-review-top">
                              <div>
                                <p className="detail-review-name">Người dùng #{item.user_id}</p>
                                <p className="detail-review-time">
                                  {new Date(item.created_at).toLocaleDateString("vi-VN")}
                                </p>
                              </div>
                              <div className="detail-review-stars">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i}>{i < item.rating ? "★" : "☆"}</span>
                                ))}
                              </div>
                            </div>
                            <p className="detail-review-text">{item.review_text || "Không có nội dung đánh giá."}</p>
                          </div>
                        </div>
                      ))}
                    </div>
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
                <div className="rating-score">{avgRating.toFixed(1)}</div>
                <div className="rating-stars">{Array.from({ length: 5 }).map((_, i) => (i + 0.5 <= avgRating ? "★" : "☆"))}</div>
                <div className="rating-count">~3,281 xếp hạng</div>
              </div>
              <div className="rating-bars">
                {[["5 sao", 75], ["4 sao", 18], ["3 sao", 5], ["2 sao", 1], ["1 sao", 1]].map(([label, pct]) => (
                  <div key={label} className="rating-row">
                    <span>{label}</span>
                    <div className="rating-bar">
                      <div className="rating-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="rating-pct">{pct}%</span>
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

      {activeTab !== "community" && (
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
              communityReviews.slice(0, 5).map((item) => (
                <div key={item.id} className="detail-review">
                  <div className="detail-review-body">
                    <div className="detail-review-top">
                      <div>
                        <p className="detail-review-name">Người dùng #{item.user_id}</p>
                        <p className="detail-review-time">
                          {new Date(item.created_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div className="detail-review-stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>{i < item.rating ? "★" : "☆"}</span>
                        ))}
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

