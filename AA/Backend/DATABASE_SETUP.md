# Database Setup và Migration Guide

## Tổng quan

Backend sử dụng PostgreSQL với SQLAlchemy ORM và Alembic cho database migrations.

## Cấu trúc Database

### Tables chính:
- `users` - Người dùng
- `books` - Sách
- `authors` - Tác giả
- `user_books` - Sách của người dùng (với status, progress, rating)
- `reviews` - Đánh giá sách
- `groups` - Nhóm đọc sách
- `challenges` - Thử thách đọc sách

### Association Tables:
- `book_author` - Quan hệ many-to-many giữa sách và tác giả
- `user_group` - Quan hệ many-to-many giữa người dùng và nhóm
- `user_challenge` - Quan hệ many-to-many giữa người dùng và thử thách (có thêm progress, completed)
- `user_author_follow` - Quan hệ many-to-many giữa người dùng và tác giả (follow)

## Setup Database

### 1. Tạo Database

Tạo database trong PostgreSQL:
```sql
CREATE DATABASE bookclub_db;
```

### 2. Cấu hình .env

Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Cập nhật `DATABASE_URL` trong `.env`:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/bookclub_db
```

### 3. Tạo Tables

Có 2 cách để tạo tables:

#### Cách 1: Tự động tạo (Development)
Khi chạy server lần đầu, tables sẽ được tạo tự động nhờ:
```python
Base.metadata.create_all(bind=engine)
```

#### Cách 2: Sử dụng Alembic Migration (Recommended)
```bash
# Tạo migration đầu tiên (đã được tạo)
alembic revision --autogenerate -m "Initial migration"

# Chạy migration
alembic upgrade head
```

## Database Migrations với Alembic

### Tạo Migration mới
```bash
# Tự động tạo migration từ thay đổi models
alembic revision --autogenerate -m "Description of changes"

# Tạo migration trống (manual)
alembic revision -m "Description of changes"
```

### Chạy Migrations
```bash
# Upgrade lên version mới nhất
alembic upgrade head

# Upgrade lên version cụ thể
alembic upgrade <revision_id>

# Downgrade về version trước
alembic downgrade -1

# Xem lịch sử migrations
alembic history

# Xem version hiện tại
alembic current
```

### Rollback Migration
```bash
# Rollback 1 version
alembic downgrade -1

# Rollback về version cụ thể
alembic downgrade <revision_id>

# Rollback tất cả
alembic downgrade base
```

## Seed Data (Dữ liệu mẫu)

### Chạy Seed Data
```bash
# Cách 1: Sử dụng script
python run_seed.py

# Cách 2: Import trực tiếp
python -c "from seed_data import seed_data; seed_data()"
```

### Dữ liệu mẫu bao gồm:
- **3 Users**: john@example.com, jane@example.com, bob@example.com (password: password123)
- **3 Authors**: J.K. Rowling, George R.R. Martin, Stephen King
- **4 Books**: Harry Potter books, A Game of Thrones, The Shining
- **5 UserBooks**: Sách của các users với các status khác nhau
- **3 Reviews**: Đánh giá sách
- **2 Groups**: Fantasy Book Club, Horror Readers
- **2 Challenges**: Read 10 Books in 2024, Fantasy Marathon
- **Follow relationships**: Users follow authors
- **Group memberships**: Users tham gia groups
- **Challenge participations**: Users tham gia challenges với progress

### Xóa và Seed lại
Để xóa dữ liệu cũ và seed lại, uncomment các dòng trong `seed_data.py`:
```python
# Clear existing data
db.query(UserBook).delete()
db.query(Review).delete()
# ... etc
```

## Database Connection Settings

Database connection được cấu hình trong `app/database.py` với:
- **pool_pre_ping**: Verify connections trước khi sử dụng
- **pool_recycle**: Recycle connections sau 1 giờ
- **echo**: Set True để log SQL queries (development)

## Troubleshooting

### Lỗi: "relation does not exist"
- Chạy migration: `alembic upgrade head`
- Hoặc tạo tables tự động bằng cách chạy server

### Lỗi: "could not connect to server"
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra DATABASE_URL trong .env
- Kiểm tra firewall/port 5432

### Lỗi: "duplicate key value"
- Dữ liệu đã tồn tại, bỏ qua hoặc xóa dữ liệu cũ trước khi seed

### Reset Database
```bash
# Xóa tất cả tables (cẩn thận!)
# Trong PostgreSQL:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# Sau đó chạy lại migration
alembic upgrade head

# Hoặc seed lại
python run_seed.py
```

## Best Practices

1. **Luôn sử dụng migrations** cho production
2. **Backup database** trước khi chạy migration quan trọng
3. **Test migrations** trên development trước
4. **Không chỉnh sửa migration đã chạy** - tạo migration mới thay vào đó
5. **Review migration files** trước khi chạy `alembic upgrade`

## Migration Files Location

- Migration files: `alembic/versions/`
- Alembic config: `alembic.ini`
- Alembic env: `alembic/env.py`

