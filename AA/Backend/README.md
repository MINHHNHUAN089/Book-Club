# Book Club Backend API

Backend API cho ứng dụng Book Club / Reading Tracker sử dụng FastAPI, PostgreSQL, và JWT authentication.

## Công nghệ sử dụng

- **FastAPI**: Web framework cho Python
- **SQLAlchemy**: ORM cho database
- **PostgreSQL**: Database
- **Pydantic**: Data validation
- **JWT**: Authentication
- **Alembic**: Database migrations (optional)

## Cài đặt

### 1. Tạo virtual environment

```bash
cd Backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### 3. Cấu hình Database

1. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

2. Cập nhật thông tin database trong `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/bookclub_db
SECRET_KEY=your-secret-key-here-change-in-production
```

3. Tạo database PostgreSQL:
```sql
CREATE DATABASE bookclub_db;
```

### 4. Chạy ứng dụng

```bash
# Development mode
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

API sẽ chạy tại: `http://localhost:8000`

## API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Cấu trúc thư mục

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
├── .env.example
├── .gitignore
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Books
- `GET /api/books` - Lấy danh sách sách
- `GET /api/books/{book_id}` - Lấy thông tin sách
- `POST /api/books` - Tạo sách mới
- `GET /api/books/user/my-books` - Lấy sách của user
- `POST /api/books/user/add` - Thêm sách vào danh sách
- `PATCH /api/books/user/{user_book_id}` - Cập nhật tiến độ
- `DELETE /api/books/user/{user_book_id}` - Xóa sách khỏi danh sách

### Reviews
- `GET /api/reviews` - Lấy danh sách reviews
- `GET /api/reviews/{review_id}` - Lấy review cụ thể
- `POST /api/reviews` - Tạo review mới
- `PATCH /api/reviews/{review_id}` - Cập nhật review
- `DELETE /api/reviews/{review_id}` - Xóa review

### Groups
- `GET /api/groups` - Lấy danh sách groups
- `GET /api/groups/{group_id}` - Lấy thông tin group
- `POST /api/groups` - Tạo group mới
- `POST /api/groups/{group_id}/join` - Tham gia group
- `POST /api/groups/{group_id}/leave` - Rời group
- `GET /api/groups/user/my-groups` - Lấy groups của user

### Challenges
- `GET /api/challenges` - Lấy danh sách challenges
- `GET /api/challenges/{challenge_id}` - Lấy thông tin challenge
- `POST /api/challenges` - Tạo challenge mới
- `POST /api/challenges/{challenge_id}/join` - Tham gia challenge
- `GET /api/challenges/user/my-challenges` - Lấy challenges của user

### Authors
- `GET /api/authors` - Lấy danh sách authors
- `GET /api/authors/{author_id}` - Lấy thông tin author
- `POST /api/authors` - Tạo author mới
- `POST /api/authors/{author_id}/follow` - Follow author
- `POST /api/authors/{author_id}/unfollow` - Unfollow author
- `GET /api/authors/user/followed` - Lấy authors đang follow

## Authentication

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

## Database Models

- **User**: Thông tin người dùng
- **Book**: Thông tin sách
- **Author**: Thông tin tác giả
- **UserBook**: Quan hệ user-sách (tiến độ, rating, status)
- **Review**: Review của user về sách
- **Group**: Câu lạc bộ sách
- **Challenge**: Thử thách đọc sách

## Notes

- Database tables sẽ được tạo tự động khi chạy ứng dụng lần đầu
- Để sử dụng migrations, có thể cấu hình Alembic
- Đảm bảo thay đổi `SECRET_KEY` trong production
- CORS đã được cấu hình cho frontend tại `http://localhost:5173`

