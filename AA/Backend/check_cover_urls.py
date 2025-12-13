"""
Script để kiểm tra cover_url của các sách
"""
import sys
import io
from pathlib import Path

# Fix encoding
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Book

db = SessionLocal()

print("=" * 80)
print("KIỂM TRA COVER_URL CỦA CÁC SÁCH")
print("=" * 80)
print()

books = db.query(Book).order_by(Book.id).all()

print(f"{'ID':<6} | {'Tên Sách':<40} | {'Cover URL':<50}")
print("-" * 100)

for book in books:
    title = book.title[:38] + ".." if len(book.title) > 40 else book.title
    cover = book.cover_url if book.cover_url else "(None)"
    cover = cover[:48] + ".." if len(cover) > 50 else cover
    print(f"{book.id:<6} | {title:<40} | {cover:<50}")

print()
print("=" * 80)
print("PHÂN TÍCH:")
print("=" * 80)

# Phân loại
no_cover = [b for b in books if not b.cover_url]
relative_path = [b for b in books if b.cover_url and not b.cover_url.startswith("http")]
full_url = [b for b in books if b.cover_url and b.cover_url.startswith("http")]

print(f"❌ Không có ảnh: {len(no_cover)} sách (ID: {[b.id for b in no_cover]})")
print(f"⚠️  Đường dẫn tương đối (a1/6.jpg, a2/9.jpg, ...): {len(relative_path)} sách")
print(f"✅ URL đầy đủ (http://...): {len(full_url)} sách")
print()

if relative_path:
    print("=" * 80)
    print("⚠️  CÁC SÁCH CÓ ĐƯỜNG DẪN TƯƠNG ĐỐI (CẦN CẬP NHẬT):")
    print("=" * 80)
    print()
    print("Những URL này (như 'a1/6.jpg', 'a2/9.jpg') không phải URL đầy đủ.")
    print("Chúng có thể không hoạt động trên Frontend.")
    print()
    print("Giải pháp:")
    print("1. Xóa cover_url cũ và thêm ảnh mới vào static/images/books/")
    print("2. Hoặc cập nhật thành URL đầy đủ: http://localhost:8000/static/images/books/book_X.jpg")
    print()
    for book in relative_path[:10]:
        print(f"   ID {book.id}: {book.title} -> {book.cover_url}")
    if len(relative_path) > 10:
        print(f"   ... và {len(relative_path) - 10} sách khác")

db.close()

