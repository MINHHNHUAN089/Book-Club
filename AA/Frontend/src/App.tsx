import { useMemo, useState, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useSearchParams } from "react-router-dom";
import "./index.css";
import BooksPage from "./pages/BooksPage";
import ReviewPage from "./pages/ReviewPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import GroupsPage from "./pages/GroupsPage";
import ChallengesPage from "./pages/ChallengesPage";
import AuthorsPage from "./pages/AuthorsPage";
import DiscoverPage from "./pages/DiscoverPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from "./pages/LandingPage";
import UserPage from "./pages/UserPage";
import { GoogleVolume } from "./api/googleBooks";
import {
  getMyBooks,
  updateBookProgress,
  createBook,
  addBookToMyList,
  createReview,
  getGroups,
  getChallenges,
  getAuthors,
  isAuthenticated,
  UserBook,
  Book as APIBook,
  Group,
  Challenge,
  Author,
} from "./api/backend";
import { Book } from "./types";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  if (!isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
};

const App = () => {
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert UserBook to Book format for compatibility
  const books: Book[] = useMemo(() => {
    if (!userBooks || userBooks.length === 0) {
      return [];
    }
    
    return userBooks
      .filter((ub) => ub && ub.book) // Filter out invalid entries
      .map((ub) => {
        try {
          // Get author name from authors array or fallback
          let authorName = "Unknown";
          if (ub.book.authors && Array.isArray(ub.book.authors) && ub.book.authors.length > 0) {
            authorName = ub.book.authors.map((a: any) => a?.name || "").filter(Boolean).join(", ") || "Unknown";
          } else if (ub.book.author) {
            // Fallback to author field if authors array doesn't exist
            authorName = ub.book.author;
          }
          
          return {
            id: ub.book_id?.toString() || ub.book?.id?.toString() || "",
            title: ub.book?.title || "Untitled",
            author: authorName,
            coverUrl: ub.book?.cover_url || undefined,
            progress: ub.progress || 0,
            rating: ub.rating || undefined,
            review: undefined, // Will be loaded separately if needed
          };
        } catch (err) {
          console.error("Error converting UserBook to Book:", err, ub);
          return null;
        }
      })
      .filter((book): book is Book => book !== null); // Remove null entries
  }, [userBooks]);

  const selectedBookId = useMemo(() => books[0]?.id ?? null, [books]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [booksData, groupsData, challengesData, authorsData] = await Promise.all([
          getMyBooks().catch((err) => {
            console.error("Error loading books:", err);
            return [];
          }),
          getGroups().catch(() => []),
          getChallenges().catch(() => []),
          getAuthors().catch(() => []),
        ]);

        console.log("Loaded books data:", booksData);
        console.log("Total books loaded:", booksData.length);
        setUserBooks(booksData);
        setGroups(groupsData);
        setChallenges(challengesData);
        setAuthors(authorsData);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedBook = useMemo(
    () => books.find((b) => b.id === selectedBookId) ?? null,
    [books, selectedBookId]
  );

  const recommendations = useMemo(
    () =>
      [...books]
        .filter((b) => (b.rating ?? 0) >= 4)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 3),
    [books]
  );

  const handleUpdateProgress = async (bookId: string, progress: number) => {
    try {
      const userBook = userBooks.find((ub) => ub.book_id.toString() === bookId);
      if (!userBook) return;

      const updated = await updateBookProgress(userBook.id, progress);
      setUserBooks((prev) => prev.map((ub) => (ub.id === userBook.id ? updated : ub)));
    } catch (err) {
      console.error("Error updating progress:", err);
      alert(err instanceof Error ? err.message : "Không thể cập nhật tiến độ");
    }
  };

  const handleReviewSave = async (bookId: string, rating: number, review: string) => {
    try {
      await createReview(parseInt(bookId), rating, review);
      // Reload books to get updated review
      const updatedBooks = await getMyBooks();
      setUserBooks(updatedBooks);
    } catch (err) {
      console.error("Error saving review:", err);
      alert(err instanceof Error ? err.message : "Không thể lưu đánh giá");
    }
  };

  const handleImportBook = async (volume: GoogleVolume) => {
    try {
      const title = volume.volumeInfo.title ?? "Sách chưa có tiêu đề";
      const author = volume.volumeInfo.authors?.join(", ") ?? "Ẩn danh";
      const coverUrl = volume.volumeInfo.imageLinks?.thumbnail;
      const description = volume.volumeInfo.description;
      const isbn = volume.volumeInfo.industryIdentifiers?.[0]?.identifier;

      // Create book in backend
      const newBook = await createBook({
        title,
        author,
        cover_url: coverUrl,
        description,
        isbn,
      });

      // Add to user's list
      const userBook = await addBookToMyList(newBook.id);
      setUserBooks((prev) => [...prev, userBook]);
    } catch (err) {
      console.error("Error importing book:", err);
      alert(err instanceof Error ? err.message : "Không thể thêm sách");
    }
  };

  const handleAddBookFromRecommendations = async (book: Book) => {
    try {
      const bookId = parseInt(book.id);
      if (isNaN(bookId)) {
        alert("Không thể thêm sách này");
        return;
      }

      const userBook = await addBookToMyList(bookId);
      setUserBooks((prev) => [...prev, userBook]);
    } catch (err) {
      console.error("Error adding book:", err);
      alert(err instanceof Error ? err.message : "Không thể thêm sách");
    }
  };

  if (loading) {
    return (
      <div className="app-shell-dark" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ color: "#e2e8f0", fontSize: "18px" }}>Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell-dark" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ color: "#fca5a5", fontSize: "18px" }}>Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-shell-dark">
        <div className="app-container-dark">
          <Routes>
            <Route
              path="/login"
              element={<LoginPage />}
            />
            <Route
              path="/register"
              element={<RegisterPage />}
            />
            <Route
              path="/books"
              element={
                <ProtectedRoute>
                  <BooksPage
                    books={books}
                    onUpdateProgress={handleUpdateProgress}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review"
              element={
                <ProtectedRoute>
                  <ReviewPage
                    books={books}
                    selectedBook={selectedBook}
                    onSelectBook={(book) => {
                      const bookId = book.id;
                      // Update selectedBookId logic if needed
                    }}
                    onSaveReview={handleReviewSave}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <RecommendationsPage books={recommendations} onAddBook={handleAddBookFromRecommendations} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <GroupsPage groups={groups} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/challenges"
              element={
                <ProtectedRoute>
                  <ChallengesPage challenges={challenges} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authors"
              element={
                <ProtectedRoute>
                  <AuthorsPage authors={authors} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discover"
              element={
                <ProtectedRoute>
                  <DiscoverPage onImport={handleImportBook} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user"
              element={
                <ProtectedRoute>
                  <UserPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/" 
              element={<LandingPage />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;

