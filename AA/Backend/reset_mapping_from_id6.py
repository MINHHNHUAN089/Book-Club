"""
Script để reset cover_url từ ID 6 trở đi
Giúp bạn map lại ảnh từ đầu
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

def reset_from_id6():
    """Reset cover_url từ ID 6 trở đi"""
    db = SessionLocal()
    
    try:
        books = db.query(Book).filter(Book.id >= 6).order_by(Book.id).all()
        
        print("=" * 80)
        print("🔄 RESET COVER_URL TỪ ID 6 TRỞ ĐI")
        print("=" * 80)
        print()
        
        reset_count = 0
        
        for book in books:
            if book.cover_url:
                print(f"🔄 Reset: ID {book.id:2d} - {book.title[:45]}")
                print(f"   URL cũ: {book.cover_url}")
                book.cover_url = None
                reset_count += 1
        
        if reset_count > 0:
            db.commit()
            print()
            print(f"✅ Đã reset {reset_count} sách (từ ID 6 trở đi)")
            print()
            print("💡 Bây giờ bạn có thể:")
            print("   1. Xem ảnh trong: Backend\\static\\images\\books\\")
            print("   2. Đổi tên file ảnh theo ID sách đúng")
            print("   3. Chạy: python smart_remap_images.py")
        else:
            print("ℹ️  Không có URL nào cần reset")
        
        db.close()
        
    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        db.close()

if __name__ == "__main__":
    reset_from_id6()

