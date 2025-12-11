import { useEffect, useMemo, useState } from "react";
import { Book } from "../types";

interface ReviewFormProps {
  book: Book | null;
  onSave: (bookId: string, rating: number, review: string) => void;
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

const ReviewForm = ({ book, onSave }: ReviewFormProps) => {
  const [rating, setRating] = useState(book?.rating ?? 0);
  const [review, setReview] = useState(book?.review ?? "");

  useEffect(() => {
    setRating(book?.rating ?? 0);
    setReview(book?.review ?? "");
  }, [book]);

  const avgRating = useMemo(() => {
    if (!book?.rating) return 4.7;
    return Math.max(0, Math.min(5, Number(book.rating.toFixed(1))));
  }, [book]);

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
              <button className="primary-btn full">+ Thêm vào thư viện</button>
              <button className="secondary-btn full">Đánh dấu đã đọc</button>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-tabs">
              <button className="tab active">Mô tả</button>
              <button className="tab">Chi tiết</button>
              <button className="tab">Cộng đồng</button>
            </div>
            <div className="detail-desc">
              <p>
                Lấy bối cảnh tương lai xa xôi, nơi các gia tộc tranh giành hành tinh sa mạc giàu gia vị. Câu chuyện đan xen
                chính trị, tôn giáo và sinh thái tạo nên thế giới sâu sắc.
              </p>
              <p>Cuốn sách bạn đang đọc: ghi chú, nhận xét, và tiến độ sẽ hiển thị tại đây.</p>
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
              <button className="primary-btn" onClick={() => onSave(book.id, rating, review)}>
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-list-header">
          <h3 className="detail-heading">Đánh giá từ cộng đồng ({mockCommunity.length})</h3>
          <select className="detail-select" defaultValue="newest">
            <option value="newest">Gần đây nhất</option>
            <option value="helpful">Hữu ích nhất</option>
            <option value="high">Xếp hạng cao</option>
            <option value="low">Xếp hạng thấp</option>
          </select>
        </div>
        <div className="detail-community">
          {mockCommunity.map((item) => (
            <div key={item.id} className="detail-review">
              <img className="detail-avatar" src={item.avatar} alt={item.user} />
              <div className="detail-review-body">
                <div className="detail-review-top">
                  <div>
                    <p className="detail-review-name">{item.user}</p>
                    <p className="detail-review-time">{item.time}</p>
                  </div>
                  <div className="detail-review-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < item.rating ? "★" : "☆"}</span>
                    ))}
                  </div>
                </div>
                <p className="detail-review-text">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;

