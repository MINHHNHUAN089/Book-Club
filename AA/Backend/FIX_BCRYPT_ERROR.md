# Hướng dẫn sửa lỗi bcrypt/passlib

## Lỗi: "password cannot be longer than 72 bytes" hoặc "AttributeError: module 'bcrypt' has no attribute '__about__'"

Lỗi này xảy ra do xung đột phiên bản giữa `bcrypt` và `passlib`. Phiên bản mới của `bcrypt` (4.0.0+) không tương thích với `passlib` 1.7.4.

## Giải pháp

### Cách 1: Sử dụng script tự động (Khuyến nghị)

Chạy script PowerShell để tự động sửa:

```powershell
# Trong thư mục Backend, với venv đã activate
.\fix_bcrypt.ps1
```

### Cách 2: Sửa thủ công

#### Bước 1: Gỡ cài đặt các package xung đột

```powershell
pip uninstall -y bcrypt passlib
```

#### Bước 2: Cài đặt lại phiên bản tương thích

```powershell
pip install bcrypt==3.2.0
pip install "passlib[bcrypt]==1.7.4"
```

### Cách 3: Cài đặt lại tất cả dependencies

```powershell
# Xóa và tạo lại venv (nếu cần)
# deactivate
# Remove-Item -Recurse -Force venv
# python -m venv venv
# .\venv\Scripts\Activate.ps1

# Cài đặt lại tất cả
pip install -r requirements.txt
```

## Kiểm tra

Sau khi sửa, chạy lại seed script:

```powershell
python run_seed.py
```

Nếu thành công, bạn sẽ thấy:
```
🌱 Starting database seeding...
📝 Creating users...
✅ Created 3 users
...
🎉 Database seeding completed successfully!
```

## Phiên bản tương thích

- `bcrypt==3.2.0` - Tương thích với passlib 1.7.4
- `passlib[bcrypt]==1.7.4` - Phiên bản ổn định

## Lưu ý

- Không nâng cấp `bcrypt` lên 4.0.0+ nếu đang dùng `passlib` 1.7.4
- Nếu muốn dùng `bcrypt` 4.0.0+, cần nâng cấp `passlib` lên phiên bản mới hơn (chưa có phiên bản ổn định tại thời điểm này)
- Code đã được cập nhật với fallback mechanism để xử lý lỗi tốt hơn

## Troubleshooting

### Lỗi vẫn còn sau khi sửa

1. Kiểm tra phiên bản đã cài:
   ```powershell
   pip show bcrypt passlib
   ```

2. Đảm bảo đang dùng đúng venv:
   ```powershell
   where python
   # Phải trỏ đến venv\Scripts\python.exe
   ```

3. Thử cài đặt lại:
   ```powershell
   pip install --force-reinstall bcrypt==3.2.0
   pip install --force-reinstall "passlib[bcrypt]==1.7.4"
   ```

### Lỗi khi chạy script PowerShell

Nếu gặp lỗi "execution policy", chạy:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Sau đó chạy lại script.
