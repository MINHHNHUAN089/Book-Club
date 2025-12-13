# Sửa Lỗi "Incorrect email or password"

## 🔍 Nguyên Nhân Có Thể:

1. **User chưa được tạo trong database**
   - Đăng ký thành công nhưng không lưu vào database
   - Có lỗi khi commit

2. **Password hash không khớp**
   - Password được hash khác cách verify
   - Có vấn đề với bcrypt/passlib

3. **Email không đúng**
   - Email nhập không khớp với email đã đăng ký
   - Có khoảng trắng hoặc ký tự đặc biệt

---

## 🧪 Cách Kiểm Tra:

### Bước 1: Test User Có Tồn Tại Không

Chạy script test:

```powershell
cd C:\Downloads\VS_CODE\BOOK_CLUB\AA\Backend
.\venv\Scripts\Activate.ps1
python test_login.py
```

Script này sẽ:
- Liệt kê tất cả users trong database
- Kiểm tra user có tồn tại không
- Test password verification

### Bước 2: Kiểm Tra Trong pgAdmin

1. Mở pgAdmin 4
2. Mở rộng: `BookClub Server` → `Databases` → `bookclub_db` → `Schemas` → `public` → `Tables`
3. Click chuột phải vào table `users` → **"View/Edit Data"** → **"All Rows"**
4. Xem có user với email bạn đã đăng ký không

---

## 🔧 Cách Sửa:

### Cách 1: Đăng Ký Lại

1. Thử đăng ký lại với email khác
2. Kiểm tra xem có lỗi gì trong Console (F12) không
3. Kiểm tra Backend logs xem có lỗi không

### Cách 2: Seed Data và Đăng Nhập Với User Mẫu

Chạy seed data để tạo users mẫu:

```powershell
cd C:\Downloads\VS_CODE\BOOK_CLUB\AA\Backend
.\venv\Scripts\Activate.ps1
python run_seed.py
```

Sau đó đăng nhập với:
- Email: `john@example.com`
- Password: `password123`

### Cách 3: Kiểm Tra Backend Logs

1. Xem terminal chạy Backend
2. Khi đăng nhập, xem có lỗi gì không
3. Kiểm tra có request đến `/api/auth/login` không

---

## 🐛 Debug Chi Tiết:

### Mở Swagger UI và Test Trực Tiếp:

1. Truy cập: http://localhost:8000/docs
2. Tìm endpoint `POST /api/auth/login`
3. Click "Try it out"
4. Nhập:
   - username: `john@example.com` (hoặc email bạn đã đăng ký)
   - password: `password123` (hoặc password bạn đã đăng ký)
5. Click "Execute"
6. Xem response:
   - **200 OK** → Login thành công
   - **401 Unauthorized** → Email/password không đúng

---

## ✅ Checklist:

- [ ] Backend đang chạy (http://localhost:8000)
- [ ] User đã được tạo trong database (kiểm tra trong pgAdmin)
- [ ] Email nhập đúng (không có khoảng trắng)
- [ ] Password nhập đúng
- [ ] Không có lỗi trong Backend logs
- [ ] Không có lỗi trong Frontend Console (F12)

---

## 💡 Tips:

1. **Thử đăng ký lại** với email mới
2. **Kiểm tra trong pgAdmin** xem user có được tạo không
3. **Test qua Swagger UI** để xem lỗi cụ thể
4. **Chạy seed data** để có users mẫu để test

---

## 🚀 Nếu Vẫn Không Được:

1. **Kiểm tra Backend logs** khi đăng nhập
2. **Kiểm tra Network tab** (F12) xem API call có được gửi không
3. **Xem response** từ API (status code, error message)
4. **Chạy test_login.py** để debug chi tiết

Bạn thử chạy `python test_login.py` và cho tôi biết kết quả!

