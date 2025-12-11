import { Book } from "../types";

interface RecommendationsProps {
  books: Book[];
}

const Recommendations = ({ books }: RecommendationsProps) => {
  return (
    <div className="card">
      <div className="section-title">
        <h3>Gợi ý</h3>
        <span className="small">Dựa trên sách bạn thích</span>
      </div>
      <div className="grid">
        {books.map((book) => (
          <div key={book.id} className="card" style={{ boxShadow: "none", border: "1px dashed #e2e8f0" }}>
            <div style={{ fontWeight: 700 }}>{book.title}</div>
            <div className="small">{book.author}</div>
            <div className="progress" style={{ marginTop: 8 }}>
              <div className="progress-inner" style={{ width: `${book.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;

