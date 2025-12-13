# Sửa Lỗi: Frontend Không Bấm Được Chức Năng

## ✅ Đã Sửa:

1. ✅ Tạo API service (`src/api/backend.ts`) để kết nối với Backend
2. ✅ Cập nhật LoginPage để gọi API đăng nhập thật
3. ✅ Cập nhật RegisterPage để gọi API đăng ký thật

## 🚀 Cách Test:

### 1. Đảm bảo Backend đang chạy:

```powershell
# Terminal 1: Backend
cd C:\Downloads\VS_CODE\BOOK_CLUB\AA\Backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Kiểm tra: http://localhost:8000 → Phải thấy JSON response

### 2. Chạy Frontend:

```powershell
# Terminal 2: Frontend
cd C:\Downloads\VS_CODE\BOOK_CLUB\AA\Frontend
npm run dev
```

### 3. Test Đăng Ký:

1. Mở: http://localhost:5173
2. Click "Đăng ký" (hoặc truy cập http://localhost:5173/register)
3. Nhập thông tin:
   - Tên: `Test User`
   - Email: `test@example.com`
   - Mật khẩu: `password123`
   - Xác nhận mật khẩu: `password123`
4. Click "Đăng ký"
5. Nếu thành công → Tự động chuyển đến trang chủ

### 4. Test Đăng Nhập:

1. Click "Đăng nhập" (hoặc truy cập http://localhost:5173/login)
2. Nhập:
   - Email: `test@example.com`
   - Mật khẩu: `password123`
3. Click "Đăng nhập"
4. Nếu thành công → Tự động chuyển đến trang chủ

## 🔍 Kiểm Tra Lỗi:

### Mở DevTools (F12) và kiểm tra:

1. **Console Tab:**
   - Xem có lỗi JavaScript không
   - Lỗi thường gặp: `CORS error`, `Network error`, `401 Unauthorized`

2. **Network Tab:**
   - Xem các API calls có được gửi không
   - Xem response status (200 = OK, 401 = Unauthorized, 500 = Server Error)

### Lỗi Thường Gặp:

#### 1. CORS Error:
```
Access to fetch at 'http://localhost:8000/api/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Giải pháp:**
- Kiểm tra file `.env` trong Backend có:
  ```
  CORS_ORIGINS=http://localhost:5173,http://localhost:3000
  ```
- Restart Backend server

#### 2. 401 Unauthorized:
```
401 Unauthorized
```

**Giải pháp:**
- Đảm bảo đã đăng ký/đăng nhập thành công
- Token được lưu trong localStorage (F12 → Application → Local Storage)

#### 3. Network Error / Failed to fetch:
```
Failed to fetch
```

**Giải pháp:**
- Kiểm tra Backend có đang chạy không (http://localhost:8000)
- Kiểm tra firewall có chặn không
- Kiểm tra URL trong `src/api/backend.ts` có đúng không

#### 4. 500 Internal Server Error:
```
500 Internal Server Error
```

**Giải pháp:**
- Xem log trong Terminal chạy Backend
- Kiểm tra database có kết nối được không
- Kiểm tra file `.env` có đúng không

## 📝 Các Chức Năng Đã Kết Nối API:

- ✅ Đăng ký (Register)
- ✅ Đăng nhập (Login)
- ⏳ Danh sách sách (cần cập nhật App.tsx)
- ⏳ Thêm sách (cần cập nhật)
- ⏳ Đánh giá sách (cần cập nhật)
- ⏳ Câu lạc bộ (cần cập nhật)
- ⏳ Thử thách (cần cập nhật)

## 🔄 Tiếp Theo:

Các chức năng khác (books, reviews, groups, challenges) vẫn đang dùng mock data. Để kết nối hoàn toàn:

1. Cập nhật `App.tsx` để load data từ API thay vì mock data
2. Cập nhật các handlers để gọi API
3. Thêm error handling và loading states

Nhưng hiện tại, **Đăng ký và Đăng nhập đã hoạt động** với Backend thật!

## 🧪 Test Nhanh:

1. Mở http://localhost:5173/register
2. Đăng ký tài khoản mới
3. Kiểm tra trong pgAdmin: `users` table có user mới không
4. Đăng nhập với tài khoản vừa tạo
5. Kiểm tra localStorage có token không (F12 → Application → Local Storage)

