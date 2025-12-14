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
  role?: string;
  is_active?: boolean;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Đăng ký thất bại";
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
      } catch {
        errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    if (result.access_token) {
      setToken(result.access_token);
    }
    return result;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.");
    }
    throw error;
  }
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

export async function updateUser(data: { name?: string; email?: string }): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể cập nhật thông tin");
  }

  return response.json();
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể đổi mật khẩu");
  }
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

export async function createGroup(groupData: {
  name: string;
  description?: string;
  topic?: string;
  current_book_id?: number;
}): Promise<Group> {
  const response = await fetch(`${API_BASE_URL}/groups`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(groupData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể tạo câu lạc bộ");
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

export async function leaveGroup(groupId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/leave`, {
    method: "POST",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể rời câu lạc bộ");
  }
}

export async function getMyGroups(): Promise<Group[]> {
  const response = await fetch(`${API_BASE_URL}/groups/user/my-groups`, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách câu lạc bộ của tôi");
  }

  return response.json();
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

export async function leaveChallenge(challengeId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/leave`, {
    method: "POST",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể rời thử thách");
  }
}

export interface UserChallenge {
  challenge: Challenge;
  progress: number;
  completed: boolean;
}

export async function getMyChallenges(): Promise<UserChallenge[]> {
  const response = await fetch(`${API_BASE_URL}/challenges/user/my-challenges`, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách thử thách của tôi");
  }

  return response.json();
}

export async function updateChallengeProgress(
  challengeId: number,
  progress: number
): Promise<UserChallenge> {
  const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/progress`, {
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

export async function unfollowAuthor(authorId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/authors/${authorId}/unfollow`, {
    method: "POST",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể unfollow tác giả");
  }
}

export async function getFollowedAuthors(): Promise<Author[]> {
  const response = await fetch(`${API_BASE_URL}/authors/user/followed`, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách tác giả đang theo dõi");
  }

  return response.json();
}

// ============================================
// ADMIN API
// ============================================

export async function getAdminStats(): Promise<{
  total_users: number;
  total_books: number;
  total_reviews: number;
  total_groups: number;
  total_challenges: number;
  total_user_books: number;
  active_users: number;
  admin_users: number;
}> {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể lấy thống kê");
  }

  return response.json();
}

export async function getAllUsers(search?: string, role?: string): Promise<User[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (role) params.append("role", role);
  
  const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể lấy danh sách người dùng");
  }

  return response.json();
}

export async function updateUserAdmin(
  userId: number,
  data: { name?: string; email?: string; role?: string; is_active?: boolean }
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể cập nhật người dùng");
  }

  return response.json();
}

export async function deleteUserAdmin(userId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể xóa người dùng");
  }
}

export async function deleteBookAdmin(bookId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/books/${bookId}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể xóa sách");
  }
}

export async function deleteReviewAdmin(reviewId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể xóa đánh giá");
  }
}

export async function deleteGroupAdmin(groupId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/groups/${groupId}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể xóa câu lạc bộ");
  }
}

export async function deleteChallengeAdmin(challengeId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/challenges/${challengeId}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể xóa thử thách");
  }
}

