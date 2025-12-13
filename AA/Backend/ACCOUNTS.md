# 📋 Danh Sách Tài Khoản Mẫu

## 🔐 Thông Tin Đăng Nhập

Tất cả tài khoản mẫu đều sử dụng mật khẩu: **`password123`**

---

## 👨‍💼 Tài Khoản Admin

| Email | Mật khẩu | Tên | Vai trò |
|-------|----------|-----|---------|
| `admin@library.com` | `password123` | Nguyễn Văn Admin | **admin** |

**Quyền hạn:**
- Quản lý tất cả người dùng
- Duyệt/từ chối yêu cầu mượn sách
- Xem và quản lý phiếu phạt
- Tạo và quản lý phiếu mượn sách
- Truy cập tất cả tính năng quản trị

---

## 👥 Tài Khoản Người Dùng

| Email | Mật khẩu | Tên | Vai trò |
|-------|----------|-----|---------|
| `hoa@example.com` | `password123` | Trần Thị Hoa | user |
| `nam@example.com` | `password123` | Lê Văn Nam | user |
| `mai@example.com` | `password123` | Phạm Thị Mai | user |
| `duc@example.com` | `password123` | Hoàng Văn Đức | user |
| `john@example.com` | `password123` | John Doe | user |
| `jane@example.com` | `password123` | Jane Smith | user |
| `bob@example.com` | `password123` | Bob Johnson | user |

**Quyền hạn:**
- Xem danh sách sách
- Tìm kiếm sách
- Yêu cầu mượn sách
- Xem và viết đánh giá
- Thêm sách vào yêu thích
- Quản lý sách cá nhân (user_books)
- Tham gia nhóm đọc sách
- Tham gia thử thách đọc sách

---

## 🚀 Cách Sử Dụng

### Đăng nhập qua API

```bash
# Login endpoint
POST http://localhost:8000/api/auth/login

# Body (form-data):
username: admin@library.com
password: password123
```

### Đăng nhập qua Swagger UI

1. Mở trình duyệt: http://localhost:8000/docs
2. Tìm endpoint `/api/auth/login`
3. Click "Try it out"
4. Nhập:
   - `username`: `admin@library.com` (hoặc email khác)
   - `password`: `password123`
5. Click "Execute"
6. Copy `access_token` từ response
7. Click nút "Authorize" ở đầu trang
8. Nhập: `Bearer <access_token>`
9. Bây giờ bạn có thể test các API endpoints

---

## 📝 Lưu Ý

⚠️ **QUAN TRỌNG:**
- Đây là tài khoản mẫu cho môi trường **development** chỉ
- **KHÔNG** sử dụng các mật khẩu này trong **production**
- Thay đổi mật khẩu ngay sau khi deploy lên production
- Sử dụng mật khẩu mạnh (ít nhất 8 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt)

---

## 🔄 Tạo Tài Khoản Mới

### Qua API

```bash
POST http://localhost:8000/api/auth/register

# Body (JSON):
{
  "name": "Tên Người Dùng",
  "email": "email@example.com",
  "password": "mat_khau_moi"
}
```

### Qua Swagger UI

1. Mở http://localhost:8000/docs
2. Tìm endpoint `/api/auth/register`
3. Click "Try it out"
4. Nhập thông tin
5. Click "Execute"

---

## 🛠️ Đặt Lại Vai Trò Admin

Nếu cần đặt lại vai trò admin cho một tài khoản:

```bash
python set_admin_role.py <email>
```

Ví dụ:
```bash
python set_admin_role.py admin@library.com
```

---

## 📊 Kiểm Tra Tài Khoản

Để xem danh sách tất cả tài khoản trong database:

```bash
# Qua API (cần đăng nhập với admin)
GET http://localhost:8000/api/admin/users

# Hoặc qua Swagger UI
# http://localhost:8000/docs → /api/admin/users
```

---

## 🔍 Test Login

Để test đăng nhập các tài khoản:

```bash
python test_login_accounts.py
```

Script này sẽ test đăng nhập tất cả tài khoản mẫu và hiển thị kết quả.

