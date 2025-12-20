import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BookList from "../components/BookList";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Book } from "../types";
import { getFollowedBooks } from "../api/backend";

type Filter = "all" | "following";

interface BooksPageProps {
  books: Book[];
  allBooks: Book[];
  onUpdateProgress: (bookId: string, progress: number) => void;
}

const BooksPage = ({ books, allBooks, onUpdateProgress }: BooksPageProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const tabFromUrl = searchParams.get("tab");
  const [filter, setFilter] = useState<Filter>(tabFromUrl === "following" ? "following" : "all");
  const [followedBooks, setFollowedBooks] = useState<Book[]>([]);
  const [loadingFollowed, setLoadingFollowed] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("BooksPage - allBooks:", allBooks?.length || 0, "books:", books?.length || 0);
    console.log("BooksPage - allBooks sample:", allBooks?.slice(0, 3));
  }, [allBooks, books]);

  // Update URL when filter changes
  useEffect(() => {
    if (filter === "following") {
      setSearchParams({ tab: "following" });
    } else {
      setSearchParams({});
    }
  }, [filter, setSearchParams]);

  // Fetch followed books when filter changes to "following"
  useEffect(() => {
    const fetchFollowedBooks = async () => {
      if (filter === "following") {
        setLoadingFollowed(true);
        try {
          const followed = await getFollowedBooks();
          // Map API response (snake_case) to frontend Book type (camelCase)
          const mappedFollowed: Book[] = followed.map((book: any) => {
            const authorName = book.authors && book.authors.length > 0
              ? book.authors.map((a: any) => a.name).join(", ")
              : book.author || "Unknown";
            
            return {
              id: book.id.toString(),
              title: book.title,
              author: authorName,
              coverUrl: book.cover_url, // Map cover_url to coverUrl
              fileUrl: book.file_url,
              progress: 0, // Followed books don't have progress
              rating: book.average_rating != null ? Number(book.average_rating) : undefined,
              description: book.description,
            };
          });
          console.log("[BooksPage] Mapped followed books:", mappedFollowed.length, mappedFollowed);
          setFollowedBooks(mappedFollowed);
        } catch (err) {
          console.error("Error fetching followed books:", err);
          setFollowedBooks([]);
        } finally {
          setLoadingFollowed(false);
        }
      }
    };

    fetchFollowedBooks();
  }, [filter]);

  const filteredBooks = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase();
    
    // Chọn danh sách sách để hiển thị
    // Nếu filter là "following", dùng followedBooks
    // Nếu filter là "all", dùng allBooks, nhưng nếu allBooks rỗng thì fallback về books (userBooks)
    let booksToShow: Book[] = [];
    if (filter === "following") {
      booksToShow = followedBooks;
    } else {
      // Fallback: nếu allBooks rỗng, dùng books (userBooks)
      booksToShow = (allBooks && allBooks.length > 0) ? allBooks : books;
    }
    
    if (booksToShow.length === 0) {
      return [];
    }
    
    const filtered = booksToShow.filter((b) => {
      if (!b || !b.title) {
        return false;
      }
      
      const matchesSearch =
        !search.trim() ||
        normalize(b.title).includes(normalize(search)) ||
        normalize(b.author || "").includes(normalize(search));

      return matchesSearch;
    });
    
    return filtered;
  }, [allBooks, books, followedBooks, filter, search]);

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
        <div className="search">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Tìm kiếm theo tên sách, tác giả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="tabs" style={{ marginBottom: "16px" }}>
          <button
            className={filter === "all" ? "tab active" : "tab"}
            onClick={() => setFilter("all")}
            type="button"
          >
            Tất cả sách
          </button>
          <button
            className={filter === "following" ? "tab active" : "tab"}
            onClick={() => setFilter("following")}
            type="button"
          >
            Theo dõi
          </button>
        </div>
      </section>

      {loadingFollowed && filter === "following" ? (
        <div className="user-empty-state">
          Đang tải danh sách sách đang theo dõi...
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="user-empty-state">
          {filter === "following" 
            ? "Bạn chưa có sách nào đang theo dõi."
            : "Không tìm thấy sách nào."}
        </div>
      ) : (
        <BookList
          books={filteredBooks}
          onUpdateProgress={undefined}
          onSelect={(book) => navigate(`/review?bookId=${book.id}`)}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default BooksPage;

