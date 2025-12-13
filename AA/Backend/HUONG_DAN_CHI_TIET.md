# Hướng Dẫn Chi Tiết Từng Bước - Chạy Database

## 📍 BƯỚC 1: Kiểm Tra Virtual Environment

### 1.1. Mở PowerShell và chuyển đến thư mục Backend

```powershell
cd C:\Downloads\VS_CODE\BOOK_CLUB\AA\Backend
```

### 1.2. Kiểm tra virtual environment đã được activate chưa

Bạn sẽ thấy `(venv)` ở đầu dòng prompt:
```
(venv) PS C:\Downloads\VS_CODE\BOOK_CLUB\AA\Backend>
```

**Nếu CHƯA thấy `(venv)`:**
```powershell
# Tạo venv (nếu chưa có)
python -m venv venv

# Activate venv
venv\Scripts\activate
```

---

## 📦 BƯỚC 2: Cài Đặt Dependencies

### 2.1. Cập nhật pip

```powershell
python -m pip install --upgrade pip
```

**Kết quả mong đợi:**
```
Requirement already satisfied: pip in ... (hoặc Successfully installed pip-xx.x.x)
```

### 2.2. Cài đặt dependencies từ requirements.txt

```powershell
pip install -r requirements.txt
```

**Quá trình cài đặt sẽ mất vài phút. Bạn sẽ thấy:**
```
Collecting fastapi>=0.115.0
  Downloading fastapi-0.115.x...
Installing collected packages: ...
Successfully installed fastapi-0.115.x uvicorn-0.24.0 ...
```

**Nếu gặp lỗi:**

#### Lỗi 1: "link.exe was not found" hoặc "Failed building wheel"
- Xem file `FIX_BUILD_ERRORS.md`
- Hoặc chạy:
```powershell
pip install --only-binary :all: -r requirements.txt
```

#### Lỗi 2: "bcrypt/passlib" errors
- Xem file `FIX_BCRYPT_ERROR.md`
- Hoặc chạy:
```powershell
pip uninstall -y bcrypt passlib
pip install bcrypt==3.2.0 "passlib[bcrypt]==1.7.4"
```

### 2.3. Kiểm tra cài đặt thành công

```powershell
python -c "import fastapi; import sqlalchemy; import pydantic; print('✅ All packages installed successfully!')"
```

**Kết quả mong đợi:**
```
✅ All packages installed successfully!
```

---

## ⚙️ BƯỚC 3: Tạo File .env

### 3.1. Kiểm tra xem đã có file .env chưa

```powershell
dir .env
```

**Nếu KHÔNG có file .env:**
- Tiếp tục bước 3.2

**Nếu ĐÃ CÓ file .env:**
- Kiểm tra nội dung và cập nhật nếu cần (bước 3.3)

### 3.2. Tạo file .env mới

**Cách 1: Sử dụng PowerShell (Khuyến nghị)**

```powershell
@"
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/bookclub_db
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
"@ | Out-File -FilePath .env -Encoding utf8
```

**Cách 2: Tạo thủ công**

1. Mở VS Code hoặc Notepad
2. Tạo file mới tên `.env` trong thư mục `Backend`
3. Copy nội dung sau vào:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/bookclub_db
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

4. Lưu file

### 3.3. Cập nhật thông tin trong file .env

**Mở file `.env` và thay đổi:**

1. **DATABASE_URL:**
   - Thay `YOUR_PASSWORD` bằng password PostgreSQL của bạn
   - Ví dụ: `DATABASE_URL=postgresql://postgres:mypassword123@localhost:5432/bookclub_db`

2. **SECRET_KEY:**
   - Thay bằng một chuỗi ngẫu nhiên mạnh (ít nhất 32 ký tự)
   - Có thể tạo bằng Python:
   ```powershell
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   - Copy kết quả và paste vào `SECRET_KEY=`

**Ví dụ file .env hoàn chỉnh:**
```env
DATABASE_URL=postgresql://postgres:mypassword123@localhost:5432/bookclub_db
SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3.4. Kiểm tra file .env đã được tạo

```powershell
dir .env
cat .env
```

**Kết quả mong đợi:**
- File `.env` tồn tại
- Nội dung hiển thị (lưu ý: password sẽ hiển thị dạng text)

---

## 🗄️ BƯỚC 4: Tạo Database trong pgAdmin (Nếu chưa có)

### 4.1. Mở pgAdmin 4

### 4.2. Kết nối đến Server

1. Click vào "BookClub Server" trong Object Explorer
2. Nhập password nếu được hỏi
3. Đảm bảo server kết nối thành công (không còn icon xoay)

### 4.3. Tạo Database mới

1. Click chuột phải vào **"Databases"** (dưới "PostgreSQL 18")
2. Chọn **"Create"** → **"Database..."**
3. Tab **"General"**:
   - **Database**: `bookclub_db`
4. Click **"Save"**

### 4.4. Kiểm tra database đã được tạo

- Trong Object Explorer, mở rộng "Databases"
- Bạn sẽ thấy `bookclub_db` trong danh sách

---

## ✅ BƯỚC 5: Test Kết Nối Database

### 5.1. Chạy script test

```powershell
python test_connection.py
```

### 5.2. Kết quả mong đợi (Thành công)

```
🔌 Testing database connection...
✅ Database connection successful!
📊 Creating tables...
✅ Tables created successfully!
🎉 Database setup completed!
```

### 5.3. Nếu gặp lỗi

#### Lỗi: "could not connect to server"
- ✅ Kiểm tra PostgreSQL service đang chạy:
  ```powershell
  Get-Service -Name postgresql*
  ```
- ✅ Nếu không chạy, khởi động:
  ```powershell
  Start-Service postgresql-x64-18
  ```
- ✅ Kiểm tra lại password trong file `.env`

#### Lỗi: "password authentication failed"
- ✅ Xem file `FIX_PASSWORD_ERROR.md`
- ✅ Đặt lại password PostgreSQL

#### Lỗi: "database does not exist"
- ✅ Tạo database `bookclub_db` trong pgAdmin (bước 4)

#### Lỗi: "module not found"
- ✅ Đảm bảo virtual environment đã được activate
- ✅ Chạy lại: `pip install -r requirements.txt`

---

## 🚀 BƯỚC 6: Chạy Backend Server

### 6.1. Chạy server

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6.2. Kết quả mong đợi

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 6.3. Kiểm tra server đang chạy

1. Mở trình duyệt
2. Truy cập: **http://localhost:8000**
3. Bạn sẽ thấy:
   ```json
   {
     "message": "Book Club API",
     "version": "1.0.0",
     "docs": "/docs"
   }
   ```

### 6.4. Xem API Documentation

Truy cập: **http://localhost:8000/docs**

Bạn sẽ thấy Swagger UI với tất cả các API endpoints.

---

## 🌱 BƯỚC 7: Seed Dữ Liệu Mẫu (Tùy chọn)

### 7.1. Chạy seed script

**Lưu ý:** Đảm bảo server đã được dừng (Ctrl+C) trước khi chạy seed.

```powershell
python run_seed.py
```

### 7.2. Kết quả mong đợi

```
🌱 Starting database seeding...
📝 Creating users...
✅ Created 3 users
📚 Creating authors...
✅ Created 3 authors
📖 Creating books...
✅ Created 4 books
...
🎉 Database seeding completed successfully!
```

### 7.3. Kiểm tra dữ liệu trong pgAdmin

1. Mở pgAdmin 4
2. Mở rộng: `bookclub_db` → `Schemas` → `public` → `Tables`
3. Click chuột phải vào table `users` → **"View/Edit Data"** → **"All Rows"**
4. Bạn sẽ thấy 3 users đã được tạo

---

## 📋 Tóm Tắt Checklist

- [ ] ✅ Virtual environment đã được activate (`(venv)` hiển thị)
- [ ] ✅ Dependencies đã được cài đặt (`pip install -r requirements.txt`)
- [ ] ✅ File `.env` đã được tạo và cấu hình đúng
- [ ] ✅ Database `bookclub_db` đã được tạo trong pgAdmin
- [ ] ✅ Test kết nối thành công (`python test_connection.py`)
- [ ] ✅ Backend server chạy được (`uvicorn app.main:app --reload`)
- [ ] ✅ Truy cập được http://localhost:8000/docs
- [ ] ✅ Seed dữ liệu mẫu (tùy chọn)

---

## 🔍 Troubleshooting Nhanh

### Lệnh kiểm tra nhanh:

```powershell
# 1. Kiểm tra venv
python --version
where python  # Phải trỏ đến venv\Scripts\python.exe

# 2. Kiểm tra packages
pip list | Select-String "fastapi|sqlalchemy|pydantic"

# 3. Kiểm tra .env
cat .env

# 4. Kiểm tra PostgreSQL service
Get-Service -Name postgresql*

# 5. Test connection
python test_connection.py
```

---

## 📞 Cần Giúp Đỡ?

Nếu gặp lỗi, xem các file hướng dẫn:
- `FIX_BUILD_ERRORS.md` - Lỗi build/compile
- `FIX_PASSWORD_ERROR.md` - Lỗi password authentication
- `FIX_BCRYPT_ERROR.md` - Lỗi bcrypt/passlib
- `DATABASE_STEPS.md` - Tổng hợp các bước
- `CONNECTION_GUIDE.md` - Hướng dẫn kết nối chi tiết

