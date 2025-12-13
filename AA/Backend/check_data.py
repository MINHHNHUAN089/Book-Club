"""
Script để kiểm tra dữ liệu trong database
"""
import sys
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, Book, UserBook, Author

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

db: Session = SessionLocal()

print("=" * 60)
print("KIỂM TRA DỮ LIỆU TRONG DATABASE")
print("=" * 60)

# 1. Kiểm tra Users
print("\n👥 USERS:")
users = db.query(User).all()
print(f"   Tổng số users: {len(users)}")
for user in users[:10]:  # Hiển thị 10 users đầu
    print(f"   - {user.email} ({user.name})")

# 2. Kiểm tra Books
print("\n📚 BOOKS:")
books = db.query(Book).all()
print(f"   Tổng số books: {len(books)}")
for book in books[:10]:  # Hiển thị 10 books đầu
    authors = ", ".join([a.name for a in book.authors])
    print(f"   - {book.title} by {authors}")

# 3. Kiểm tra UserBooks
print("\n📖 USER_BOOKS:")
user_books = db.query(UserBook).all()
print(f"   Tổng số user_books: {len(user_books)}")
if len(user_books) == 0:
    print("   ⚠️  KHÔNG CÓ SÁCH NÀO TRONG DANH SÁCH CỦA USERS!")
    print("   💡 Cần thêm sách vào danh sách của users")
else:
    for ub in user_books[:10]:
        print(f"   - User {ub.user_id}: {ub.book.title} (Status: {ub.status}, Progress: {ub.progress}%)")

# 4. Kiểm tra Authors
print("\n✍️  AUTHORS:")
authors = db.query(Author).all()
print(f"   Tổng số authors: {len(authors)}")
for author in authors[:10]:
    print(f"   - {author.name}")

print("\n" + "=" * 60)
if len(user_books) == 0:
    print("⚠️  VẤN ĐỀ: Users chưa có sách nào trong danh sách!")
    print("💡 Giải pháp: Chạy script để thêm sách vào danh sách của users")
else:
    print("✅ Dữ liệu có vẻ ổn")
print("=" * 60)

db.close()

