# 🔧 Sửa Lỗi "Failed to fetch" Khi Đăng Ký

## ✅ Đã Sửa:

1. ✅ **Backend trả về token sau khi đăng ký** - Thay vì chỉ trả về user info, backend giờ trả về `access_token` để user tự động đăng nhập
2. ✅ **Cải thiện error handling** - Frontend giờ hiển thị thông báo lỗi rõ ràng hơn
3. ✅ **Xử lý network errors** - Thông báo khi không kết nối được đến server

## 🔍 Nguyên Nhân Lỗi "Failed to fetch":

Lỗi này thường xảy ra do:

1. **Backend không chạy** - Server chưa được khởi động
2. **CORS error** - Cấu hình CORS không đúng
3. **Network error** - Không thể kết nối đến API
4. **Backend endpoint lỗi** - Server trả về lỗi nhưng không được xử lý đúng

## 🚀 Cách Kiểm Tra và Sửa:

### 1. Kiểm tra Backend có đang chạy không:

```powershell
# Mở terminal và chạy:
cd AA/Backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Kiểm tra: Mở http://localhost:8000 → Phải thấy JSON response

### 2. Kiểm tra CORS trong Backend:

File `AA/Backend/app/config.py` phải có:
```python
CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
```

File `.env` trong Backend (nếu có):
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Kiểm tra API URL trong Frontend:

File `AA/Frontend/src/api/backend.ts` phải có:
```typescript
const API_BASE_URL = "http://localhost:8000/api";
```

### 4. Test đăng ký qua Swagger UI:

1. Mở: http://localhost:8000/docs
2. Tìm endpoint `/api/auth/register`
3. Click "Try it out"
4. Nhập:
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123"
   }
   ```
5. Click "Execute"
6. Nếu thành công → Sẽ thấy `access_token` trong response

### 5. Test đăng ký qua Frontend:

1. Đảm bảo Backend đang chạy
2. Mở: http://localhost:5173/register
3. Nhập thông tin:
   - Tên: `Test User`
   - Email: `test@example.com`
   - Mật khẩu: `password123`
   - Xác nhận mật khẩu: `password123`
4. Click "Đăng ký"
5. Nếu thành công → Tự động chuyển đến trang chủ

## 🔍 Debug trong Browser:

### Mở DevTools (F12):

1. **Console Tab:**
   - Xem có lỗi JavaScript không
   - Lỗi thường gặp: `CORS error`, `Network error`, `401 Unauthorized`

2. **Network Tab:**
   - Xem request có được gửi không
   - Click vào request `/api/auth/register`
   - Xem:
     - **Status**: 200 = OK, 400 = Bad Request, 500 = Server Error
     - **Response**: Xem server trả về gì
     - **Headers**: Xem CORS headers có đúng không

### Lỗi Thường Gặp:

#### 1. CORS Error:
```
Access to fetch at 'http://localhost:8000/api/auth/register' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Giải pháp:**
- Kiểm tra `CORS_ORIGINS` trong Backend config
- Đảm bảo `http://localhost:5173` có trong danh sách
- Restart Backend server

#### 2. Network Error:
```
Failed to fetch
```

**Giải pháp:**
- Kiểm tra Backend có đang chạy không
- Kiểm tra URL trong `API_BASE_URL` có đúng không
- Kiểm tra firewall có chặn port 8000 không

#### 3. 400 Bad Request:
```
Email already registered
```

**Giải pháp:**
- Email đã tồn tại, dùng email khác
- Hoặc xóa user cũ trong database

#### 4. 500 Internal Server Error:

**Giải pháp:**
- Xem logs trong terminal nơi chạy Backend
- Kiểm tra database connection
- Kiểm tra password hashing có lỗi không

## 📋 Checklist:

- [ ] Backend server đang chạy tại http://localhost:8000
- [ ] Frontend đang chạy tại http://localhost:5173
- [ ] CORS đã được cấu hình đúng
- [ ] API_BASE_URL trong frontend đúng
- [ ] Database đã được tạo và kết nối thành công
- [ ] Không có lỗi trong Console (F12)
- [ ] Network request có status 200 hoặc 201

## 🆘 Vẫn Không Được?

1. **Xem logs Backend:**
   - Terminal nơi chạy `uvicorn` sẽ hiển thị lỗi chi tiết

2. **Test trực tiếp API:**
   ```bash
   curl -X POST "http://localhost:8000/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","password":"password123"}'
   ```

3. **Kiểm tra database:**
   ```python
   # Chạy trong Python shell
   from app.database import SessionLocal
   from app.models import User
   db = SessionLocal()
   users = db.query(User).all()
   print(f"Total users: {len(users)}")
   ```

4. **Reset và thử lại:**
   - Restart Backend server
   - Clear browser cache
   - Thử đăng ký lại

