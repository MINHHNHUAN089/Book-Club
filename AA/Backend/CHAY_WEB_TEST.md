# Hướng Dẫn Chạy Web Để Test Chức Năng

## 🚀 BƯỚC 1: Chạy Backend Server

### Kiểm tra Backend đang chạy:

Mở trình duyệt và truy cập: **http://localhost:8000**

Nếu thấy:
```json
{
  "message": "Book Club API",
  "version": "1.0.0",
  "docs": "/docs"
}
```
→ Backend đang chạy ✅

### Nếu Backend chưa chạy:

1. Mở PowerShell
2. Chạy các lệnh:
```powershell
cd C:\Downloads\VS_CODE\BOOK_CLUB\AA\Backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🎨 BƯỚC 2: Chạy Frontend

### Mở PowerShell mới (giữ Backend đang chạy):

1. Mở PowerShell mới (không đóng PowerShell chạy Backend)
2. Chạy các lệnh:
```powershell
cd C:\Downloads\VS_CODE\BOOK_CLUB\AA\Frontend
npm run dev
```

### Kết quả mong đợi:

Bạn sẽ thấy:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network:  use --host to expose
```

---

## 🌐 BƯỚC 3: Truy Cập Ứng Dụng Web

### Mở trình duyệt và truy cập:

**Frontend:** http://localhost:5173

Bạn sẽ thấy giao diện Book Club với các trang:
- 📚 Danh sách sách
- ⭐ Đánh giá sách
- 💡 Gợi ý
- 👥 Câu lạc bộ
- 🏆 Thử thách
- ✍️ Tác giả
- 🔍 Khám phá

---

## 🧪 BƯỚC 4: Test Các Chức Năng

### 4.1. Test Backend API trực tiếp:

**Swagger UI (API Documentation):**
- Truy cập: http://localhost:8000/docs
- Bạn có thể test tất cả API endpoints tại đây:
  - `POST /api/auth/register` - Đăng ký
  - `POST /api/auth/login` - Đăng nhập
  - `GET /api/books` - Lấy danh sách sách
  - `POST /api/books` - Tạo sách mới
  - Và nhiều endpoints khác...

**ReDoc (Alternative Documentation):**
- Truy cập: http://localhost:8000/redoc

### 4.2. Test qua Frontend:

1. **Đăng ký/Đăng nhập:**
   - Click vào "Đăng ký" hoặc "Đăng nhập"
   - Tạo tài khoản mới hoặc đăng nhập

2. **Xem danh sách sách:**
   - Trang chủ sẽ hiển thị danh sách sách
   - Click vào sách để xem chi tiết

3. **Thêm sách:**
   - Từ trang "Khám phá" (Google Books)
   - Tìm sách và thêm vào danh sách

4. **Đánh giá sách:**
   - Click vào sách → Click "Review"
   - Nhập đánh giá và rating

5. **Tham gia câu lạc bộ:**
   - Vào trang "Câu lạc bộ"
   - Click "Tham gia" vào các club

6. **Tham gia thử thách:**
   - Vào trang "Thử thách"
   - Click "Tham gia" vào các challenge

---

## 📋 Checklist Test

- [ ] Backend server chạy tại http://localhost:8000
- [ ] Frontend chạy tại http://localhost:5173
- [ ] Có thể truy cập Swagger UI tại http://localhost:8000/docs
- [ ] Có thể đăng ký tài khoản mới
- [ ] Có thể đăng nhập
- [ ] Có thể xem danh sách sách
- [ ] Có thể thêm sách từ Google Books
- [ ] Có thể đánh giá sách
- [ ] Có thể tham gia câu lạc bộ
- [ ] Có thể tham gia thử thách

---

## 🔧 Troubleshooting

### Lỗi: Frontend không kết nối được Backend

**Kiểm tra:**
1. Backend có đang chạy không? (http://localhost:8000)
2. CORS đã được cấu hình đúng chưa? (kiểm tra `.env` có `CORS_ORIGINS=http://localhost:5173`)
3. Xem Console trong trình duyệt (F12) để xem lỗi cụ thể

### Lỗi: "Cannot GET /"

- Đảm bảo Frontend đang chạy tại http://localhost:5173
- Không truy cập http://localhost:8000 (đó là Backend)

### Lỗi: API calls failed

- Kiểm tra Backend có đang chạy không
- Kiểm tra Network tab trong DevTools (F12) để xem request/response
- Kiểm tra CORS settings trong Backend

---

## 🎯 Các URL Quan Trọng

| Service | URL | Mô tả |
|---------|-----|-------|
| **Frontend** | http://localhost:5173 | Giao diện người dùng |
| **Backend API** | http://localhost:8000 | API server |
| **Swagger UI** | http://localhost:8000/docs | API documentation (interactive) |
| **ReDoc** | http://localhost:8000/redoc | API documentation (alternative) |
| **Health Check** | http://localhost:8000/health | Kiểm tra server status |

---

## 💡 Tips

1. **Giữ 2 terminal mở:**
   - Terminal 1: Backend server (uvicorn)
   - Terminal 2: Frontend dev server (npm run dev)

2. **Sử dụng Swagger UI để test API:**
   - Rất tiện để test các endpoints
   - Có thể xem request/response format
   - Có thể test authentication

3. **Sử dụng DevTools (F12):**
   - Console: Xem lỗi JavaScript
   - Network: Xem API calls
   - Application: Xem localStorage, cookies

4. **Hot Reload:**
   - Backend: Tự động reload khi code thay đổi (nhờ `--reload`)
   - Frontend: Tự động reload khi code thay đổi (nhờ Vite)

---

## 🚀 Bắt Đầu Test Ngay!

1. ✅ Đảm bảo Backend đang chạy
2. ✅ Chạy Frontend
3. ✅ Mở http://localhost:5173
4. ✅ Bắt đầu test các chức năng!

