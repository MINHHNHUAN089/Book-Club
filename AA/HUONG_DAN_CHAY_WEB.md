# 🚀 HƯỚNG DẪN CHẠY WEB - BOOK CLUB

## 📋 MỤC LỤC

1. [Cài đặt Backend](#cài-đặt-backend)
2. [Cài đặt Frontend](#cài-đặt-frontend)
3. [Cấu hình Database](#cấu-hình-database)
4. [Chạy ứng dụng](#chạy-ứng-dụng)
5. [Các lệnh hữu ích](#các-lệnh-hữu-ích)

---

## 🔧 CÀI ĐẶT BACKEND

### Bước 1: Di chuyển vào thư mục Backend

```powershell
cd Backend
```

### Bước 2: Tạo Virtual Environment (nếu chưa có)

```powershell
python -m venv venv
```

### Bước 3: Kích hoạt Virtual Environment

```powershell
.\venv\Scripts\Activate.ps1
```

### Bước 4: Cài đặt Dependencies

```powershell
pip install -r requirements.txt
```

**Lưu ý:** Nếu chưa có file `requirements.txt`, tạo file với nội dung:

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
alembic==1.12.1
```

---

## 🎨 CÀI ĐẶT FRONTEND

### Bước 1: Di chuyển vào thư mục Frontend

```powershell
cd Frontend
```

### Bước 2: Cài đặt Dependencies

```powershell
npm install
```

---

## 🗄️ CẤU HÌNH DATABASE

### Bước 1: Tạo file `.env` trong thư mục Backend

Tạo file `Backend/.env` với nội dung:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/bookclub
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Lưu ý:** 
- Thay `password` bằng mật khẩu PostgreSQL của bạn
- Thay `your-secret-key-here` bằng secret key (chạy lệnh bên dưới để tạo)

### Bước 2: Tạo Secret Key

```powershell
cd Backend
.\venv\Scripts\Activate.ps1
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy kết quả và paste vào `SECRET_KEY` trong file `.env`

### Bước 3: Tạo Database trong PostgreSQL

1. Mở **pgAdmin 4**
2. Tạo database mới tên `bookclub`
3. Hoặc chạy SQL:

```sql
CREATE DATABASE bookclub;
```

### Bước 4: Chạy Schema (Tùy chọn)

Nếu muốn chạy schema từ file `library_schema.sql`:

```powershell
cd Backend
.\venv\Scripts\Activate.ps1
python run_library_schema.py
```

---

## 🚀 CHẠY ỨNG DỤNG

### Terminal 1: Chạy Backend

```powershell
cd Backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Hoặc sử dụng script:**

```powershell
cd Backend
.\start_server.ps1
```

Backend sẽ chạy tại: **http://localhost:8000**

API Documentation: **http://localhost:8000/docs**

### Terminal 2: Chạy Frontend

```powershell
cd Frontend
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

---

## 📝 CÁC LỆNH HỮU ÍCH

### Backend

#### Kiểm tra kết nối Database

```powershell
cd Backend
.\venv\Scripts\Activate.ps1
python test_connection.py
```

#### Thêm 40 cuốn sách vào database

```powershell
cd Backend
.\venv\Scripts\Activate.ps1
python insert_40_books.py
```

#### Thêm sách vào danh sách của users

```powershell
cd Backend
.\venv\Scripts\Activate.ps1
python add_books_to_users.py
```

#### Thêm groups và challenges mẫu

```powershell
cd Backend
.\venv\Scripts\Activate.ps1
python add_groups_challenges.py
```

#### Set role admin cho user

```powershell
cd Backend
.\venv\Scripts\Activate.ps1
python set_admin_role.py admin@library.com
```

#### Cập nhật ảnh sách

```powershell
cd Backend
.\venv\Scripts\Activate.ps1
python update_book_covers.py
```

#### Liệt kê tất cả sách

```powershell
cd Backend
.\venv\Scripts\Activate.ps1
python list_books.py
```

### Frontend

#### Build production

```powershell
cd Frontend
npm run build
```

#### Preview production build

```powershell
cd Frontend
npm run preview
```

#### Kiểm tra lỗi linting

```powershell
cd Frontend
npm run lint
```

---

## 🔐 TÀI KHOẢN MẶC ĐỊNH

Sau khi chạy `insert_40_books.py`, các tài khoản sau sẽ được tạo:

| Email | Password | Role |
|-------|----------|------|
| admin@library.com | password123 | admin |
| hoa@example.com | password123 | user |
| nam@example.com | password123 | user |
| mai@example.com | password123 | user |
| duc@example.com | password123 | user |

**Lưu ý:** Để set role admin, chạy:
```powershell
python set_admin_role.py admin@library.com
```

---

## 🐛 TROUBLESHOOTING

### Lỗi: "ModuleNotFoundError"

**Giải pháp:**
```powershell
cd Backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Lỗi: "Cannot connect to database"

**Giải pháp:**
1. Kiểm tra PostgreSQL đang chạy
2. Kiểm tra `DATABASE_URL` trong file `.env`
3. Kiểm tra username/password trong `DATABASE_URL`

### Lỗi: "Port 8000 already in use"

**Giải pháp:**
- Đổi port trong lệnh uvicorn:
```powershell
uvicorn app.main:app --reload --port 8001
```

### Lỗi: "Port 5173 already in use"

**Giải pháp:**
- Vite sẽ tự động tìm port khác
- Hoặc chỉ định port:
```powershell
npm run dev -- --port 5174
```

### Lỗi: "UnicodeEncodeError"

**Giải pháp:**
- Đảm bảo file `.env` được lưu với encoding UTF-8 (không có BOM)
- Tạo lại file `.env`:
```powershell
cd Backend
[System.IO.File]::WriteAllText(".env", "DATABASE_URL=...", [System.Text.Encoding]::UTF8)
```

---

## 📚 CẤU TRÚC THƯ MỤC

```
BOOK_CLUB/
├── Backend/
│   ├── app/
│   │   ├── routers/      # API endpoints
│   │   ├── models.py     # Database models
│   │   ├── schemas.py    # Pydantic schemas
│   │   ├── auth.py       # Authentication
│   │   └── main.py       # FastAPI app
│   ├── static/           # Static files (images)
│   ├── venv/             # Virtual environment
│   ├── .env              # Environment variables
│   └── requirements.txt  # Python dependencies
│
└── Frontend/
    ├── src/
    │   ├── pages/         # React pages
    │   ├── components/   # React components
    │   ├── api/          # API calls
    │   └── App.tsx       # Main app
    ├── node_modules/     # Node dependencies
    └── package.json     # Node dependencies
```

---

## ✅ CHECKLIST TRƯỚC KHI CHẠY

- [ ] PostgreSQL đã được cài đặt và đang chạy
- [ ] Database `bookclub` đã được tạo
- [ ] File `.env` đã được tạo với đúng thông tin
- [ ] Virtual environment đã được kích hoạt
- [ ] Backend dependencies đã được cài đặt
- [ ] Frontend dependencies đã được cài đặt
- [ ] Port 8000 và 5173 không bị chiếm dụng

---

## 🎯 QUY TRÌNH CHẠY NHANH

### Lần đầu tiên:

```powershell
# 1. Backend
cd Backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Tạo file .env và điền thông tin
uvicorn app.main:app --reload --port 8000

# 2. Frontend (Terminal mới)
cd Frontend
npm install
npm run dev
```

### Các lần sau:

```powershell
# Terminal 1: Backend
cd Backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd Frontend
npm run dev
```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, kiểm tra:
1. Console logs trong terminal
2. Browser DevTools (F12) → Console tab
3. Backend logs tại http://localhost:8000/docs
4. File `README.md` trong thư mục Backend

---

**Chúc bạn code vui vẻ! 🎉**

