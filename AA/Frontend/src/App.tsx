import { useMemo, useState, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useSearchParams } from "react-router-dom";
import "./index.css";
import BooksPage from "./pages/BooksPage";
import ReviewPage from "./pages/ReviewPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import ChallengesPage from "./pages/ChallengesPage";
import AuthorsPage from "./pages/AuthorsPage";
import DiscoverPage from "./pages/DiscoverPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from "./pages/LandingPage";
import UserPage from "./pages/UserPage";
import AdminPage from "./pages/AdminPage";
import ReadingPage from "./pages/ReadingPage";
import { GoogleVolume } from "./api/googleBooks";
import {
  getMyBooks,
  getBooks,
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
  const [allBooks, setAllBooks] = useState<Book[]>([]);
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
            fileUrl: ub.book?.file_url || undefined,
            progress: ub.progress || 0,
            rating: ub.rating || undefined,
            review: undefined, // Will be loaded separately if needed
            description: ub.book?.description || undefined,
          };
        } catch (err) {
          console.error("Error converting UserBook to Book:", err, ub);
          return null;
        }
      })
      .filter((book): book is Book => book !== null); // Remove null entries
  }, [userBooks]);

  const selectedBookId = useMemo(() => books[0]?.id ?? null, [books]);

  // Listen for challenges updates from AdminPage
  useEffect(() => {
    const handleChallengesUpdate = async () => {
      try {
        const updatedChallenges = await getChallenges();
        setChallenges(updatedChallenges);
        console.log("Challenges reloaded after admin update");
      } catch (err) {
        console.error("Error reloading challenges after admin update:", err);
      }
    };

    window.addEventListener('challengesUpdated', handleChallengesUpdate);

    return () => {
      window.removeEventListener('challengesUpdated', handleChallengesUpdate);
    };
  }, []);

  // Listen for groups updates from AdminPage
  useEffect(() => {
    const handleGroupsUpdate = async () => {
      try {
        const updatedGroups = await getGroups();
        setGroups(updatedGroups);
        console.log("Groups reloaded after admin update");
      } catch (err) {
        console.error("Error reloading groups after admin update:", err);
      }
    };

    window.addEventListener('groupsUpdated', handleGroupsUpdate);

    return () => {
      window.removeEventListener('groupsUpdated', handleGroupsUpdate);
    };
  }, []);

  // Listen for progress updates from ReadingPage
  useEffect(() => {
    const handleProgressUpdate = async (event: CustomEvent) => {
      const { bookId, progress } = event.detail;
      console.log("Progress update event received:", bookId, progress);
      
      // Reload userBooks to sync progress
      try {
        const updatedBooks = await getMyBooks();
        setUserBooks(updatedBooks);
        console.log("UserBooks reloaded after progress update");
      } catch (err) {
        console.error("Error reloading books after progress update:", err);
      }
    };

    window.addEventListener('bookProgressUpdated', handleProgressUpdate as EventListener);
    
    return () => {
      window.removeEventListener('bookProgressUpdated', handleProgressUpdate as EventListener);
    };
  }, []);

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

        // Add timeout wrapper for API calls
        const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
          return Promise.race([
            promise,
            new Promise<T>((_, reject) => 
              setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
            )
          ]);
        };

        const [booksData, allBooksData, groupsData, challengesData, authorsData] = await Promise.all([
          withTimeout(getMyBooks().catch((err) => {
            console.error("Error loading my books:", err);
            console.error("Error details:", err.message, err.stack);
            return [];
          }), 15000),
          withTimeout(getBooks().catch((err) => {
            console.error("Error loading all books:", err);
            console.error("Error details:", err.message, err.stack);
            return [];
          }), 15000),
          withTimeout(getGroups().catch((err) => {
            console.error("Error loading groups:", err);
            console.error("Error details:", err.message, err.stack);
            return [];
          }), 15000),
          withTimeout(getChallenges().catch((err) => {
            console.error("Error loading challenges:", err);
            return [];
          }), 10000),
          withTimeout(getAuthors().catch((err) => {
            console.error("Error loading authors:", err);
            return [];
          }), 10000),
        ]);

        console.log("Loaded books data:", booksData);
        console.log("Loaded all books data:", allBooksData);
        console.log("Total books loaded:", booksData.length);
        console.log("Total all books loaded:", allBooksData ? allBooksData.length : "null/undefined");
        
        // Debug: Check rating in userBooks
        console.log("Sample userBooks with ratings:", booksData.slice(0, 5).map((ub: any) => ({
          book_id: ub.book_id,
          book_title: ub.book?.title,
          rating: ub.rating,
          ratingType: typeof ub.rating
        })));
        
        setUserBooks(booksData);
        
        // Check if allBooksData is valid
        if (!allBooksData) {
          console.error("allBooksData is null or undefined");
          setAllBooks([]);
        } else if (!Array.isArray(allBooksData)) {
          console.error("allBooksData is not an array:", allBooksData, typeof allBooksData);
          setAllBooks([]);
        } else if (allBooksData.length === 0) {
          console.warn("allBooksData is empty array - no books in database");
          setAllBooks([]);
        } else {
          // Create a map of userBooks by book_id for quick lookup
          const userBooksMap = new Map<number, typeof booksData[0]>();
          booksData.forEach((ub: any) => {
            if (ub && ub.book_id) {
              userBooksMap.set(ub.book_id, ub);
            }
          });
          
          // Convert all books to Book format, merging with user data if available
          const convertedAllBooks: Book[] = allBooksData
            .filter((book: any) => book && book.id && book.title) // Filter out invalid books
            .map((book: any) => {
              const authorName = book.authors && book.authors.length > 0
                ? book.authors.map((a: any) => a.name).join(", ")
                : book.author || "Unknown";
              
              // Check if user has this book in their list
              const userBook = userBooksMap.get(book.id);
              
              return {
                id: book.id.toString(),
                title: book.title,
                author: authorName,
                coverUrl: book.cover_url,
                fileUrl: book.file_url,
                progress: userBook ? (userBook.progress || 0) : 0,
                // Keep rating as number if it exists, otherwise undefined (not 0)
                rating: userBook && userBook.rating != null && userBook.rating !== undefined 
                  ? Number(userBook.rating) 
                  : undefined,
                description: book.description,
              };
            });
          console.log("Converted allBooks:", convertedAllBooks.length);
          console.log("Sample books with ratings:", convertedAllBooks.slice(0, 5).map(b => ({
            id: b.id,
            title: b.title,
            rating: b.rating,
            ratingType: typeof b.rating
          })));
          setAllBooks(convertedAllBooks);
        }
        
        setGroups(groupsData);
        setChallenges(challengesData);
        setAuthors(authorsData);
      } catch (err) {
        console.error("Error loading data:", err);
        // Show error message if it's a server error
        if (err instanceof Error) {
          if (err.message.includes("timeout")) {
            setError("Backend không phản hồi. Vui lòng kiểm tra backend có đang chạy không.");
          } else if (err.message.includes("server") || err.message.includes("Lỗi server")) {
            setError("Lỗi server. Vui lòng kiểm tra backend logs hoặc thử lại sau.");
          } else {
            setError(err.message);
          }
        } else {
          setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        }
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
      // Wait a bit to ensure backend has updated user_books
      await new Promise(resolve => setTimeout(resolve, 300));
      // Reload books to get updated rating
      try {
        const [updatedBooks, updatedAllBooks] = await Promise.all([
          getMyBooks(),
          getBooks()
        ]);
        setUserBooks(updatedBooks);
        
        // Update allBooks with new rating from userBooks
        if (Array.isArray(updatedAllBooks)) {
          const userBooksMap = new Map<number, typeof updatedBooks[0]>();
          updatedBooks.forEach((ub: any) => {
            if (ub && ub.book_id) {
              userBooksMap.set(ub.book_id, ub);
            }
          });
          
          const updatedConvertedAllBooks: Book[] = updatedAllBooks.map((book: any) => {
            const authorName = book.authors && book.authors.length > 0
              ? book.authors.map((a: any) => a.name).join(", ")
              : book.author || "Unknown";
            
            const userBook = userBooksMap.get(book.id);
            
            return {
              id: book.id.toString(),
              title: book.title,
              author: authorName,
              coverUrl: book.cover_url,
              fileUrl: book.file_url,
              progress: userBook ? (userBook.progress || 0) : 0,
              // Keep rating as number if it exists, otherwise undefined (not 0)
              rating: userBook && userBook.rating != null && userBook.rating !== undefined 
                ? Number(userBook.rating) 
                : undefined,
              description: book.description,
            };
          });
          console.log("Updated allBooks after review save - Sample ratings:", updatedConvertedAllBooks.slice(0, 5).map(b => ({
            id: b.id,
            title: b.title,
            rating: b.rating
          })));
          setAllBooks(updatedConvertedAllBooks);
          // books will be automatically updated via useMemo when userBooks changes
        }
        
        console.log("Books reloaded after review save, rating should be updated");
      } catch (reloadErr) {
        console.error("Error reloading books:", reloadErr);
        // Don't throw, just log - review was saved successfully
      }
    } catch (err) {
      console.error("Error saving review:", err);
      throw err; // Re-throw để ReviewForm có thể xử lý
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
      <div className="app-shell-dark" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "20px" }}>
        <div style={{ color: "#fca5a5", fontSize: "18px", marginBottom: "16px", textAlign: "center" }}>⚠️ Lỗi: {error}</div>
        <div style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", maxWidth: "600px" }}>
          <p style={{ marginBottom: "12px" }}>Có thể do:</p>
          <ul style={{ textAlign: "left", listStyle: "disc", paddingLeft: "20px" }}>
            <li>Backend không đang chạy - Kiểm tra terminal backend</li>
            <li>Database không kết nối được - Kiểm tra PostgreSQL</li>
            <li>Database chưa có dữ liệu - Chạy script insert dữ liệu</li>
          </ul>
          <p style={{ marginTop: "16px" }}>
            <strong>Giải pháp:</strong> Mở terminal backend và kiểm tra logs để xem lỗi chi tiết.
          </p>
        </div>
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
                    allBooks={allBooks}
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
                    allBooks={allBooks}
                    userBooks={userBooks
                      .filter(ub => ub && ub.id != null && ub.book_id != null)
                      .map(ub => ({ id: ub.id, book_id: ub.book_id, progress: ub.progress || 0 }))}
                    selectedBook={selectedBook}
                    onSelectBook={(book) => {
                      const bookId = book.id;
                      // Update selectedBookId logic if needed
                    }}
                    onSaveReview={handleReviewSave}
                    onBookAdded={async () => {
                      // Reload user books after adding
                      const updatedBooks = await getMyBooks();
                      setUserBooks(updatedBooks);
                    }}
                    onProgressUpdated={async () => {
                      // Reload user books after updating progress
                      const updatedBooks = await getMyBooks();
                      setUserBooks(updatedBooks);
                    }}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reading"
              element={
                <ProtectedRoute>
                  <ReadingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <RecommendationsPage books={recommendations} allBooks={allBooks} onAddBook={handleAddBookFromRecommendations} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <GroupsPage 
                    groups={groups} 
                    onGroupCreated={async () => {
                      const updatedGroups = await getGroups();
                      setGroups(updatedGroups);
                    }}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:id"
              element={
                <ProtectedRoute>
                  <GroupDetailPage />
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
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
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

