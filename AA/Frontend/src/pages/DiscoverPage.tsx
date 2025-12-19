import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { searchBooks, GoogleVolume } from "../api/googleBooks";

interface DiscoverPageProps {
  onImport: (volume: GoogleVolume) => void;
}

const DiscoverPage = ({ onImport }: DiscoverPageProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoogleVolume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await searchBooks(query);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tìm kiếm");
    } finally {
      setLoading(false);
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
          <div 
            className="avatar" 
            aria-label="User avatar"
            onClick={() => navigate("/user")}
            style={{ cursor: "pointer" }}
          />
        </div>
      </header>

      <section className="dark-controls">
        <form
          onSubmit={handleSearch}
          style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "600px" }}
        >
          <div className="search" style={{ flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập tên sách, tác giả..."
            />
          </div>
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Đang tìm..." : "Tìm sách"}
          </button>
        </form>
      </section>

      <main className="dark-page-content" style={{ padding: "24px 16px" }}>
        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#fca5a5", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
            {error}
          </div>
        )}
        <div className="book-grid">
          {results.map((volume) => (
            <div key={volume.id} className="book-card">
              {volume.volumeInfo.imageLinks?.thumbnail && (
                <div
                  className="book-cover"
                  style={{ backgroundImage: `url(${volume.volumeInfo.imageLinks.thumbnail})` }}
                  role="img"
                  aria-label={`Bìa sách ${volume.volumeInfo.title}`}
                />
              )}
              <div className="book-meta">
                <div>
                  <p className="book-title">{volume.volumeInfo.title ?? "Chưa có tiêu đề"}</p>
                  <p className="book-author">{volume.volumeInfo.authors?.join(", ") ?? "Ẩn danh"}</p>
                </div>
                <button className="secondary-btn" onClick={() => onImport(volume)}>
                  Import vào danh sách
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DiscoverPage;


