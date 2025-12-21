// API Base URL - Use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

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
  try {
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
      let errorMessage = "Đăng nhập thất bại";
      try {
        const error = await response.json();
        errorMessage = error.detail || errorMessage;
      } catch {
        // Nếu không parse được JSON, dùng message mặc định
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
    // Xử lý lỗi network hoặc CORS
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra xem backend server đã chạy chưa (http://localhost:8000)");
    }
    // Re-throw các lỗi khác
    throw error;
  }
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
  file_url?: string;
  isbn?: string;
  page_count?: number;
  published_date?: string;
  authors?: Array<{ id: number; name: string; bio?: string; avatar_url?: string }>;
  average_rating?: number;
  total_reviews?: number;
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

export async function getBook(bookId: number): Promise<Book> {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
    method: "GET",
    headers: getHeaders(false),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("getBook error:", response.status, errorText);
    throw new Error(`Lỗi khi lấy thông tin sách: ${response.status}`);
  }

  return await response.json();
}

export async function getBooks(): Promise<Book[]> {
  const response = await fetch(`${API_BASE_URL}/books`, {
    method: "GET",
    headers: getHeaders(false), // Books endpoint doesn't require auth
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("getBooks error:", response.status, errorText);
    if (response.status === 401) {
      // Token invalid, clear it
      removeToken();
    }
    if (response.status >= 500) {
      throw new Error("Lỗi server. Vui lòng kiểm tra backend có đang chạy không.");
    }
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
    if (response.status === 401) {
      // Token invalid, clear it
      removeToken();
    }
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

export async function updateBook(bookId: number, book: Partial<Book>): Promise<Book> {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể cập nhật sách");
  }

  return response.json();
}

export async function uploadBookFile(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload/book-file`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể upload file");
  }

  const result = await response.json();
  return { url: result.url, filename: result.filename };
}

export async function uploadBookCover(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload/book-cover`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể upload ảnh bìa");
  }

  const result = await response.json();
  return { url: result.url, filename: result.filename };
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

export async function followBook(bookId: number): Promise<Book> {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}/follow`, {
    method: "POST",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể theo dõi sách");
  }

  return response.json();
}

export async function unfollowBook(bookId: number): Promise<Book> {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}/unfollow`, {
    method: "POST",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể bỏ theo dõi sách");
  }

  return response.json();
}

export async function getFollowedBooks(): Promise<Book[]> {
  const response = await fetch(`${API_BASE_URL}/books/user/followed`, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách sách đang theo dõi");
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
  user_name?: string; // User name for display
  user?: { id: number; name: string }; // Full user object if available
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

export async function deleteReview(reviewId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể xóa đánh giá");
  }
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
  current_book?: { id: number; title: string; authors?: Array<{ id: number; name: string }> } | null;
  members_count?: number;
  created_by?: number;
  created_at?: string;
}

export interface GroupMember {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  role?: string;
}

export interface GroupDiscussion {
  id: number;
  group_id: number;
  user_id: number;
  content: string;
  user: { id: number; name: string; email: string; avatar_url?: string };
  created_at: string;
  updated_at?: string;
}

export interface GroupSchedule {
  id: number;
  group_id: number;
  title: string;
  description?: string;
  scheduled_date: string;
  created_by: number;
  created_at: string;
}

export interface GroupEvent {
  id: number;
  group_id: number;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  created_by: number;
  created_at: string;
}

export async function getGroups(): Promise<Group[]> {
  const response = await fetch(`${API_BASE_URL}/groups`, {
    method: "GET",
    headers: getHeaders(false), // Groups endpoint doesn't require auth
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("getGroups error:", response.status, errorText);
    if (response.status === 401) {
      removeToken();
    }
    if (response.status >= 500) {
      throw new Error("Lỗi server. Vui lòng kiểm tra backend có đang chạy không.");
    }
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

export async function getGroup(groupId: number): Promise<Group> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Không tìm thấy câu lạc bộ");
    }
    throw new Error("Không thể lấy thông tin câu lạc bộ");
  }

  return response.json();
}

// ============================================
// GROUP MEMBERS API
// ============================================

export async function getGroupMembers(groupId: number): Promise<GroupMember[]> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
    method: "GET",
    headers: getHeaders(false),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách thành viên");
  }

  return response.json();
}

// ============================================
// GROUP DISCUSSIONS API
// ============================================

export async function getGroupDiscussions(groupId: number): Promise<GroupDiscussion[]> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/discussions`, {
    method: "GET",
    headers: getHeaders(false),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách thảo luận");
  }

  return response.json();
}

export async function createGroupDiscussion(groupId: number, content: string): Promise<GroupDiscussion> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/discussions`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể đăng bình luận");
  }

  return response.json();
}

export async function deleteGroupDiscussion(groupId: number, discussionId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/discussions/${discussionId}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể xóa bình luận");
  }
}

// ============================================
// GROUP SCHEDULES API
// ============================================

export async function getGroupSchedules(groupId: number): Promise<GroupSchedule[]> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/schedules`, {
    method: "GET",
    headers: getHeaders(false),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy lịch trình");
  }

  return response.json();
}

export async function createGroupSchedule(
  groupId: number,
  data: { title: string; description?: string; scheduled_date: string }
): Promise<GroupSchedule> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/schedules`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể tạo lịch trình");
  }

  return response.json();
}

export async function updateGroupSchedule(
  groupId: number,
  scheduleId: number,
  data: { title?: string; description?: string; scheduled_date?: string }
): Promise<GroupSchedule> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/schedules/${scheduleId}`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể cập nhật lịch trình");
  }

  return response.json();
}

export async function deleteGroupSchedule(groupId: number, scheduleId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/schedules/${scheduleId}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể xóa lịch trình");
  }
}

// ============================================
// GROUP EVENTS API
// ============================================

export async function getGroupEvents(groupId: number): Promise<GroupEvent[]> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/events`, {
    method: "GET",
    headers: getHeaders(false),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách sự kiện");
  }

  return response.json();
}

export async function createGroupEvent(
  groupId: number,
  data: { title: string; description?: string; event_date: string; location?: string }
): Promise<GroupEvent> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/events`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể tạo sự kiện");
  }

  return response.json();
}

export async function updateGroupEvent(
  groupId: number,
  eventId: number,
  data: { title?: string; description?: string; event_date?: string; location?: string }
): Promise<GroupEvent> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/events/${eventId}`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể cập nhật sự kiện");
  }

  return response.json();
}

export async function deleteGroupEvent(groupId: number, eventId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/events/${eventId}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể xóa sự kiện");
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

export async function leaveChallenge(challengeId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/leave`, {
    method: "POST",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    let errorMessage = "Không thể rời thử thách";
    try {
      const error = await response.json();
      errorMessage = error.detail || error.message || errorMessage;
    } catch {
      errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  // Parse response if available
  try {
    await response.json();
  } catch {
    // Response might be empty, that's okay
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

export interface AdminReview {
  id: number;
  book_id: number;
  user_id: number;
  rating: number;
  content: string;
  created_at: string;
  user?: { id: number; name: string; email: string };
  book?: { id: number; title: string };
}

export async function getAllReviewsAdmin(): Promise<AdminReview[]> {
  const response = await fetch(`${API_BASE_URL}/admin/reviews`, {
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể lấy danh sách đánh giá");
  }

  return response.json();
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
    let errorMessage = "Không thể xóa thử thách";
    try {
      const error = await response.json();
      errorMessage = error.detail || error.message || errorMessage;
    } catch {
      errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  // 204 No Content doesn't have a body, so we don't need to parse it
}

// ============================================
// AUTHOR NOTIFICATIONS API
// ============================================

export interface AuthorNotification {
  id: number;
  author_id: number;
  title: string;
  content: string;
  notification_type: string; // new_book, announcement, update
  book_id?: number;
  cover_url?: string;
  author?: Author;
  book?: Book;
  created_by: number;
  created_at: string;
  is_active: boolean;
}

export async function getMyAuthorNotifications(): Promise<AuthorNotification[]> {
  const response = await fetch(`${API_BASE_URL}/authors/notifications/my-notifications`, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy thông báo");
  }

  return response.json();
}

export async function getAuthorNotifications(authorId: number): Promise<AuthorNotification[]> {
  const response = await fetch(`${API_BASE_URL}/authors/${authorId}/notifications`, {
    method: "GET",
    headers: getHeaders(false),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy thông báo của tác giả");
  }

  return response.json();
}

// ============================================
// ADMIN - AUTHOR NOTIFICATIONS API
// ============================================

export interface AuthorNotificationCreate {
  author_id: number;
  title: string;
  content: string;
  notification_type?: string;
  book_id?: number;
  cover_url?: string;
}

export async function createAuthorNotification(data: AuthorNotificationCreate): Promise<AuthorNotification> {
  const response = await fetch(`${API_BASE_URL}/admin/author-notifications`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể tạo thông báo");
  }

  return response.json();
}

export async function getAuthorNotificationsAdmin(
  authorId?: number,
  isActive?: boolean
): Promise<AuthorNotification[]> {
  const params = new URLSearchParams();
  if (authorId) params.append("author_id", authorId.toString());
  if (isActive !== undefined) params.append("is_active", isActive.toString());

  const response = await fetch(`${API_BASE_URL}/admin/author-notifications?${params}`, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể lấy danh sách thông báo");
  }

  return response.json();
}

export async function updateAuthorNotificationAdmin(
  notificationId: number,
  data: Partial<AuthorNotificationCreate & { is_active?: boolean }>
): Promise<AuthorNotification> {
  const response = await fetch(`${API_BASE_URL}/admin/author-notifications/${notificationId}`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể cập nhật thông báo");
  }

  return response.json();
}

export async function deleteAuthorNotificationAdmin(notificationId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/author-notifications/${notificationId}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Không thể xóa thông báo");
  }
}

