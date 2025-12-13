"""
Script để kiểm tra mapping hiện tại: sách ID X -> ảnh nào
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
    """Kiểm tra mapping hiện tại"""
    db = SessionLocal()
    
    try:
        books = db.query(Book).filter(Book.id.in_([25, 26, 8])).order_by(Book.id).all()
        images_dir = Path(__file__).parent / "static" / "images" / "books"
        
        print("=" * 100)
        print("🔍 KIỂM TRA MAPPING CHO SÁCH ID 25, 26, 8")
        print("=" * 100)
        print()
        
        for book in books:
            print(f"📚 ID {book.id}: {book.title}")
            print(f"   URL trong DB: {book.cover_url}")
            
            if book.cover_url:
                img_name = book.cover_url.split("/")[-1]
                img_file = images_dir / img_name
                exists = "✅ TỒN TẠI" if img_file.exists() else "❌ KHÔNG TỒN TẠI"
                print(f"   File ảnh: {img_name} ({exists})")
            else:
                print(f"   File ảnh: (chưa có)")
            
            # Kiểm tra ảnh mong đợi
            expected_jpg = images_dir / f"book_{book.id}.jpg"
            expected_png = images_dir / f"book_{book.id}.png"
            
            if expected_png.exists():
                print(f"   Ảnh mong đợi: book_{book.id}.png ✅")
            elif expected_jpg.exists():
                print(f"   Ảnh mong đợi: book_{book.id}.jpg ✅")
            else:
                print(f"   Ảnh mong đợi: book_{book.id}.jpg/png ❌ KHÔNG TỒN TẠI")
            
            print()
        
        # Kiểm tra tất cả file ảnh
        print("=" * 100)
        print("📁 TẤT CẢ FILE ẢNH TRONG THƯ MỤC:")
        print("=" * 100)
        print()
        
        def get_id_from_name(name):
            try:
                stem = name.stem
                if stem.startswith("book_"):
                    return int(stem.split("_")[1])
            except:
                return 999
            return 999
        
        image_files = sorted([f for f in images_dir.glob("book_*.*") 
                             if f.is_file() and f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}],
                            key=get_id_from_name)
        
        for img in image_files:
            print(f"   {img.name}")
        
        db.close()
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        db.close()

if __name__ == "__main__":
    verify_mapping()

