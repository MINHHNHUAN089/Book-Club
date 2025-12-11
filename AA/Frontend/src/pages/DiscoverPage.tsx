import { FormEvent, useState } from "react";
import { searchBooks, GoogleVolume } from "../api/googleBooks";

interface DiscoverPageProps {
  onImport: (volume: GoogleVolume) => void;
}

const DiscoverPage = ({ onImport }: DiscoverPageProps) => {
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
    <div className="card">
      <div className="section-title">
        <h3>Khám phá từ Google Books</h3>
        <span className="small">Tìm kiếm và import metadata</span>
      </div>
      <form className="form" onSubmit={handleSearch} style={{ marginBottom: 12 }}>
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nhập tên sách, tác giả..."
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Đang tìm..." : "Tìm sách"}
        </button>
      </form>
      {error && <div className="tag" style={{ background: "#fee2e2", color: "#b91c1c" }}>{error}</div>}
      <div className="grid">
        {results.map((volume) => (
          <div key={volume.id} className="card" style={{ boxShadow: "none", border: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 700 }}>{volume.volumeInfo.title ?? "Chưa có tiêu đề"}</div>
            <div className="small">{volume.volumeInfo.authors?.join(", ") ?? "Ẩn danh"}</div>
            {volume.volumeInfo.imageLinks?.thumbnail && (
              <img
                src={volume.volumeInfo.imageLinks.thumbnail}
                alt={volume.volumeInfo.title}
                style={{ width: "100%", borderRadius: 12, marginTop: 8 }}
              />
            )}
            <button className="pill" onClick={() => onImport(volume)}>
              Import vào danh sách
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoverPage;


