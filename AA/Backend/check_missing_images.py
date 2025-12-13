"""Kiểm tra sách còn thiếu ảnh"""
import sys
import io
from pathlib import Path

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Book

db = SessionLocal()
books = db.query(Book).order_by(Book.id).all()

missing = [b for b in books if not b.cover_url or not b.cover_url.startswith('http://localhost')]
has_images = [b for b in books if b.cover_url and b.cover_url.startswith('http://localhost')]

print("=" * 80)
print("KIỂM TRA ẢNH SÁCH")
print("=" * 80)
print()
print(f"✅ Có ảnh: {len(has_images)} sách")
print(f"❌ Chưa có ảnh: {len(missing)} sách")
print()

if missing:
    print("=" * 80)
    print("📋 DANH SÁCH SÁCH CHƯA CÓ ẢNH:")
    print("=" * 80)
    print()
    for book in missing:
        print(f"   ID {book.id:2d}: {book.title}")
    print()
    print("💡 Để thêm ảnh:")
    print("   1. Tìm ảnh bìa sách")
    print("   2. Đặt tên: book_{ID}.jpg (ví dụ: book_7.jpg, book_9.jpg)")
    print("   3. Copy vào: Backend\\static\\images\\books\\")
    print("   4. Chạy: python fix_book_images.py")

db.close()

