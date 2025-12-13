# Book Club Backend API - Hướng Dẫn Đầy Đủ

Backend API cho ứng dụng Book Club / Reading Tracker sử dụng FastAPI, PostgreSQL, và JWT authentication.

---

## 📋 Mục Lục

1. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
2. [Cài đặt](#cài-đặt)
3. [Cấu hình Database](#cấu-hình-database)
4. [Chạy ứng dụng](#chạy-ứng-dụng)
5. [Thêm dữ liệu](#thêm-dữ-liệu)
6. [API Documentation](#api-documentation)
7. [Troubleshooting](#troubleshooting)
8. [Cấu trúc thư mục](#cấu-trúc-thư-mục)

---

## 🛠️ Công nghệ sử dụng

- **FastAPI**: Web framework cho Python
- **SQLAlchemy**: ORM cho database
- **PostgreSQL**: Database
- **Pydantic**: Data validation
- **JWT**: Authentication
- **Alembic**: Database migrations (optional)

---

## 📦 Cài đặt

### Bước 1: Tạo Virtual Environment

```powershell
cd Backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### Bước 2: Cài đặt Dependencies

```powershell
# Cập nhật pip trước
python -m pip install --upgrade pip

# Cài đặt dependencies
pip install -r requirements.txt
```

**Nếu gặp lỗi build** (link.exe not found):
- Xem phần [Troubleshooting - Lỗi Build](#lỗi-build-errors) bên dưới

**Nếu gặp lỗi bcrypt/passlib**:
- Xem phần [Troubleshooting - Lỗi bcrypt](#lỗi-bcryptpasslib) bên dưới

### Bước 3: Kiểm tra cài đặt

```powershell
python -c "import fastapi; import sqlalchemy; import pydantic; print('✅ All packages installed successfully!')"
```

---

## ⚙️ Cấu hình Database

### Bước 1: Cài đặt PostgreSQL (Nếu chưa có)

1. Download từ: https://www.postgresql.org/download/windows/
2. Cài đặt với các tùy chọn mặc định
3. **Ghi nhớ password** của user `postgres`

### Bước 2: Tạo Database trong pgAdmin 4

#### 2.1. Tạo Server Connection

1. Mở **pgAdmin 4**
2. Click chuột phải vào **"Servers"** → **"Create"** → **"Server..."**
3. Tab **"General"**:
   - **Name**: `BookClub Server`
4. Tab **"Connection"** (QUAN TRỌNG):
   - **Host name/address**: `localhost`
   - **Port**: `5432`
   - **Maintenance database**: `postgres`
   - **Username**: `postgres`
   - **Password**: Nhập password PostgreSQL của bạn
   - ✅ **Save password**: Tích vào
5. Click **"Save"**

#### 2.2. Tạo Database

1. Mở rộng **"BookClub Server"**
2. Click chuột phải vào **"Databases"** → **"Create"** → **"Database..."**
3. Tab **"General"**:
   - **Database**: `bookclub_db`
4. Click **"Save"**

### Bước 3: Tạo File .env

Tạo file `.env` trong thư mục `Backend` với nội dung:

```env
# Database Connection
# Format: postgresql://username:password@host:port/database_name
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/bookclub_db

# JWT Secret Key (thay đổi thành key ngẫu nhiên mạnh, ít nhất 32 ký tự)
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars

# JWT Algorithm
ALGORITHM=HS256

# Token expiration (minutes)
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Thay đổi:**
- `YOUR_PASSWORD`: Password PostgreSQL của bạn
- `your-super-secret-key-change-this-in-production-min-32-chars`: Secret key ngẫu nhiên

**Tạo SECRET_KEY:**
```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Bước 4: Test Kết Nối Database

```powershell
python test_connection.py
```

**Kết quả mong đợi:**
```
✅ Database connection successful!
✅ Tables created successfully!
```

---

## 🚀 Chạy ứng dụng

### Chạy Backend Server

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Kết quả:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

### Kiểm tra Server

1. Mở trình duyệt: **http://localhost:8000**
2. Bạn sẽ thấy:
   ```json
   {
     "message": "Book Club API",
     "version": "1.0.0",
     "docs": "/docs"
   }
   ```

### Chạy Frontend

Mở PowerShell mới (giữ Backend đang chạy):

```powershell
cd Frontend
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

---

## 🌱 Thêm dữ liệu

### Cách 1: Seed Data (Dữ liệu mẫu)

```powershell
python run_seed.py
```

**Dữ liệu mẫu bao gồm:**
- 3 Users: john@example.com, jane@example.com, bob@example.com (password: password123)
- 3 Authors: J.K. Rowling, George R.R. Martin, Stephen King
- 4 Books: Harry Potter books, A Game of Thrones, The Shining
- 5 UserBooks: Sách của các users với các status khác nhau
- 3 Reviews: Đánh giá sách
- 2 Groups: Fantasy Book Club, Horror Readers
- 2 Challenges: Read 10 Books in 2024, Fantasy Marathon

### Cách 2: Thêm 40 cuốn sách

```powershell
python insert_40_books.py
```

Script sẽ tạo:
- 40 cuốn sách (Dune, 1984, Harry Potter, Đất Rừng Phương Nam, v.v.)
- 35 authors
- 5 users mẫu

### Cách 3: Thêm sách vào danh sách của users

```powershell
python add_books_to_users.py
```

Mỗi user sẽ có 5-10 sách ngẫu nhiên.

### Cách 4: Thêm nhiều sách hơn cho users

```powershell
python add_more_books_to_users.py
```

Mỗi user sẽ có 15-20 sách.

### Cách 5: Chạy Library Schema SQL

Để thêm các tính năng thư viện (categories, borrows, fines):

```powershell
python run_library_schema.py
```

Hoặc chạy trực tiếp trong pgAdmin:
1. Mở pgAdmin → `bookclub_db` → Query Tool
2. Open File → Chọn `library_schema.sql`
3. Execute (F5)

---

## 📚 API Documentation

### Swagger UI (Interactive)
- **URL**: http://localhost:8000/docs
- Test tất cả API endpoints tại đây

### ReDoc (Alternative)
- **URL**: http://localhost:8000/redoc

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

#### Books
- `GET /api/books` - Lấy danh sách sách
- `GET /api/books/{book_id}` - Lấy thông tin sách
- `POST /api/books` - Tạo sách mới
- `GET /api/books/user/my-books` - Lấy sách của user
- `POST /api/books/user/add` - Thêm sách vào danh sách
- `PATCH /api/books/user/{user_book_id}` - Cập nhật tiến độ
- `DELETE /api/books/user/{user_book_id}` - Xóa sách khỏi danh sách

#### Reviews
- `GET /api/reviews` - Lấy danh sách reviews
- `GET /api/reviews/{review_id}` - Lấy review cụ thể
- `POST /api/reviews` - Tạo review mới
- `PATCH /api/reviews/{review_id}` - Cập nhật review
- `DELETE /api/reviews/{review_id}` - Xóa review

#### Groups
- `GET /api/groups` - Lấy danh sách groups
- `GET /api/groups/{group_id}` - Lấy thông tin group
- `POST /api/groups` - Tạo group mới
- `POST /api/groups/{group_id}/join` - Tham gia group
- `POST /api/groups/{group_id}/leave` - Rời group
- `GET /api/groups/user/my-groups` - Lấy groups của user

#### Challenges
- `GET /api/challenges` - Lấy danh sách challenges
- `GET /api/challenges/{challenge_id}` - Lấy thông tin challenge
- `POST /api/challenges` - Tạo challenge mới
- `POST /api/challenges/{challenge_id}/join` - Tham gia challenge
- `GET /api/challenges/user/my-challenges` - Lấy challenges của user

#### Authors
- `GET /api/authors` - Lấy danh sách authors
- `GET /api/authors/{author_id}` - Lấy thông tin author
- `POST /api/authors` - Tạo author mới
- `POST /api/authors/{author_id}/follow` - Follow author
- `POST /api/authors/{author_id}/unfollow` - Unfollow author
- `GET /api/authors/user/followed` - Lấy authors đang follow

### Authentication

Hầu hết các endpoints yêu cầu authentication. Sử dụng JWT token:

1. Đăng nhập để lấy token:
```bash
POST /api/auth/login
{
  "username": "user@example.com",
  "password": "password"
}
```

2. Sử dụng token trong header:
```
Authorization: Bearer <token>
```

---

## 🔧 Troubleshooting

### Lỗi: "could not connect to server"

**Kiểm tra:**
1. PostgreSQL service đang chạy:
   ```powershell
   Get-Service -Name postgresql*
   ```
2. Nếu không chạy, khởi động:
   ```powershell
   Start-Service postgresql-x64-18  # Thay version nếu khác
   ```
3. Kiểm tra host, port, username, password trong `.env`

### Lỗi: "password authentication failed"

**Giải pháp:**
1. Đặt lại password PostgreSQL:
   ```powershell
   cd "C:\Program Files\PostgreSQL\18\bin"
   .\psql.exe -U postgres -c "ALTER USER postgres WITH PASSWORD 'mat_khau_moi';"
   ```
2. Cập nhật password trong file `.env`
3. Cập nhật password trong pgAdmin (Properties → Connection)

### Lỗi: "database does not exist"

**Giải pháp:**
1. Tạo database `bookclub_db` trong pgAdmin
2. Kiểm tra tên database trong `DATABASE_URL`

### Lỗi: "module not found"

**Giải pháp:**
1. Đảm bảo virtual environment đã được activate (`(venv)` hiển thị)
2. Chạy: `pip install -r requirements.txt`

### Lỗi Build Errors (link.exe was not found)

**Giải pháp 1: Sử dụng pre-built wheels**
```powershell
pip install --only-binary :all: -r requirements.txt
```

**Giải pháp 2: Cài đặt Visual C++ Build Tools**
1. Download: https://visualstudio.microsoft.com/downloads/
2. Tải "Build Tools for Visual Studio 2022"
3. Chọn "Desktop development with C++"
4. Restart PowerShell và chạy lại: `pip install -r requirements.txt`

### Lỗi bcrypt/passlib

**Giải pháp:**
```powershell
pip uninstall -y bcrypt passlib
pip install bcrypt==3.2.0 "passlib[bcrypt]==1.7.4"
```

Hoặc chạy script tự động:
```powershell
.\fix_bcrypt.ps1
```

### Lỗi: "Incorrect email or password"

**Kiểm tra:**
1. User có tồn tại trong database không:
   ```powershell
   python test_login_accounts.py
   ```
2. Password hash có đúng không
3. Email có đúng không (không có khoảng trắng)

**Sửa:**
```powershell
python test_login_accounts.py
```
Script sẽ tự động sửa password cho các tài khoản.

### Lỗi: "relation does not exist"

**Giải pháp:**
1. Chạy server để tạo tables tự động
2. Hoặc chạy: `python test_connection.py`

### Lỗi: "duplicate key value"

**Giải pháp:**
- Dữ liệu đã tồn tại, bình thường
- Script sẽ bỏ qua với `ON CONFLICT DO NOTHING`

---

## 📁 Cấu trúc thư mục

```
Backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # JWT authentication
│   └── routers/             # API routes
│       ├── __init__.py
│       ├── auth.py          # Authentication endpoints
│       ├── books.py         # Books endpoints
│       ├── reviews.py       # Reviews endpoints
│       ├── groups.py        # Groups endpoints
│       ├── challenges.py    # Challenges endpoints
│       └── authors.py       # Authors endpoints
├── requirements.txt
├── .env                     # Environment variables (không commit)
├── .gitignore
├── test_connection.py       # Test database connection
├── run_seed.py              # Seed data script
├── seed_data.py             # Seed data implementation
├── insert_40_books.py       # Thêm 40 cuốn sách
├── add_books_to_users.py    # Thêm sách vào danh sách users
├── add_more_books_to_users.py  # Thêm nhiều sách hơn
├── run_library_schema.py   # Chạy library_schema.sql
├── library_schema.sql       # SQL schema cho hệ thống thư viện
└── README.md                # File này
```

---

## 🗄️ Database Models

### Tables chính:
- `users` - Người dùng
- `books` - Sách
- `authors` - Tác giả
- `user_books` - Sách của người dùng (với status, progress, rating)
- `reviews` - Đánh giá sách
- `groups` - Nhóm đọc sách
- `challenges` - Thử thách đọc sách

### Tables cho hệ thống thư viện:
- `categories` - Danh mục/Thể loại sách
- `book_categories` - Liên kết sách với danh mục
- `borrows` - Yêu cầu mượn sách
- `borrow_receipts` - Phiếu mượn sách
- `favorites` - Sách yêu thích
- `fines` - Phiếu phạt

### Association Tables:
- `book_author` - Quan hệ many-to-many giữa sách và tác giả
- `user_group` - Quan hệ many-to-many giữa người dùng và nhóm
- `user_challenge` - Quan hệ many-to-many giữa người dùng và thử thách
- `user_author_follow` - Quan hệ many-to-many giữa người dùng và tác giả

---

## 🎯 Tài khoản mẫu

Sau khi chạy seed data hoặc insert_40_books.py, bạn có các tài khoản:

| Email | Password | Vai trò |
|-------|----------|---------|
| `admin@library.com` | `password123` | admin |
| `hoa@example.com` | `password123` | user |
| `nam@example.com` | `password123` | user |
| `mai@example.com` | `password123` | user |
| `duc@example.com` | `password123` | user |
| `john@example.com` | `password123` | user |
| `jane@example.com` | `password123` | user |
| `bob@example.com` | `password123` | user |

---

## 🔍 Scripts Hữu Ích

### Kiểm tra dữ liệu
```powershell
python check_data.py              # Kiểm tra tổng quan dữ liệu
python check_user_books.py       # Kiểm tra sách của từng user
python test_login_accounts.py    # Test login các tài khoản
```

### Thêm dữ liệu
```powershell
python run_seed.py                # Seed data mẫu
python insert_40_books.py        # Thêm 40 cuốn sách
python add_books_to_users.py     # Thêm sách vào danh sách users
python add_more_books_to_users.py # Thêm nhiều sách hơn
python run_library_schema.py      # Chạy library_schema.sql
```

---

## ⚠️ Lưu ý bảo mật

- **KHÔNG** commit file `.env` lên Git (đã có trong `.gitignore`)
- Thay đổi `SECRET_KEY` thành giá trị ngẫu nhiên mạnh trong production
- Sử dụng password mạnh cho PostgreSQL
- Không chia sẻ file `.env` với người khác

---

## 📝 Notes

- Database tables sẽ được tạo tự động khi chạy ứng dụng lần đầu
- Để sử dụng migrations, có thể cấu hình Alembic
- Đảm bảo thay đổi `SECRET_KEY` trong production
- CORS đã được cấu hình cho frontend tại `http://localhost:5173`

---

## 🚀 Quick Start

```powershell
# 1. Activate venv
cd Backend
.\venv\Scripts\Activate.ps1

# 2. Chạy server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 3. (Terminal mới) Chạy Frontend
cd Frontend
npm run dev

# 4. Mở trình duyệt
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# Swagger UI: http://localhost:8000/docs
```

---

## 📞 Cần Giúp Đỡ?

Nếu gặp lỗi, xem phần [Troubleshooting](#troubleshooting) ở trên hoặc:

1. Kiểm tra Backend logs
2. Kiểm tra Frontend Console (F12)
3. Kiểm tra Network tab (F12) để xem API calls
4. Test API trực tiếp qua Swagger UI: http://localhost:8000/docs

---

**Chúc bạn code vui vẻ! 🎉**
