import { AuthorFollow } from "../types";

interface AuthorsProps {
  authors: AuthorFollow[];
}

const Authors = ({ authors }: AuthorsProps) => {
  return (
    <div className="card">
      <div className="section-title">
        <h3>Theo dõi tác giả</h3>
        <span className="small">{authors.length} tác giả</span>
      </div>
      {authors.map((author) => (
        <div key={author.id} style={{ padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontWeight: 700 }}>{author.name}</div>
          <div className="small">{author.genres.join(", ")}</div>
          {author.latestBook && <div className="tag">Mới nhất: {author.latestBook}</div>}
        </div>
      ))}
    </div>
  );
};

export default Authors;

