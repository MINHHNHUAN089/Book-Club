# Hướng Dẫn Thêm Dữ Liệu Đầu Tiên Cho User Mới

## 🎯 Vấn Đề:

Khi tạo tài khoản mới, bạn sẽ thấy:
- ❌ Không có sách nào
- ❌ Không có câu lạc bộ nào
- ❌ Không có thử thách nào
- ❌ Không có tác giả nào

Đây là **bình thường** vì tài khoản mới chưa có dữ liệu!

---

## 🚀 Giải Pháp Nhanh: Seed Data

### Cách 1: Seed Data Cho Tất Cả Users

Chạy script seed data để tạo dữ liệu mẫu:

```powershell
cd C:\Downloads\VS_CODE\BOOK_CLUB\AA\Backend
.\venv\Scripts\Activate.ps1
python run_seed.py
```

**Kết quả:**
- Tạo 3 users mẫu (john@example.com, jane@example.com, bob@example.com)
- Tạo 4 books
- Tạo 3 authors
- Tạo 2 groups
- Tạo 2 challenges
- Tạo dữ liệu liên quan (reviews, user_books, etc.)

**Sau đó đăng nhập với:**
- Email: `john@example.com`
- Password: `password123`

---

## 📚 Cách 2: Thêm Sách Từ Google Books (Cho User Mới)

### Bước 1: Vào Trang Khám Phá

1. Click nút **"+ Thêm sách"** ở header
2. Hoặc vào trang **"Khám phá"** (Discover) từ menu

### Bước 2: Tìm Kiếm Sách

1. Nhập tên sách hoặc tác giả vào ô tìm kiếm
2. Ví dụ: "Harry Potter", "Dune", "1984"
3. Nhấn Enter hoặc đợi kết quả tự động

### Bước 3: Thêm Sách

1. Xem danh sách kết quả từ Google Books
2. Click nút **"Thêm"** trên sách bạn muốn
3. Sách sẽ được:
   - Tạo trong database
   - Thêm vào danh sách của bạn
   - Hiển thị ngay trong trang "Danh sách"

---

## 👥 Cách 3: Tạo Câu Lạc Bộ (Qua Swagger UI)

### Bước 1: Mở Swagger UI

Truy cập: http://localhost:8000/docs

### Bước 2: Tạo Group

1. Tìm endpoint `POST /api/groups`
2. Click "Try it out"
3. Nhập thông tin:
   ```json
   {
     "name": "Fantasy Book Club",
     "description": "Câu lạc bộ đọc sách fantasy"
   }
   ```
4. Click "Execute"
5. Group sẽ được tạo

### Bước 3: Tham Gia Group

1. Vào trang "Book club" trong Frontend
2. Click "Tham gia" trên group vừa tạo

---

## 🏆 Cách 4: Tạo Thử Thách (Qua Swagger UI)

### Bước 1: Mở Swagger UI

Truy cập: http://localhost:8000/docs

### Bước 2: Tạo Challenge

1. Tìm endpoint `POST /api/challenges`
2. Click "Try it out"
3. Nhập thông tin:
   ```json
   {
     "name": "Đọc 10 cuốn sách trong 2024",
     "description": "Thử thách đọc sách năm 2024",
     "target_count": 10,
     "start_date": "2024-01-01T00:00:00",
     "end_date": "2024-12-31T23:59:59"
   }
   ```
4. Click "Execute"
5. Challenge sẽ được tạo

### Bước 3: Tham Gia Challenge

1. Vào trang "Thử thách" trong Frontend
2. Click "Tham gia ngay" trên challenge vừa tạo

---

## ✍️ Cách 5: Tạo Tác Giả (Qua Swagger UI)

### Bước 1: Mở Swagger UI

Truy cập: http://localhost:8000/docs

### Bước 2: Tạo Author

1. Tìm endpoint `POST /api/authors`
2. Click "Try it out"
3. Nhập thông tin:
   ```json
   {
     "name": "J.K. Rowling",
     "bio": "Tác giả của series Harry Potter"
   }
   ```
4. Click "Execute"
5. Author sẽ được tạo

### Bước 3: Follow Author

1. Vào trang "Tác giả" trong Frontend
2. Click "Theo dõi" trên author vừa tạo

---

## 🎯 Tóm Tắt Các Cách:

| Dữ Liệu | Cách Thêm | Độ Khó |
|---------|-----------|--------|
| **Sách** | Google Books (Khám phá) | ⭐ Dễ |
| **Sách** | Swagger UI | ⭐⭐ Trung bình |
| **Group** | Swagger UI | ⭐⭐ Trung bình |
| **Challenge** | Swagger UI | ⭐⭐ Trung bình |
| **Author** | Swagger UI | ⭐⭐ Trung bình |
| **Tất cả** | Seed Data Script | ⭐ Dễ (nhưng tạo cho users mẫu) |

---

## 💡 Khuyến Nghị:

1. **Cho User Mới:**
   - Thêm sách từ Google Books (dễ nhất)
   - Sau đó có thể tham gia groups/challenges đã có

2. **Cho Development/Testing:**
   - Chạy seed data script
   - Đăng nhập với user mẫu để test

3. **Cho Production:**
   - User tự thêm sách từ Google Books
   - Admin tạo groups/challenges qua Swagger UI hoặc admin panel (chưa có)

---

## 🔄 Sau Khi Thêm Dữ Liệu:

1. **Refresh Frontend** (F5)
2. **Kiểm tra các trang:**
   - Danh sách sách → Có sách
   - Book club → Có groups
   - Thử thách → Có challenges
   - Tác giả → Có authors

---

## ⚠️ Lưu Ý:

- **Sách:** Có thể thêm trực tiếp từ Frontend (Google Books)
- **Groups/Challenges/Authors:** Hiện tại cần tạo qua Swagger UI
- **Seed Data:** Tạo dữ liệu cho users mẫu, không phải user mới của bạn

Bạn muốn tôi tạo form để thêm groups/challenges/authors trực tiếp từ Frontend không?

