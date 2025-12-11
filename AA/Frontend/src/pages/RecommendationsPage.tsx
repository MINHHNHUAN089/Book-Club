import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Book, Challenge } from "../types";

interface RecommendationsPageProps {
  books: Book[];
  onAddBook?: (book: Book) => void;
}

// Mock popular books data
const popularBooks: Book[] = [
  {
    id: "pop-1",
    title: "Dune",
    author: "Frank Herbert",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBaKXtccuGI2QLj_teTVBP9J1ze6Zukw4tqPI71WwUPR6L1KayUsUedTtmmDAqz3MD0Z5_rA7-wsIdEFSrlVx_bLLopPuz5I4CXrZgR4aD7PS_bjP8F-HhlUdh9Nh9kgEFKFkuxyu3E14kJxI4Qv1VN_t2ZYzfo-XoeSg_3e078MWyVJzjr1Ff-U3d3Ud5cCuh3ndKbdyNt0jBdSjgOCdNKWU4fxQXIscX-348iD6yARKuKiATkDOLtUhzkaT9cruO_qTSjCuoj4eVt",
    progress: 0,
    rating: 0
  },
  {
    id: "pop-2",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmCkvupVpjhdiBGkOGKszGVaaSkmJg9IGQdEKKu__Tb-PBhL37YxtkiKxv8por837IQcnAxTwc_EaDR4bXUaIArM_isxz3b67mCmsAXa72FLpOVe-ah0FXx9da2idTkr7lD_ntXm4lzhG4TZR7gBVAU7e90ucdfKC54S9AB-k-fk2dEVUyOYgP9EBZbfzfPK2P4Gz4hI3f36V_FCeoJF7j5TxP7eK47TLV8jV_jpklNY4qXo9DsS-fQ76WlUZvkc6_8-NB36RAVEa_",
    progress: 0,
    rating: 0
  },
  {
    id: "pop-3",
    title: "Steve Jobs",
    author: "Walter Isaacson",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiPWYX6Qs8HIL3ZfiIwRYf7o5soK8rdt6yQIzq9ZAuYZGeSe2AkSLaPM35F7wxgoenDJWGMrUI-38gKDrJxx2wvyFVg4SoS0P7QJ3T1oRrsJcTikg_NcA-6WFqEKLhfDFq3RIQls1aB6l-Nm7wZ_xkmqXne9KyIbzArLnlXgtMtWahKIXvGqrTqCmpaxdt7P9fSlMHBzgAT3KrJIgzCDJDcEOJI28ppng9ZZ4Ds-NE4I2dSimxhHraKLbHgbMqgy-V0rv-0zxbu6dq",
    progress: 0,
    rating: 0
  },
  {
    id: "pop-4",
    title: "Atomic Habits",
    author: "James Clear",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuChp3cJH5XEGtPpk4S0sLQ3uLEeF-CJM3e-psXK_HH4lRv8eA-LYFhbYFaVZwM6gQAFyTRKJF440jM1goMBfN0996bphBVPTOpmJc6JY_RhDePqGvP6Kz6hevaM9jsC6zBbF9yYd4hIsY_vyTPQE_IWCGbgFNgwOx9uvKseZ0tPrfxmEJMPOnoWVAymB4H0ZHmKM-cLwPqZOe98LBLp9k7CPzPhUxBM0pyR4xdQok5nZ-H6Nu_BK7zcgcbHOBPNOO0ewV1zsOBM6jS4",
    progress: 0,
    rating: 0
  },
  {
    id: "pop-5",
    title: "The Shining",
    author: "Stephen King",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVUvrpcHiK3pSnI2UI5f-y53X0rNMXpsTUodRgW5URiyIxfmn20-MEdqBdSCVykQbweZ8TWylOczbMFOzD2Y5Q-wFAO1pXuoJfsS8bcxBnHihocRIvC4xAVJUgtXdceqSs4fAZ-hQyHuFNVvEWP_8aImOrl8YOqPeEIVTRw1Pam2qqPt2kN0xp98IuRWFai_A8ju65Wzsyv9PE0zTRG6vUL1GCnhfnnHzj-HO1ETpD4oobiD1iFFTV7Y7NgD8piLxDcZIxij93WSvW",
    progress: 0,
    rating: 0
  },
  {
    id: "pop-6",
    title: "Naruto",
    author: "Masashi Kishimoto",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAw5Z9IrkowvMXuLfLh_fIvtYPqD8f_fRivz4WZeBjU7b5Wbu9WC0-5vlt6Ahs8PgJffChwAa3HxSm8xAbI_aW2XvQYdNBIkDfrQUp99xgj3FiQmbEcFEMeVNdlFHv6i0l8CcH08ijp8U9jtZVROSRQkyD8l0fsniqxc0xLFzrR2xR19dsQRDr5vY-C7HHvuPdqXDdBmU4wLUAa61LvVEd_87CGLlSwZYdeq8z-sAfnNLicJ4mSRhY8W_gwRoeTO7s04fxuZKv4RunP",
    progress: 0,
    rating: 0
  },
  {
    id: "pop-7",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOiiBcmkgJwxHXy9aDblYPnzUqrkKnw3trfFdt72tq06gk3S2FIm8Mn8u_QvqnaFsSpnHJLecGTPRQmGhs-C7ql5E6KwvD5Q4fVgFvqHFzE_x8oGf3zFhJ3S2yaqTlInh8RK1D8dPejnzwk2IwI7X9DLOe4UqFRJTqE2Hr_nwg7NvCnFoAl36G0nKOgRRYS-i7eTItJH68eoEAfpIDFbDFWXWrgWFtHAaAkzKlmyc2iBVE1sIt1iSQCUQhOTlG1U4Bh_wjaj6GSEds",
    progress: 0,
    rating: 0
  }
];

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

const RecommendationsPage = ({ books, onAddBook }: RecommendationsPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddBook = (book: Book) => {
    if (onAddBook) {
      onAddBook(book);
    }
  };

  return (
    <div className="discover-page">
      {/* Header */}
      <header className="discover-header">
        <div className="discover-header-left">
          <div className="discover-brand">
            <div className="discover-logo">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="discover-brand-title">BookTracker</h2>
          </div>
          <div className="discover-search-wrapper">
            <div className="discover-search-icon">🔍</div>
            <input
              className="discover-search-input"
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="discover-header-right">
          <div className="discover-nav-links">
            <NavLink to="/books" className={({ isActive }) => `discover-nav-link ${isActive ? "" : ""}`}>
              Thư viện của tôi
            </NavLink>
            <NavLink to="/recommendations" className={({ isActive }) => `discover-nav-link ${isActive ? "active" : ""}`}>
              Khám phá
            </NavLink>
            <NavLink to="/groups" className={({ isActive }) => `discover-nav-link ${isActive ? "" : ""}`}>
              Câu lạc bộ
            </NavLink>
          </div>
          <button className="discover-notification-btn">🔔</button>
          <div className="discover-avatar" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDfZaMfMVCD2kAwBaGJBzos3R3qW1qCgqQd9biZJiDF0nPFbPTIpCVgBw6q5CPwz4TlY0sTtmIFSxv2MZWFzI8xFBAIgYFxxpNVQgyxOlTOFzxGdlo-Rg1V8Y0gqvPIct8gaCrhXyXdal_GdOtaqfyHAH6t1-FtAVOFut3vEldFWm3vnXlhcvguIcgWYurBkhgtAFEES0pxcQpuam2VfotpFgakg3L7cjxYwSX5cFNsNdIVklX9QvBMsSBw4HF5OgCytNxXgjXvXusn")' }} />
        </div>
      </header>

      <main className="discover-main">
        {/* Section 1: Recommended for you */}
        <section className="discover-section">
          <h2 className="discover-section-title">Gợi ý cho bạn</h2>
          <div className="discover-scroll-container">
            <div className="discover-scroll-content">
              {books.map((book) => (
                <div key={book.id} className="discover-recommend-card">
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
                      onClick={() => handleAddBook(book)}
                    >
                      Add to list
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Popular Books */}
        <section className="discover-section">
          <h2 className="discover-section-title">Sách thịnh hành</h2>
          <div className="discover-scroll-container">
            <div className="discover-scroll-content">
              {popularBooks.map((book) => (
                <div key={book.id} className="discover-popular-card">
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


