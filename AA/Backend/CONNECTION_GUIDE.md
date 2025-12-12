# Hướng dẫn kết nối PostgreSQL với Backend

## Bước 1: Tạo Database trong pgAdmin 4

### 1.1. Kết nối PostgreSQL Server
1. Mở pgAdmin 4
2. Click chuột phải vào **"Servers"** → **"Create"** → **"Server..."**
3. Trong tab **"General"**:
   - **Name**: `BookClub Server` (hoặc tên bạn muốn)
4. Trong tab **"Connection"**:
   - **Host name/address**: `localhost` (hoặc `127.0.0.1`)
   - **Port**: `5432` (port mặc định của PostgreSQL)
   - **Maintenance database**: `postgres`
   - **Username**: `postgres` (hoặc username của bạn)
   - **Password**: Nhập password PostgreSQL của bạn
5. Click **"Save"**

### 1.2. Tạo Database mới
1. Mở rộng server vừa tạo
2. Click chuột phải vào **"Databases"** → **"Create"** → **"Database..."**
3. Trong tab **"General"**:
   - **Database**: `bookclub_db`
4. Click **"Save"**

## Bước 2: Cấu hình Backend

### 2.1. Tạo file `.env` trong thư mục `Backend`

Tạo file `.env` với nội dung sau:

```env
# Database Connection
# Format: postgresql://username:password@host:port/database_name
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/bookclub_db

# JWT Secret Key (thay đổi thành key ngẫu nhiên mạnh)
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars

# JWT Algorithm
ALGORITHM=HS256

# Token expiration (minutes)
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Origins (các domain được phép gọi API)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 2.2. Thay đổi thông tin kết nối

Thay thế các giá trị sau trong file `.env`:

- `your_password`: Password PostgreSQL của bạn
- `your-super-secret-key-change-this-in-production-min-32-chars`: Secret key ngẫu nhiên (ít nhất 32 ký tự)

**Ví dụ:**
```env
DATABASE_URL=postgresql://postgres:mypassword123@localhost:5432/bookclub_db
SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

## Bước 3: Test kết nối

### 3.1. Cài đặt dependencies (nếu chưa cài)

```bash
cd Backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 3.2. Chạy Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3.3. Kiểm tra kết nối

1. Mở trình duyệt: http://localhost:8000
2. Nếu thấy `{"message":"Book Club API","version":"1.0.0","docs":"/docs"}` → Kết nối thành công!
3. Truy cập: http://localhost:8000/docs để xem API documentation

## Bước 4: Tạo Tables tự động

Khi chạy Backend lần đầu, các bảng sẽ được tạo tự động nhờ dòng code trong `app/main.py`:

```python
Base.metadata.create_all(bind=engine)
```

### Kiểm tra tables đã tạo:

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

## Troubleshooting

### Lỗi: "could not connect to server"
- Kiểm tra PostgreSQL service đang chạy
- Kiểm tra host, port, username, password trong `.env`
- Kiểm tra firewall có chặn port 5432 không

### Lỗi: "database does not exist"
- Tạo database `bookclub_db` trong pgAdmin
- Kiểm tra tên database trong `DATABASE_URL`

### Lỗi: "password authentication failed"
- Kiểm tra lại password trong file `.env`
- Thử đổi password PostgreSQL nếu cần

### Lỗi: "module not found"
- Chạy `pip install -r requirements.txt`
- Đảm bảo virtual environment đã được activate

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG:**
- **KHÔNG** commit file `.env` lên Git (đã có trong `.gitignore`)
- Thay đổi `SECRET_KEY` thành giá trị ngẫu nhiên mạnh trong production
- Sử dụng password mạnh cho PostgreSQL
- Không chia sẻ file `.env` với người khác

