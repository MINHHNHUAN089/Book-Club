// API Base URL
const API_BASE_URL = "http://localhost:8000/api";

// Helper function để get token từ localStorage
function getToken(): string | null {
  return localStorage.getItem("token");
}

// Helper function để set token vào localStorage
function setToken(token: string): void {
  localStorage.setItem("token", token);
}

// Helper function để remove token
function removeToken(): void {
  localStorage.removeItem("token");
}

// Helper function để tạo headers với auth
function getHeaders(includeAuth: boolean = true): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

// ============================================
// AUTH API
// ============================================

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Đăng ký thất bại");
  }

  const result = await response.json();
  if (result.access_token) {
    setToken(result.access_token);
  }
  return result;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username: data.email,
      password: data.password,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Đăng nhập thất bại");
  }

  const result = await response.json();
  if (result.access_token) {
    setToken(result.access_token);
  }
  return result;
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy thông tin người dùng");
  }

  return response.json();
}

export function logout(): void {
  removeToken();
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// ============================================
// BOOKS API
// ============================================

export interface Book {
  id: number;
  title: string;
  author?: string;
  description?: string;
  cover_url?: string;
  isbn?: string;
  page_count?: number;
  published_date?: string;
  authors?: Array<{ id: number; name: string; bio?: string; avatar_url?: string }>;
}

export interface UserBook {
  id: number;
  book_id: number;
  user_id: number;
  progress: number;
  rating?: number;
  status: "want_to_read" | "reading" | "completed" | "paused";
  book: Book;
}

export async function getBooks(): Promise<Book[]> {
  const response = await fetch(`${API_BASE_URL}/books`, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách sách");
  }

  return response.json();
}

export async function getMyBooks(): Promise<UserBook[]> {
  const response = await fetch(`${API_BASE_URL}/books/user/my-books`, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách sách của bạn");
  }

  return response.json();
}

export async function createBook(book: Partial<Book>): Promise<Book> {
  const response = await fetch(`${API_BASE_URL}/books`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể tạo sách");
  }

  return response.json();
}

export async function addBookToMyList(bookId: number): Promise<UserBook> {
  const response = await fetch(`${API_BASE_URL}/books/user/add`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({ book_id: bookId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể thêm sách vào danh sách");
  }

  return response.json();
}

export async function updateBookProgress(userBookId: number, progress: number): Promise<UserBook> {
  const response = await fetch(`${API_BASE_URL}/books/user/${userBookId}`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify({ progress }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể cập nhật tiến độ");
  }

  return response.json();
}

// ============================================
// REVIEWS API
// ============================================

export interface Review {
  id: number;
  user_id: number;
  book_id: number;
  rating: number;
  review_text: string;
  created_at: string;
  updated_at: string;
}

export async function createReview(bookId: number, rating: number, reviewText: string): Promise<Review> {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({
      book_id: bookId,
      rating,
      review_text: reviewText,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể tạo đánh giá");
  }

  return response.json();
}

export async function getBookReviews(bookId: number): Promise<Review[]> {
  const response = await fetch(`${API_BASE_URL}/reviews?book_id=${bookId}`, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy đánh giá");
  }

  return response.json();
}

// ============================================
// GROUPS API
// ============================================

export interface Group {
  id: number;
  name: string;
  description?: string;
  topic?: string;
  cover_url?: string;
  current_book?: { id: number; title: string } | null;
  members_count?: number;
  created_at?: string;
}

export async function getGroups(): Promise<Group[]> {
  const response = await fetch(`${API_BASE_URL}/groups`, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách câu lạc bộ");
  }

  return response.json();
}

export async function joinGroup(groupId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/join`, {
    method: "POST",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể tham gia câu lạc bộ");
  }
}

// ============================================
// CHALLENGES API
// ============================================

export interface Challenge {
  id: number;
  title: string; // Backend uses 'title', not 'name'
  description?: string;
  target_books: number; // Backend uses 'target_books', not 'target_count'
  start_date: string;
  end_date: string;
  cover_url?: string;
  xp_reward?: number;
  badge?: string;
  tags?: string;
  status?: "active" | "not_joined" | "completed";
}

export async function getChallenges(): Promise<Challenge[]> {
  const response = await fetch(`${API_BASE_URL}/challenges`, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách thử thách");
  }

  return response.json();
}

export async function joinChallenge(challengeId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/join`, {
    method: "POST",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể tham gia thử thách");
  }
}

// ============================================
// AUTHORS API
// ============================================

export interface Author {
  id: number;
  name: string;
  bio?: string;
  avatar_url?: string;
}

export async function getAuthors(): Promise<Author[]> {
  const response = await fetch(`${API_BASE_URL}/authors`, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách tác giả");
  }

  return response.json();
}

export async function followAuthor(authorId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/authors/${authorId}/follow`, {
    method: "POST",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể follow tác giả");
  }
}

