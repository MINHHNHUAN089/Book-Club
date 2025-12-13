# 🔧 Hướng Dẫn Sửa Lỗi Đăng Nhập

## Các Lỗi Thường Gặp và Cách Sửa

### 1. Lỗi: "Incorrect email or password"

**Nguyên nhân:**
- Email hoặc mật khẩu không đúng
- User không tồn tại trong database
- Password hash không khớp

**Giải pháp:**

#### Kiểm tra user có tồn tại không:
```python
# Chạy trong Python shell hoặc script
from app.database import SessionLocal
from app.models import User

db = SessionLocal()
user = db.query(User).filter(User.email == "admin@library.com").first()
if user:
    print(f"User found: {user.name}, Password hash: {user.hashed_password[:50]}...")
else:
    print("User not found!")
db.close()
```

#### Tạo lại password hash:
```python
from app.auth import get_password_hash
from app.database import SessionLocal
from app.models import User

db = SessionLocal()
user = db.query(User).filter(User.email == "admin@library.com").first()
if user:
    # Tạo lại password hash
    user.hashed_password = get_password_hash("password123")
    db.commit()
    print("Password updated!")
db.close()
```

---

### 2. Lỗi: "User account is inactive"

**Nguyên nhân:**
- User có `is_active = False`

**Giải pháp:**

```python
from app.database import SessionLocal
from app.models import User

db = SessionLocal()
user = db.query(User).filter(User.email == "admin@library.com").first()
if user:
    user.is_active = True
    db.commit()
    print("User activated!")
db.close()
```

---

### 3. Lỗi: "Could not validate credentials" (khi dùng token)

**Nguyên nhân:**
- Token hết hạn
- Token không hợp lệ
- SECRET_KEY không khớp

**Giải pháp:**

1. **Đăng nhập lại để lấy token mới:**
   ```bash
   POST /api/auth/login
   username: admin@library.com
   password: password123
   ```

2. **Kiểm tra SECRET_KEY trong .env:**
   ```env
   SECRET_KEY=your-secret-key-here-change-in-production
   ```
   Đảm bảo SECRET_KEY giống nhau giữa các lần chạy server.

---

### 4. Lỗi: "password cannot be longer than 72 bytes"

**Nguyên nhân:**
- Bcrypt có giới hạn 72 bytes cho password
- Có thể do lỗi tương thích giữa bcrypt và passlib

**Giải pháp:**

Xem file `FIX_BCRYPT_ERROR.md` hoặc chạy:
```powershell
.\fix_bcrypt.ps1
```

---

### 5. Lỗi: "AttributeError: module 'bcrypt' has no attribute '__about__'"

**Nguyên nhân:**
- Xung đột phiên bản giữa bcrypt và passlib

**Giải pháp:**

```powershell
pip uninstall -y bcrypt passlib
pip install bcrypt==3.2.0
pip install "passlib[bcrypt]==1.7.4"
```

---

## 🧪 Test Đăng Nhập

### Cách 1: Sử dụng script test

```powershell
# Đảm bảo server đang chạy
python test_login.py
```

Script sẽ test đăng nhập tất cả tài khoản mẫu và hiển thị kết quả.

### Cách 2: Test qua Swagger UI

1. Mở: http://localhost:8000/docs
2. Tìm endpoint `/api/auth/login`
3. Click "Try it out"
4. Nhập:
   - `username`: `admin@library.com`
   - `password`: `password123`
5. Click "Execute"
6. Nếu thành công, bạn sẽ nhận được `access_token`

### Cách 3: Test qua cURL

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@library.com&password=password123"
```

### Cách 4: Test qua Python

```python
import requests

response = requests.post(
    "http://localhost:8000/api/auth/login",
    data={
        "username": "admin@library.com",
        "password": "password123"
    },
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)

if response.status_code == 200:
    token = response.json()["access_token"]
    print(f"✅ Login successful! Token: {token[:50]}...")
else:
    print(f"❌ Login failed: {response.json()}")
```

---

## 🔄 Tạo Lại Tài Khoản Admin

Nếu tài khoản admin bị lỗi, tạo lại:

```python
from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

db = SessionLocal()

# Xóa user cũ nếu có
db.query(User).filter(User.email == "admin@library.com").delete()

# Tạo user mới
admin = User(
    name="Nguyễn Văn Admin",
    email="admin@library.com",
    hashed_password=get_password_hash("password123"),
    role="admin",
    is_active=True
)
db.add(admin)
db.commit()
db.refresh(admin)

print(f"✅ Admin created: {admin.email}")
db.close()
```

Hoặc sử dụng script:

```powershell
python set_admin_role.py admin@library.com
```

---

## 📋 Checklist Khi Gặp Lỗi Đăng Nhập

- [ ] Server đang chạy tại http://localhost:8000
- [ ] Database đã được tạo và có dữ liệu
- [ ] User tồn tại trong database
- [ ] Password hash đúng (đã được hash bằng bcrypt)
- [ ] User có `is_active = True`
- [ ] Email nhập đúng (không có khoảng trắng thừa)
- [ ] Password nhập đúng (phân biệt hoa thường)
- [ ] SECRET_KEY trong .env đúng
- [ ] bcrypt và passlib đã cài đúng phiên bản

---

## 🆘 Vẫn Không Được?

1. **Kiểm tra logs server:**
   - Xem terminal nơi chạy server
   - Tìm các thông báo lỗi

2. **Reset database:**
   ```sql
   -- Trong pgAdmin hoặc psql
   TRUNCATE TABLE users CASCADE;
   ```
   Sau đó chạy lại seed data:
   ```powershell
   python insert_40_books.py
   ```

3. **Kiểm tra database connection:**
   ```powershell
   python test_connection.py
   ```

4. **Xem chi tiết lỗi:**
   - Bật debug mode trong FastAPI
   - Kiểm tra response từ API

---

## 📞 Cần Giúp Thêm?

- Xem file `ACCOUNTS.md` để biết danh sách tài khoản mẫu
- Xem file `README.md` để biết cách setup
- Kiểm tra file `.env` có đúng cấu hình không

