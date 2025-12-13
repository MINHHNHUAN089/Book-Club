# Hướng Dẫn Thêm Dữ Liệu Đầu Tiên

## 📚 Cách Thêm Sách Đầu Tiên:

### Cách 1: Từ Google Books (Khuyến nghị)

1. **Click nút "+ Thêm sách"** ở header (góc trên bên phải)
2. Hoặc vào trang **"Khám phá"** (Discover)
3. **Tìm kiếm sách** bằng tên sách hoặc tác giả
4. **Click "Thêm"** trên sách bạn muốn
5. Sách sẽ được thêm vào danh sách của bạn

### Cách 2: Tạo Sách Thủ Công (Qua API)

Nếu bạn muốn tạo sách thủ công, có thể sử dụng Swagger UI:
- Truy cập: http://localhost:8000/docs
- Tìm endpoint `POST /api/books`
- Tạo sách mới với thông tin đầy đủ

---

## 👥 Cách Thêm Câu Lạc Bộ:

### Hiện tại:
- Backend API có endpoint để tạo group
- Frontend chưa có form tạo group
- Bạn có thể tạo group qua Swagger UI: http://localhost:8000/docs

### Hoặc Seed Data:
Chạy script seed data để tạo dữ liệu mẫu:

```powershell
cd C:\Downloads\VS_CODE\BOOK_CLUB\AA\Backend
.\venv\Scripts\Activate.ps1
python run_seed.py
```

Script này sẽ tạo:
- 3 users (john@example.com, jane@example.com, bob@example.com - password: password123)
- 4 books
- 3 authors
- 2 groups
- 2 challenges
- Và các dữ liệu liên quan

---

## 🏆 Cách Thêm Thử Thách:

### Hiện tại:
- Backend API có endpoint để tạo challenge
- Frontend chưa có form tạo challenge
- Bạn có thể tạo challenge qua Swagger UI: http://localhost:8000/docs

### Hoặc Seed Data:
Chạy `python run_seed.py` như trên

---

## ✍️ Cách Thêm Tác Giả:

### Hiện tại:
- Backend API có endpoint để tạo author
- Frontend chưa có form tạo author
- Bạn có thể tạo author qua Swagger UI: http://localhost:8000/docs

### Hoặc Seed Data:
Chạy `python run_seed.py` như trên

---

## 🚀 Cách Nhanh Nhất: Seed Data

### Chạy Seed Data Script:

1. **Mở PowerShell** (đảm bảo Backend đang chạy)
2. **Chạy các lệnh:**
   ```powershell
   cd C:\Downloads\VS_CODE\BOOK_CLUB\AA\Backend
   .\venv\Scripts\Activate.ps1
   python run_seed.py
   ```

3. **Kết quả:**
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

4. **Đăng nhập với tài khoản mẫu:**
   - Email: `john@example.com`
   - Password: `password123`

---

## 💡 Tips:

1. **Sau khi seed data:**
   - Đăng nhập với `john@example.com` / `password123`
   - Bạn sẽ thấy sách, groups, challenges đã được tạo

2. **Nếu muốn seed cho user mới của bạn:**
   - Cần sửa script `seed_data.py` để thêm user của bạn
   - Hoặc tạo dữ liệu thủ công qua Swagger UI

3. **Thêm sách từ Google Books:**
   - Đây là cách dễ nhất để thêm sách
   - Tự động lấy thông tin từ Google Books API
   - Chỉ cần tìm và click "Thêm"

---

## 🔄 Sau Khi Seed Data:

1. **Refresh Frontend** (F5)
2. **Đăng nhập** với tài khoản mẫu hoặc tài khoản của bạn
3. **Bạn sẽ thấy:**
   - Danh sách sách
   - Câu lạc bộ
   - Thử thách
   - Tác giả

---

## ⚠️ Lưu ý:

- Seed data sẽ tạo dữ liệu mẫu cho các users có sẵn
- Nếu bạn tạo user mới, bạn cần thêm dữ liệu cho user đó
- Hoặc đăng nhập với user mẫu để xem dữ liệu

