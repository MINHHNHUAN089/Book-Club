import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Book, Challenge } from "../types";

interface RecommendationsPageProps {
  books: Book[];
  allBooks?: Book[];
  onAddBook?: (book: Book) => void;
}


// Enhanced challenges data
const enhancedChallenges: Challenge[] = [
  {
    id: "ch-enhanced-1",
    name: "2024 Reading Challenge",
    target: "Read 50 books before the end of the year. Track your progress and earn badges!",
    progress: 45,
    due: "Dec 31, 2024"
  },
  {
    id: "ch-enhanced-2",
    name: "Summer Sci-Fi Sprint",
    target: "Explore 5 classic and modern science fiction novels this summer.",
    progress: 80,
    due: "Aug 31, 2024"
  },
  {
    id: "ch-enhanced-3",
    name: "Around the World in 8 Books",
    target: "Read books from 8 different continents or cultural regions.",
    progress: 12,
    due: "Dec 31, 2024"
  }
];

const RecommendationsPage = ({ books, allBooks = [], onAddBook }: RecommendationsPageProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Lấy 10 cuốn đầu tiên từ allBooks cho "Sách thịnh hành"
  const popularBooks = useMemo(() => {
    return allBooks.slice(0, 10);
  }, [allBooks]);

  // Lọc sách gợi ý theo search query
  const filteredRecommendations = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const query = searchQuery.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );
  }, [books, searchQuery]);

  const handleAddBook = (book: Book) => {
    if (onAddBook) {
      onAddBook(book);
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
          <button className="primary-btn" onClick={() => navigate("/discover")}>+ Thêm sách</button>
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
            placeholder="Tìm kiếm sách gợi ý..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      <main className="dark-page-content" style={{ padding: "24px 16px" }}>
        {/* Section 1: Recommended for you */}
        <section className="discover-section">
          <h2 className="discover-section-title">Gợi ý cho bạn</h2>
          <div className="discover-scroll-container">
            <div className="discover-scroll-content">
              {filteredRecommendations.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#94a3b8",
                  width: "100%"
                }}>
                  <p>Không tìm thấy sách nào phù hợp với từ khóa "{searchQuery}"</p>
                </div>
              ) : (
                filteredRecommendations.map((book) => (
                <div 
                  key={book.id} 
                  className="discover-recommend-card"
                  onClick={() => navigate(`/review?bookId=${book.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="discover-book-cover-large"
                    style={{ backgroundImage: `url(${book.coverUrl || "https://via.placeholder.com/240x320"})` }}
                  />
                  <div className="discover-card-content">
                    <div>
                      <p className="discover-book-title">{book.title}</p>
                      <p className="discover-book-author">{book.author}</p>
                    </div>
                    <button
                      className="discover-add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddBook(book);
                      }}
                    >
                      Add to list
                    </button>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Popular Books */}
        <section className="discover-section">
          <h2 className="discover-section-title">Sách thịnh hành</h2>
          <div className="discover-scroll-container">
            <div className="discover-scroll-content">
              {popularBooks.map((book) => (
                <div 
                  key={book.id} 
                  className="discover-popular-card"
                  onClick={() => navigate(`/review?bookId=${book.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="discover-book-cover-small"
                    style={{ backgroundImage: `url(${book.coverUrl || "https://via.placeholder.com/160x213"})` }}
                  />
                  <div>
                    <p className="discover-book-title-small">{book.title}</p>
                    <p className="discover-book-author-small">{book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Reading Challenges */}
        <section className="discover-section">
          <h2 className="discover-section-title">Thử thách đọc sách</h2>
          <div className="discover-challenges-grid">
            {enhancedChallenges.map((challenge) => {
              const current = Math.round((challenge.progress / 100) * (challenge.name.includes("50") ? 50 : challenge.name.includes("5") ? 5 : 8));
              const total = challenge.name.includes("50") ? 50 : challenge.name.includes("5") ? 5 : 8;
              return (
                <div key={challenge.id} className="discover-challenge-card">
                  <h3 className="discover-challenge-title">{challenge.name}</h3>
                  <p className="discover-challenge-desc">{challenge.target}</p>
                  <div className="discover-challenge-progress-bar">
                    <div
                      className="discover-challenge-progress-fill"
                      style={{ width: `${challenge.progress}%` }}
                    />
                  </div>
                  <div className="discover-challenge-stats">
                    <span className="discover-challenge-progress-text">
                      Progress: {current}/{total}
                    </span>
                    <span className="discover-challenge-percent">{challenge.progress}%</span>
                  </div>
                  <button className={challenge.progress > 0 ? "discover-challenge-btn-primary" : "discover-challenge-btn-secondary"}>
                    {challenge.progress > 0 ? "View Challenge" : "Join Now"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default RecommendationsPage;


