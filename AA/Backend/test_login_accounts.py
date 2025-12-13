"""
Script để test login với các tài khoản
"""
import sys
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User
from app.auth import verify_password, get_password_hash

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

db: Session = SessionLocal()

print("=" * 60)
print("KIỂM TRA ĐĂNG NHẬP CÁC TÀI KHOẢN")
print("=" * 60)

# Danh sách tài khoản
accounts = [
    ('admin@library.com', 'password123'),
    ('hoa@example.com', 'password123'),
    ('nam@example.com', 'password123'),
    ('mai@example.com', 'password123'),
    ('duc@example.com', 'password123'),
]

print("\n🔐 Test password verification:")
all_ok = True

for email, password in accounts:
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        print(f"   ❌ {email}: User không tồn tại")
        all_ok = False
        continue
    
    # Test password
    is_valid = verify_password(password, user.hashed_password)
    
    if is_valid:
        print(f"   ✅ {email}: Password đúng")
    else:
        print(f"   ❌ {email}: Password SAI!")
        print(f"      - Hash hiện tại: {user.hashed_password[:50]}...")
        # Thử update password
        print(f"      - Đang cập nhật password...")
        new_hash = get_password_hash(password)
        user.hashed_password = new_hash
        db.commit()
        print(f"      - ✅ Đã cập nhật password mới")
        all_ok = False

db.close()

print("\n" + "=" * 60)
if all_ok:
    print("✅ Tất cả tài khoản đều OK!")
else:
    print("⚠️  Đã sửa một số tài khoản")
print("=" * 60)

