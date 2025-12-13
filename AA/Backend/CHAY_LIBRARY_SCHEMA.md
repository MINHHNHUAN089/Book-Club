# Hướng Dẫn Chạy Library Schema SQL

## 📋 Mục đích

File `library_schema.sql` chứa:
- Các bảng mới cho hệ thống thư viện: `categories`, `book_categories`, `borrows`, `favorites`, `fines`, `borrow_receipts`
- Cập nhật bảng `books` và `users` với các cột mới
- Dữ liệu mẫu (sách, users, categories)
- Views, Functions, Triggers hữu ích

## 🚀 Cách 1: Sử dụng Script Python (Khuyên dùng)

### Bước 1: Đảm bảo virtual environment đã được activate

```powershell
cd C:\Downloads\VS_CODE\BOOK_CLUB\AA\Backend
.\venv\Scripts\Activate.ps1
```

### Bước 2: Chạy script

```powershell
python run_library_schema.py
```

Script sẽ:
- ✅ Đọc file `library_schema.sql`
- ✅ Kết nối database từ `.env`
- ✅ Chạy tất cả các câu lệnh SQL
- ✅ Bỏ qua các lỗi "already exists" (bảng/cột đã tồn tại)
- ✅ Hiển thị tiến độ và kết quả

---

## 🗄️ Cách 2: Chạy trực tiếp trong pgAdmin 4

### Bước 1: Mở pgAdmin 4

### Bước 2: Kết nối đến database `bookclub_db`

1. Mở rộng: `Servers` → `BookClub Server` → `Databases` → `bookclub_db`
2. Click chuột phải vào `bookclub_db` → **"Query Tool"**

### Bước 3: Mở file SQL

1. Trong Query Tool, click **"Open File"** (hoặc `Ctrl+O`)
2. Chọn file: `C:\Downloads\VS_CODE\BOOK_CLUB\AA\Backend\library_schema.sql`

### Bước 4: Chạy SQL

1. Click **"Execute"** (hoặc `F5`)
2. Xem kết quả trong tab "Messages"

**Lưu ý**: Một số lỗi "already exists" là bình thường nếu bảng/cột đã tồn tại.

---

## 🖥️ Cách 3: Chạy từ Command Line (psql)

### Bước 1: Mở PowerShell

### Bước 2: Chạy lệnh

```powershell
# Tìm đường dẫn psql (thường ở đây)
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"

# Chạy SQL file
psql -U postgres -d bookclub_db -f "C:\Downloads\VS_CODE\BOOK_CLUB\AA\Backend\library_schema.sql"
```

Nhập password khi được yêu cầu.

---

## ✅ Kiểm tra kết quả

### Trong pgAdmin:

1. Mở rộng: `bookclub_db` → `Schemas` → `public` → `Tables`
2. Kiểm tra các bảng mới:
   - ✅ `categories`
   - ✅ `book_categories`
   - ✅ `borrows`
   - ✅ `favorites`
   - ✅ `fines`
   - ✅ `borrow_receipts`

### Kiểm tra dữ liệu:

```sql
-- Xem categories
SELECT * FROM categories;

-- Xem books mẫu
SELECT id, title, author, publisher FROM books LIMIT 10;

-- Xem users mẫu
SELECT id, name, email, role FROM users;
```

---

## ⚠️ Lưu ý quan trọng

1. **Backup database trước**: Nếu có dữ liệu quan trọng, hãy backup trước khi chạy
2. **Lỗi "already exists"**: Bình thường, script sẽ bỏ qua các bảng/cột đã tồn tại
3. **Dữ liệu mẫu**: Script sẽ chèn dữ liệu mẫu (sách, users, categories) nếu chưa có
4. **Password users mẫu**: Các users mẫu có password hash giả, cần đổi lại bằng ứng dụng

---

## 🔧 Troubleshooting

### Lỗi: "relation does not exist"

- Đảm bảo các bảng cơ bản (`books`, `users`) đã được tạo trước
- Chạy `python run_seed.py` trước để tạo các bảng cơ bản

### Lỗi: "permission denied"

- Kiểm tra quyền của user PostgreSQL
- Đảm bảo user có quyền CREATE TABLE, ALTER TABLE

### Lỗi: "duplicate key value"

- Dữ liệu đã tồn tại, bình thường
- Script sẽ bỏ qua với `ON CONFLICT DO NOTHING`

---

## 📊 Sau khi chạy xong

Bạn sẽ có:
- ✅ Các bảng mới cho hệ thống thư viện
- ✅ Dữ liệu mẫu (sách, users, categories)
- ✅ Views hữu ích (v_popular_books, v_new_books, v_user_stats)
- ✅ Functions và Triggers tự động cập nhật thống kê

Bây giờ bạn có thể sử dụng các tính năng thư viện trên web!

