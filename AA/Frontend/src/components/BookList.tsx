import { Book } from "../types";

interface BookListProps {
  books: Book[];
  onUpdateProgress: (bookId: string, progress: number) => void;
  onSelect: (book: Book) => void;
}

const BookList = ({ books, onUpdateProgress, onSelect }: BookListProps) => {
  return (
    <div className="card">
      <div className="section-title">
        <h3>Đang đọc</h3>
        <span className="small">{books.length} tựa sách</span>
      </div>
      {books.map((book) => (
        <div className="book-row" key={book.id}>
          <img className="cover" src={book.coverUrl} alt={book.title} />
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{book.title}</div>
                <div className="small">{book.author}</div>
              </div>
              <button className="pill" onClick={() => onSelect(book)}>Review</button>
            </div>
            <div className="progress" style={{ marginTop: 8, marginBottom: 8 }}>
              <div className="progress-inner" style={{ width: `${book.progress}%` }} />
            </div>
            <input
              className="input"
              type="range"
              min={0}
              max={100}
              value={book.progress}
              onChange={(e) => onUpdateProgress(book.id, Number(e.target.value))}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookList;

