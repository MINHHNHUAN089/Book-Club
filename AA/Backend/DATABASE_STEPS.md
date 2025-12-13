# Các Bước Chạy Database - Hướng Dẫn Tổng Hợp

## 📋 Tổng Quan

Hướng dẫn này tổng hợp tất cả các bước cần thiết để thiết lập và chạy Database cho Book Club Backend.

---

## 🚀 BƯỚC 1: Cài Đặt PostgreSQL (Nếu chưa có)

1. **Download PostgreSQL** từ: https://www.postgresql.org/download/windows/
2. **Cài đặt** với các tùy chọn mặc định
3. **Ghi nhớ password** của user `postgres` (sẽ cần dùng sau)

---

## 🔧 BƯỚC 2: Thiết Lập pgAdmin 4

### 2.1. Tạo Server Connection

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

### 2.2. Tạo Database

1. Mở rộng **"BookClub Server"** (click vào mũi tên `>`)
2. Click chuột phải vào **"Databases"** → **"Create"** → **"Database..."**
3. Tab **"General"**:
   - **Database**: `bookclub_db`
4. Click **"Save"**

---

## 🐍 BƯỚC 3: Thiết Lập Python Backend

### 3.1. Tạo Virtual Environment

```powershell
cd Backend
python -m venv venv
venv\Scripts\activate
```

### 3.2. Cài Đặt Dependencies

```powershell
# Cập nhật pip trước
python -m pip install --upgrade pip

# Cài đặt dependencies
pip install -r requirements.txt
```

**Nếu gặp lỗi build** (link.exe not found):
- Xem file `FIX_BUILD_ERRORS.md` để sửa
- Hoặc cài đặt Microsoft Visual C++ Build Tools

**Nếu gặp lỗi bcrypt/passlib**:
- Xem file `FIX_BCRYPT_ERROR.md` để sửa
- Hoặc chạy: `pip install bcrypt==3.2.0 passlib[bcrypt]==1.7.4`

---

## ⚙️ BƯỚC 4: Cấu Hình File .env

### 4.1. Tạo File .env

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

### 4.2. Thay Đổi Thông Tin

- Thay `YOUR_PASSWORD` bằng password PostgreSQL của bạn
- Thay `your-super-secret-key-change-this-in-production-min-32-chars` bằng secret key ngẫu nhiên (ít nhất 32 ký tự)

**Ví dụ:**
```env
DATABASE_URL=postgresql://postgres:mypassword123@localhost:5432/bookclub_db
SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Nếu gặp lỗi password authentication**:
- Xem file `FIX_PASSWORD_ERROR.md` để đặt lại password

---

## 🗄️ BƯỚC 5: Tạo Database Tables

### Cách 1: Tự Động (Khuyến nghị cho lần đầu)

Khi chạy server lần đầu, tables sẽ được tạo tự động:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Sau khi server chạy, tables sẽ được tạo tự động.

### Cách 2: Sử dụng SQL Script (Cho tính năng thư viện)

Nếu muốn thêm các tính năng thư viện (categories, borrows, fines):

```powershell
# Kết nối PostgreSQL
psql -U postgres -d bookclub_db

# Chạy script
\i library_schema.sql
```

Hoặc từ command line:
```powershell
psql -U postgres -d bookclub_db -f library_schema.sql
```

### Cách 3: Sử dụng Alembic Migration

```powershell
# Tạo migration (nếu chưa có)
alembic revision --autogenerate -m "Initial migration"

# Chạy migration
alembic upgrade head
```

---

## ✅ BƯỚC 6: Kiểm Tra Kết Nối

### 6.1. Test Connection Script

```powershell
python test_connection.py
```

Nếu thành công, bạn sẽ thấy:
```
✅ Database connection successful!
✅ Tables created successfully!
```

### 6.2. Kiểm Tra trong pgAdmin

1. Mở pgAdmin 4
2. Mở rộng: `Servers` → `BookClub Server` → `Databases` → `bookclub_db` → `Schemas` → `public` → `Tables`
3. Bạn sẽ thấy các bảng:
   - `users`
   - `books`
   - `authors`
   - `user_books`
   - `reviews`
   - `groups`
   - `challenges`
   - Và các bảng association

---

## 🌱 BƯỚC 7: Seed Dữ Liệu Mẫu (Tùy chọn)

Để thêm dữ liệu mẫu vào database:

```powershell
python run_seed.py
```

Dữ liệu mẫu bao gồm:
- **3 Users**: john@example.com, jane@example.com, bob@example.com (password: password123)
- **3 Authors**: J.K. Rowling, George R.R. Martin, Stephen King
- **4 Books**: Harry Potter books, A Game of Thrones, The Shining
- **5 UserBooks**: Sách của các users với các status khác nhau
- **3 Reviews**: Đánh giá sách
- **2 Groups**: Fantasy Book Club, Horror Readers
- **2 Challenges**: Read 10 Books in 2024, Fantasy Marathon

---

## 🚀 BƯỚC 8: Chạy Backend Server

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server sẽ chạy tại: **http://localhost:8000**

### Kiểm Tra:

1. Mở trình duyệt: http://localhost:8000
2. Nếu thấy `{"message":"Book Club API","version":"1.0.0","docs":"/docs"}` → Thành công!
3. Truy cập: http://localhost:8000/docs để xem API documentation

---

## 🔍 Troubleshooting

### Lỗi: "could not connect to server"
- ✅ Kiểm tra PostgreSQL service đang chạy:
  ```powershell
  Get-Service -Name postgresql*
  ```
- ✅ Nếu không chạy, khởi động:
  ```powershell
  Start-Service postgresql-x64-15  # Thay version nếu khác
  ```
- ✅ Kiểm tra host, port, username, password trong `.env`

### Lỗi: "password authentication failed"
- ✅ Xem file `FIX_PASSWORD_ERROR.md`
- ✅ Đặt lại password PostgreSQL

### Lỗi: "database does not exist"
- ✅ Tạo database `bookclub_db` trong pgAdmin
- ✅ Kiểm tra tên database trong `DATABASE_URL`

### Lỗi: "module not found"
- ✅ Chạy `pip install -r requirements.txt`
- ✅ Đảm bảo virtual environment đã được activate

### Lỗi: "link.exe was not found" (Build errors)
- ✅ Xem file `FIX_BUILD_ERRORS.md`
- ✅ Cài đặt Microsoft Visual C++ Build Tools

### Lỗi: "bcrypt/passlib" errors
- ✅ Xem file `FIX_BCRYPT_ERROR.md`
- ✅ Chạy: `pip install bcrypt==3.2.0 passlib[bcrypt]==1.7.4`

---

## 📝 Tóm Tắt Các Bước

1. ✅ Cài đặt PostgreSQL
2. ✅ Tạo Server và Database trong pgAdmin 4
3. ✅ Tạo virtual environment và cài dependencies
4. ✅ Tạo file `.env` với thông tin kết nối
5. ✅ Chạy server để tạo tables tự động
6. ✅ Test kết nối
7. ✅ Seed dữ liệu mẫu (tùy chọn)
8. ✅ Chạy Backend server

---

## 📚 Tài Liệu Tham Khảo

- `README.md` - Tổng quan về Backend
- `CONNECTION_GUIDE.md` - Chi tiết kết nối PostgreSQL
- `PGADMIN_SETUP.md` - Hướng dẫn pgAdmin 4
- `DATABASE_SETUP.md` - Chi tiết về Database và Migrations
- `FIX_BUILD_ERRORS.md` - Sửa lỗi build
- `FIX_PASSWORD_ERROR.md` - Sửa lỗi password
- `FIX_BCRYPT_ERROR.md` - Sửa lỗi bcrypt/passlib

---

## ⚠️ Lưu Ý Bảo Mật

- **KHÔNG** commit file `.env` lên Git (đã có trong `.gitignore`)
- Thay đổi `SECRET_KEY` thành giá trị ngẫu nhiên mạnh trong production
- Sử dụng password mạnh cho PostgreSQL
- Không chia sẻ file `.env` với người khác

