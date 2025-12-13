"""
Script để map sách theo thứ tự file ảnh
Sách sẽ được map với ảnh theo thứ tự: ảnh đầu tiên -> sách ID 1, ảnh thứ hai -> sách ID 2, ...
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

def map_by_image_order():
    """Map sách theo thứ tự file ảnh"""
    db = SessionLocal()
    
    try:
        books = db.query(Book).order_by(Book.id).all()
        images_dir = Path(__file__).parent / "static" / "images" / "books"
        
        # Lấy tất cả file ảnh và sắp xếp theo số ID (không phải alphabet)
        def get_book_id_from_filename(filename):
            """Lấy ID từ tên file book_X.jpg"""
            try:
                stem = filename.stem  # book_1, book_10, ...
                if stem.startswith("book_"):
                    id_str = stem.split("_")[1]
                    return int(id_str)
            except:
                return 999  # Đặt cuối nếu không parse được
            return 999
        
        image_files = sorted([f for f in images_dir.glob("book_*.*") 
                             if f.is_file() and f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}],
                            key=get_book_id_from_filename)
        
        print("=" * 100)
        print("🔄 MAP SÁCH THEO THỨ TỰ FILE ẢNH")
        print("=" * 100)
        print()
        print(f"📚 Tổng số sách: {len(books)}")
        print(f"🖼️  Tổng số ảnh: {len(image_files)}")
        print()
        
        # Hiển thị thứ tự ảnh
        print("=" * 100)
        print("📋 THỨ TỰ FILE ẢNH:")
        print("=" * 100)
        print()
        for i, img in enumerate(image_files, 1):
            print(f"{i:2d}. {img.name}")
        print()
        
        # Map: ảnh thứ i -> sách ID i
        print("=" * 100)
        print("🔄 MAPPING:")
        print("=" * 100)
        print()
        
        base_url = "http://localhost:8000"
        updated_count = 0
        
        # Map từng ảnh với sách theo thứ tự
        for i, img_file in enumerate(image_files):
            book_id = i + 1  # Ảnh đầu tiên -> sách ID 1, ảnh thứ 2 -> sách ID 2, ...
            
            if book_id <= len(books):
                book = books[book_id - 1]  # Index từ 0
                image_url = f"{base_url}/static/images/books/{img_file.name}"
                
                if book.cover_url != image_url:
                    book.cover_url = image_url
                    updated_count += 1
                    print(f"✅ ID {book_id:2d}: {book.title[:45]:<45} <- {img_file.name}")
                else:
                    print(f"ℹ️  ID {book_id:2d}: {book.title[:45]:<45} <- {img_file.name} (đã đúng)")
            else:
                print(f"⚠️  Ảnh {img_file.name} không có sách tương ứng (cần sách ID {book_id})")
        
        # Commit
        if updated_count > 0:
            db.commit()
            print()
            print("=" * 100)
            print(f"🎉 Đã cập nhật {updated_count} sách!")
            print("=" * 100)
        else:
            print()
            print("ℹ️  Tất cả đã được map đúng.")
        
        # Hiển thị sách chưa có ảnh
        books_without_images = []
        for i, book in enumerate(books):
            if i >= len(image_files):
                books_without_images.append(book)
        
        if books_without_images:
            print()
            print("=" * 100)
            print(f"⚠️  SÁCH CHƯA CÓ ẢNH ({len(books_without_images)} sách):")
            print("=" * 100)
            for book in books_without_images:
                print(f"   ID {book.id:2d}: {book.title}")
        
        db.close()
        
    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        db.close()

if __name__ == "__main__":
    map_by_image_order()

