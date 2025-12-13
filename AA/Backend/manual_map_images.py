"""
Script để map thủ công ảnh với sách (nếu tự động không khớp)
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

def manual_map():
    """Hiển thị danh sách ảnh và sách để map thủ công"""
    db = SessionLocal()
    
    try:
        books = db.query(Book).order_by(Book.id).all()
        images_dir = Path(__file__).parent / "static" / "images" / "books"
        
        image_files = [f for f in images_dir.glob("*") 
                      if f.is_file() and f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}]
        
        print("=" * 80)
        print("📋 DANH SÁCH ẢNH VÀ SÁCH ĐỂ MAP THỦ CÔNG")
        print("=" * 80)
        print()
        
        print("🖼️  DANH SÁCH ẢNH:")
        print("-" * 80)
        for i, img in enumerate(image_files, 1):
            print(f"{i:2d}. {img.name}")
        print()
        
        print("📚 DANH SÁCH SÁCH:")
        print("-" * 80)
        for book in books:
            has_cover = "✅" if book.cover_url and book.cover_url.startswith("http://localhost") else "❌"
            print(f"ID {book.id:2d} {has_cover} | {book.title}")
        print()
        
        print("=" * 80)
        print("💡 HƯỚNG DẪN:")
        print("=" * 80)
        print()
        print("Nếu muốn map thủ công, đổi tên file ảnh theo pattern:")
        print("   book_{ID}.jpg")
        print()
        print("Ví dụ:")
        print("   - Ảnh 'abc.jpg' muốn map với sách ID 10 -> Đổi thành 'book_10.jpg'")
        print("   - Ảnh 'xyz.png' muốn map với sách ID 25 -> Đổi thành 'book_25.png'")
        print()
        print("Sau đó chạy lại: python fix_book_images.py")
        print()
        
    finally:
        db.close()

if __name__ == "__main__":
    manual_map()

