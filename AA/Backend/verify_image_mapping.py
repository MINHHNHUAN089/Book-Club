"""
Script để verify mapping ảnh - hiển thị chi tiết để bạn kiểm tra
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

def verify_mapping():
    """Verify và hiển thị mapping chi tiết"""
    db = SessionLocal()
    
    try:
        books = db.query(Book).order_by(Book.id).all()
        images_dir = Path(__file__).parent / "static" / "images" / "books"
        
        print("=" * 100)
        print("🔍 VERIFY MAPPING ẢNH SÁCH")
        print("=" * 100)
        print()
        print("📋 DANH SÁCH CHI TIẾT (ID 6 trở đi):")
        print("=" * 100)
        print()
        print(f"{'ID':<6} | {'Tên Sách':<50} | {'Ảnh trong DB':<30} | {'File tồn tại':<15}")
        print("-" * 100)
        
        for book in books:
            if book.id < 6:
                continue  # Bỏ qua 5 cuốn đầu
            
            title = book.title[:48] + ".." if len(book.title) > 50 else book.title
            
            if book.cover_url and book.cover_url.startswith("http://localhost"):
                img_name = book.cover_url.split("/")[-1]
                img_path = images_dir / img_name
                exists = "✅ Có" if img_path.exists() else "❌ Không"
                print(f"{book.id:<6} | {title:<50} | {img_name:<30} | {exists:<15}")
            else:
                print(f"{book.id:<6} | {title:<50} | {'(chưa có)':<30} | {'-':<15}")
        
        print()
        print("=" * 100)
        print("💡 HƯỚNG DẪN SỬA:")
        print("=" * 100)
        print()
        print("1. Mở thư mục: Backend\\static\\images\\books\\")
        print("2. Xem từng ảnh và xác định:")
        print("   - Ảnh nào thuộc sách ID 6?")
        print("   - Ảnh nào thuộc sách ID 7?")
        print("   - ...")
        print("3. Đổi tên file theo ID sách đúng:")
        print("   - Ảnh của sách ID 6 -> book_6.jpg")
        print("   - Ảnh của sách ID 7 -> book_7.png (hoặc .jpg)")
        print("   - ...")
        print("4. Chạy: python smart_remap_images.py")
        print()
        
        db.close()
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        db.close()

if __name__ == "__main__":
    verify_mapping()

