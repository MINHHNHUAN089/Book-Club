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

### Tables cho hệ thống thư viện:
- `categories` - Danh mục/Thể loại sách
- `book_categories` - Liên kết sách với danh mục (many-to-many)
- `borrows` - Yêu cầu mượn sách
- `borrow_receipts` - Phiếu mượn sách
- `favorites` - Sách yêu thích của người dùng
- `fines` - Phiếu phạt (quá hạn, làm hỏng sách, mất sách)

### Association Tables:
- `book_author` - Quan hệ many-to-many giữa sách và tác giả
- `book_categories` - Quan hệ many-to-many giữa sách và danh mục
- `user_group` - Quan hệ many-to-many giữa người dùng và nhóm
- `user_challenge` - Quan hệ many-to-many giữa người dùng và thử thách (có thêm progress, completed)
- `user_author_follow` - Quan hệ many-to-many giữa người dùng và tác giả (follow)
- `favorites` - Quan hệ many-to-many giữa người dùng và sách yêu thích

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

Có 3 cách để tạo tables:

#### Cách 1: Tự động tạo (Development)
Khi chạy server lần đầu, tables sẽ được tạo tự động nhờ:
```python
Base.metadata.create_all(bind=engine)
```

#### Cách 2: Sử dụng SQL Script (Cho tính năng thư viện)
Chạy script SQL để tạo các bảng và tính năng thư viện:
```bash
# Kết nối PostgreSQL
psql -U postgres -d bookclub_db

# Chạy script
\i library_schema.sql
```

Hoặc từ command line:
```bash
psql -U postgres -d bookclub_db -f library_schema.sql
```

#### Cách 3: Sử dụng Alembic Migration (Recommended)
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
- Library schema SQL: `library_schema.sql`

## Schema Chi Tiết - Hệ Thống Thư Viện

### Bảng Categories (Danh mục sách)
- `category_id` - ID danh mục
- `category_name` - Tên danh mục
- `category_slug` - Slug URL (unique)
- `description` - Mô tả

### Bảng Borrows (Yêu cầu mượn sách)
- `borrow_id` - ID yêu cầu mượn
- `user_id` - ID người dùng
- `book_id` - ID sách
- `request_date` - Ngày yêu cầu
- `approved_date` - Ngày được duyệt
- `borrow_date` - Ngày thực tế mượn
- `expected_return_date` - Ngày dự kiến trả
- `actual_return_date` - Ngày thực tế trả
- `status` - Trạng thái: pending, approved, borrowed, returned, rejected, overdue
- `notes` - Ghi chú

### Bảng Borrow Receipts (Phiếu mượn sách)
- `receipt_id` - ID phiếu
- `borrow_id` - ID yêu cầu mượn
- `receipt_number` - Số phiếu (unique, format: PM-YYYY-XXX)
- `user_id` - ID người dùng
- `book_id` - ID sách
- `borrow_date` - Ngày mượn
- `expected_return_date` - Ngày dự kiến trả
- `librarian_id` - ID nhân viên thư viện
- `librarian_name` - Tên nhân viên thư viện
- `notes` - Ghi chú

### Bảng Favorites (Sách yêu thích)
- `favorite_id` - ID yêu thích
- `user_id` - ID người dùng
- `book_id` - ID sách
- `created_at` - Ngày thêm vào yêu thích
- Unique constraint: (user_id, book_id)

### Bảng Fines (Phiếu phạt)
- `fine_id` - ID phiếu phạt
- `borrow_id` - ID yêu cầu mượn
- `user_id` - ID người dùng
- `fine_amount` - Số tiền phạt
- `fine_reason` - Lý do phạt (quá hạn, làm hỏng, mất sách...)
- `overdue_days` - Số ngày quá hạn
- `status` - Trạng thái: unpaid, paid, waived, cancelled
- `payment_date` - Ngày thanh toán
- `payment_method` - Phương thức thanh toán
- `payment_reference` - Mã tham chiếu thanh toán
- `notes` - Ghi chú

### Views Hữu Ích

1. **v_popular_books** - Sách phổ biến (theo số lượt mượn và đánh giá)
2. **v_new_books** - Sách mới nhất
3. **v_user_stats** - Thống kê người dùng (số lượt mượn, đánh giá, yêu thích, phạt chưa trả)
4. **v_borrow_details** - Chi tiết phiếu mượn
5. **v_fine_details** - Chi tiết phiếu phạt

### Functions và Procedures

1. **fn_generate_receipt_number()** - Tạo số phiếu mượn tự động (PM-YYYY-XXX)
2. **sp_create_overdue_fines(daily_fine_amount)** - Tự động tạo phiếu phạt cho sách quá hạn
3. **sp_pay_fine(fine_id, payment_method, payment_reference)** - Thanh toán phiếu phạt

### Triggers Tự Động

1. **update_book_rating_stats** - Tự động cập nhật average_rating và total_reviews khi có review mới/cập nhật
2. **update_book_borrow_stats** - Tự động cập nhật total_borrows khi có borrow mới
3. **update_borrows_updated_at** - Tự động cập nhật updated_at cho bảng borrows
4. **update_fines_updated_at** - Tự động cập nhật updated_at cho bảng fines

## Sử Dụng SQL Script

Script `library_schema.sql` bao gồm:
- Tạo các bảng mới cho hệ thống thư viện
- Thêm các cột mới vào bảng users và books
- Tạo indexes để tối ưu hiệu suất
- Tạo views, functions, và triggers
- Chèn dữ liệu mẫu (categories, users, books)

**Lưu ý**: Script sử dụng `IF NOT EXISTS` và `ON CONFLICT DO NOTHING` để tránh lỗi khi chạy nhiều lần.

