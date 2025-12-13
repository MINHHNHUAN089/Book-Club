"""
Script để swap/đổi mapping ảnh sách
Nếu cuốn 25 cần ảnh 26 và cuốn 26 cần ảnh 8, script này sẽ sửa lại
"""
import sys
import io
from pathlib import Path
import shutil

# Fix encoding
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Book

def swap_images():
    """Swap mapping ảnh sách"""
    db = SessionLocal()
    
    try:
        images_dir = Path(__file__).parent / "static" / "images" / "books"
        base_url = "http://localhost:8000"
        
        print("=" * 100)
        print("🔄 SWAP MAPPING ẢNH SÁCH")
        print("=" * 100)
        print()
        print("Theo yêu cầu:")
        print("  - Cuốn 25 (Làng) cần ảnh 26")
        print("  - Cuốn 26 (Nhà Giả Kim) cần ảnh 8")
        print()
        
        # Lấy sách
        book_25 = db.query(Book).filter(Book.id == 25).first()
        book_26 = db.query(Book).filter(Book.id == 26).first()
        book_8 = db.query(Book).filter(Book.id == 8).first()
        
        if not book_25 or not book_26 or not book_8:
            print("❌ Không tìm thấy sách!")
            return
        
        print("📚 Thông tin hiện tại:")
        print(f"   ID 25 ({book_25.title}): {book_25.cover_url}")
        print(f"   ID 26 ({book_26.title}): {book_26.cover_url}")
        print(f"   ID 8  ({book_8.title}): {book_8.cover_url}")
        print()
        
        # Kiểm tra file ảnh
        img_25 = images_dir / "book_25.jpg"
        img_26 = images_dir / "book_26.jpg"
        img_8 = images_dir / "book_8.jpg"
        
        print("🖼️  File ảnh:")
        print(f"   book_25.jpg: {'✅' if img_25.exists() else '❌'}")
        print(f"   book_26.jpg: {'✅' if img_26.exists() else '❌'}")
        print(f"   book_8.jpg: {'✅' if img_8.exists() else '❌'}")
        print()
        
        # Swap mapping
        # Cuốn 25 -> ảnh 26
        book_25.cover_url = f"{base_url}/static/images/books/book_26.jpg"
        
        # Cuốn 26 -> ảnh 8
        book_26.cover_url = f"{base_url}/static/images/books/book_8.jpg"
        
        # Cuốn 8 -> ảnh 25 (để tránh mất ảnh)
        book_8.cover_url = f"{base_url}/static/images/books/book_25.jpg"
        
        db.commit()
        
        print("=" * 100)
        print("✅ ĐÃ CẬP NHẬT MAPPING:")
        print("=" * 100)
        print(f"   ID 25 ({book_25.title}): book_26.jpg")
        print(f"   ID 26 ({book_26.title}): book_8.jpg")
        print(f"   ID 8  ({book_8.title}): book_25.jpg")
        print()
        print("💡 Lưu ý: File ảnh không bị đổi tên, chỉ đổi mapping trong database.")
        print("   Nếu muốn đổi tên file, hãy đổi tay hoặc dùng script khác.")
        
        db.close()
        
    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        db.close()

if __name__ == "__main__":
    swap_images()
