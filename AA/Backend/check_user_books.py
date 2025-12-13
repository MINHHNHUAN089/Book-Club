"""
Script để kiểm tra sách của user cụ thể
"""
import sys
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, UserBook

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

db: Session = SessionLocal()

print("=" * 60)
print("KIỂM TRA SÁCH CỦA TỪNG USER")
print("=" * 60)

# Lấy tất cả users
users = db.query(User).all()

for user in users:
    user_books = db.query(UserBook).filter(UserBook.user_id == user.id).all()
    print(f"\n👤 {user.email} ({user.name}):")
    print(f"   - Số sách: {len(user_books)}")
    
    if len(user_books) > 0:
        for ub in user_books[:5]:  # Hiển thị 5 sách đầu
            print(f"   - {ub.book.title} (Status: {ub.status}, Progress: {ub.progress}%)")
        if len(user_books) > 5:
            print(f"   ... và {len(user_books) - 5} sách khác")
    else:
        print("   ⚠️  Chưa có sách nào!")

print("\n" + "=" * 60)
print("💡 Nếu user của bạn không có sách, hãy:")
print("   1. Đăng nhập với một trong các tài khoản có sách")
print("   2. Hoặc chạy lại: python add_books_to_users.py")
print("=" * 60)

db.close()

