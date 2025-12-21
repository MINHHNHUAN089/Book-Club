📚 Book Club - Ứng dụng Câu lạc bộ Đọc sách

Ứng dụng web quản lý và theo dõi việc đọc sách, kết nối người đọc, tạo câu lạc bộ đọc sách và tham gia các thử thách đọc sách.

- Tính năng chính

+ Quản lý Người dùng
- **Đăng ký/Đăng nhập**: Hệ thống xác thực JWT an toàn
- **Quản lý Profile**: Cập nhật thông tin cá nhân, avatar
- **Phân quyền**: Hệ thống role (User/Admin)
- **Theo dõi**: Follow tác giả và sách yêu thích

+ Quản lý Sách
- **Danh sách Sách**: Xem, tìm kiếm, lọc sách
- **Upload File**: Upload file PDF/EPUB để đọc trực tuyến
- **Đọc sách**: Đọc sách trực tiếp trên web với PDF.js

+ Đánh giá và Review
- **Viết Review**: Đánh giá và viết nhận xét về sách
- **Xem Review**: Xem đánh giá từ người dùng khác
- **Rating**: Hệ thống đánh giá 1-5 sao

+ Câu lạc bộ Đọc sách (Groups)
- **Tạo Group**: Tạo câu lạc bộ đọc sách
- **Tham gia/Rời**: Join/Leave các group
- **Thảo luận**: Thảo luận về sách trong group
- **Lịch trình**: Tạo và quản lý lịch đọc sách
- **Sự kiện**: Tổ chức sự kiện đọc sách

+ Thử thách Đọc sách (Challenges)
- **Tham gia Challenge**: Tham gia các thử thách đọc sách


+ Quản lý Tác giả
- **Danh sách Tác giả**: Xem thông tin các tác giả
- **Follow Tác giả**: Theo dõi tác giả yêu thích
- **Thông báo**: Nhận thông báo từ tác giả (sách mới, cập nhật)

+ Khám phá
- **Tìm kiếm**: Tìm kiếm sách, tác giả
- **Đề xuất**: Gợi ý sách dựa trên sở thích
- **Thống kê**: Xem sách phổ biến, đánh giá cao

+ Trang Quản trị (Admin)
- **Quản lý Người dùng**: Xem, cập nhật, xóa users
- **Quản lý Sách**: Thêm, sửa, xóa sách
- **Quản lý Reviews**: Xem và quản lý đánh giá
- **Quản lý Groups**: Quản lý các câu lạc bộ
- **Quản lý Challenges**: Quản lý thử thách
- **Thống kê**: Dashboard với các số liệu tổng quan
- **Thông báo Tác giả**: Tạo và quản lý thông báo từ tác giả

---

- Công nghệ sử dụng

+ Backend (API Server)

+ Framework & Core
- **FastAPI** (v0.115.0): Framework web hiện đại, hiệu suất cao cho Python
  - API RESTful với tự động generate documentation (Swagger UI)
  - Type hints và validation tự động
  - Async/await support

+ Database & ORM
- **PostgreSQL**: Hệ quản trị cơ sở dữ liệu quan hệ
- **SQLAlchemy** (v2.0.36): ORM (Object-Relational Mapping) cho Python
  - Quản lý database models và relationships
  - Connection pooling
- **Alembic** (v1.13.2): Database migration tool
  - Quản lý schema changes
  - Version control cho database

+ Authentication & Security
- **python-jose[cryptography]** (v3.3.0): JWT (JSON Web Tokens) implementation
  - Xác thực người dùng
  - Token-based authentication
- **passlib[bcrypt]** (v1.7.4): Password hashing
  - Bcrypt với 12 rounds cho bảo mật cao
  - Hash và verify passwords

+ Data Validation & Settings
- **Pydantic** (v2.9.2): Data validation và settings management
  - Validate request/response data
  - Type-safe data models
- **pydantic-settings** (v2.5.2): Quản lý environment variables
  - Load settings từ .env files
  - Type-safe configuration

+ Server & Utilities
- **Uvicorn[standard]** (v0.32.0): ASGI server
  - High-performance async server
  - Hot reload trong development
- **python-dotenv** (v1.0.1): Load environment variables từ .env files
- **python-multipart** (v0.0.12): Handle file uploads (FormData)
- **psycopg2-binary** (v2.9.10): PostgreSQL adapter cho Python

+ Static Files
- **FastAPI StaticFiles**: Serve static files (images, PDFs)
  - Upload và lưu trữ ảnh bìa sách
  - Upload và serve file PDF/EPUB

+ Frontend (Client Application)

+ Core Framework
- **React** (v18.3.1): UI library
  - Component-based architecture
  - Hooks (useState, useEffect, useMemo, etc.)
  - Virtual DOM cho performance
- **React DOM** (v18.3.1): React renderer cho web

+ Language & Type Safety
- **TypeScript** (v5.6.3): Typed JavaScript
  - Type safety
  - Better IDE support
  - Catch errors tại compile time

+ Routing
- **React Router DOM** (v6.28.0): Client-side routing
  - Navigate giữa các pages
  - Protected routes
  - URL parameters và query strings

+ Build Tool & Dev Server
- **Vite** (v5.4.10): Next-generation frontend build tool
  - Fast HMR (Hot Module Replacement)
  - Optimized production builds
  - ES modules support
- **@vitejs/plugin-react** (v4.4.3): Vite plugin cho React

+ PDF Reading
- **pdfjs-dist** (v5.4.449): PDF.js library
  - Render và đọc PDF files trong browser
  - Text selection, zoom, navigation

+ Type Definitions
- **@types/react** (v18.3.12): TypeScript types cho React
- **@types/react-dom** (v18.3.1): TypeScript types cho React DOM

---



- Database Schema

+ Core Tables
- **users**: Thông tin người dùng, authentication
- **books**: Thông tin sách
- **authors**: Thông tin tác giả
- **user_books**: Liên kết user-sách với progress, rating, status
- **reviews**: Đánh giá và review của người dùng

+ Social Features
- **groups**: Câu lạc bộ đọc sách
- **user_group**: Liên kết user-group (many-to-many)
- **group_discussions**: Thảo luận trong group
- **group_schedules**: Lịch trình đọc sách
- **group_events**: Sự kiện trong group

+ Challenges
- **challenges**: Thử thách đọc sách
- **user_challenge**: Liên kết user-challenge với progress

+ Follow System
- **user_author_follow**: Follow tác giả
- **user_book_follow**: Follow sách

+ Notifications
- **author_notifications**: Thông báo từ tác giả

+ Relationships
- Many-to-many: Book ↔ Author, User ↔ Group, User ↔ Challenge
- One-to-many: User → Reviews, Book → Reviews, Group → Discussions

---

- Deployment

+ Backend (Render.com)
- **Platform**: Render.com
- **Service Type**: Web Service
- **Runtime**: Python 3
- **Database**: PostgreSQL (Render managed)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

+ Frontend (Vercel.com)
- **Platform**: Vercel.com
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

+ Environment Variables

+ Backend (Render)
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key
- `ALGORITHM`: JWT algorithm (HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time
- `CORS_ORIGINS`: Allowed frontend origins

+ Frontend (Vercel)
- `VITE_API_BASE_URL`: Backend API URL

---

- Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt với 12 rounds
- **CORS Protection**: Chỉ cho phép origins được cấu hình
- **Input Validation**: Pydantic validation cho tất cả inputs
- **SQL Injection Protection**: SQLAlchemy ORM prevents SQL injection
- **Role-based Access Control**: User và Admin roles

---

- API Documentation

API documentation tự động được generate bởi FastAPI:
- **Swagger UI**: `/docs`
- **ReDoc**: `/redoc`

Tất cả endpoints được document với:
- Request/Response schemas
- Authentication requirements
- Example requests/responses

- Dependencies Summary

+ Backend Dependencies
- FastAPI: Web framework
- SQLAlchemy: ORM
- Alembic: Migrations
- Pydantic: Validation
- python-jose: JWT
- passlib: Password hashing
- Uvicorn: ASGI server
- psycopg2: PostgreSQL driver

+ Frontend Dependencies
- React: UI library
- TypeScript: Type safety
- React Router: Routing
- Vite: Build tool
- PDF.js: PDF rendering

---

- Development Workflow

1. **Backend Development**:
   ```bash
   cd AA/Backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend Development**:
   ```bash
   cd AA/Frontend
   npm install
   npm run dev
   ```

3. **Database Migrations**:
   ```bash
   cd AA/Backend
   alembic revision --autogenerate -m "description"
   alembic upgrade head
   ```

---

- License

This project is private and proprietary.

---

- Authors

Developed for Book Club application.

---

**Version**: 1.0.0  
**Last Updated**: December 2025
