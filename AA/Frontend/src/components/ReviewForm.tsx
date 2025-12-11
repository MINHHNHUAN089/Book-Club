import { useState } from "react";
import { Book } from "../types";

interface ReviewFormProps {
  book: Book | null;
  onSave: (bookId: string, rating: number, review: string) => void;
}

const ReviewForm = ({ book, onSave }: ReviewFormProps) => {
  const [rating, setRating] = useState(book?.rating ?? 0);
  const [review, setReview] = useState(book?.review ?? "");

  if (!book) {
    return (
      <div className="card">
        <h3>Review</h3>
        <p className="small">Chọn sách để thêm review.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Review: {book.title}</h3>
      <div className="form">
        <label className="small">Đánh giá (0-5)</label>
        <input
          type="range"
          min={0}
          max={5}
          step={1}
          className="input"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        />
        <label className="small">Nhận xét</label>
        <textarea
          className="textarea"
          placeholder="Cảm nhận của bạn..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
        <button className="button" onClick={() => onSave(book.id, rating, review)}>
          Lưu review
        </button>
      </div>
    </div>
  );
};

export default ReviewForm;

