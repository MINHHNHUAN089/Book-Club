"""
Script để map chính xác: book_X.jpg -> sách ID X
Đảm bảo mỗi sách map với ảnh có cùng ID
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

def fix_exact_mapping():
    """Map chính xác: book_X.jpg -> sách ID X"""
    db = SessionLocal()
    
    try:
        books = db.query(Book).order_by(Book.id).all()
        images_dir = Path(__file__).parent / "static" / "images" / "books"
        
        print("=" * 100)
        print("🔧 SỬA MAPPING CHÍNH XÁC: book_X.jpg -> Sách ID X")
        print("=" * 100)
        print()
        
        base_url = "http://localhost:8000"
        updated_count = 0
        
        print(f"{'ID':<6} | {'Tên Sách':<50} | {'Ảnh Cũ':<30} | {'Ảnh Mới':<30}")
        print("-" * 100)
        
        for book in books:
            # Ảnh mong đợi: book_{ID}.jpg hoặc book_{ID}.png
            expected_jpg = images_dir / f"book_{book.id}.jpg"
            expected_png = images_dir / f"book_{book.id}.png"
            
            # Chọn file tồn tại
            expected_file = None
            expected_name = None
            
            if expected_png.exists():
                expected_file = expected_png
                expected_name = f"book_{book.id}.png"
            elif expected_jpg.exists():
                expected_file = expected_jpg
                expected_name = f"book_{book.id}.jpg"
            
            # Lấy ảnh cũ
            old_url = book.cover_url or "(chưa có)"
            old_name = old_url.split("/")[-1] if old_url.startswith("http://localhost") else old_url
            
            # Cập nhật
            if expected_file and expected_file.exists():
                new_url = f"{base_url}/static/images/books/{expected_name}"
                
                if book.cover_url != new_url:
                    book.cover_url = new_url
                    updated_count += 1
                    status = "✅"
                else:
                    status = "ℹ️ "
                
                title = book.title[:48] + ".." if len(book.title) > 50 else book.title
                print(f"{status} ID {book.id:<4} | {title:<50} | {old_name[:28]:<30} | {expected_name:<30}")
            else:
                print(f"❌ ID {book.id:<4} | {book.title[:48]:<50} | {old_name[:28]:<30} | (không tìm thấy)")
        
        # Commit
        if updated_count > 0:
            db.commit()
            print()
            print("=" * 100)
            print(f"🎉 Đã cập nhật {updated_count} sách!")
            print("=" * 100)
            print()
            print("💡 Mapping hiện tại:")
            print("   book_1.jpg -> Sách ID 1")
            print("   book_2.jpg -> Sách ID 2")
            print("   ...")
            print("   book_40.jpg -> Sách ID 40")
        else:
            print()
            print("ℹ️  Tất cả mapping đã đúng!")
        
        db.close()
        
    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        db.close()

if __name__ == "__main__":
    fix_exact_mapping()

