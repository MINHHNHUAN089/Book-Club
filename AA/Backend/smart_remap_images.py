"""
Script thông minh để remap ảnh - xử lý trường hợp file đích đã tồn tại
Tự động swap ảnh khi cần
"""
import sys
import io
import shutil
from pathlib import Path

# Fix encoding
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Book

def smart_remap():
    """Remap ảnh thông minh - xử lý swap khi cần"""
    db = SessionLocal()
    
    try:
        books = db.query(Book).order_by(Book.id).all()
        images_dir = Path(__file__).parent / "static" / "images" / "books"
        images_dir.mkdir(parents=True, exist_ok=True)
        
        # Lấy tất cả ảnh
        all_images = [f for f in images_dir.glob("*") 
                     if f.is_file() and f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}]
        
        # Tách ảnh đã đúng tên và ảnh cần đổi
        correct_images = {}  # {book_id: image_file}
        need_rename = []  # [(current_file, target_book_id)]
        
        for img in all_images:
            # Kiểm tra nếu tên file có pattern book_{id}
            if img.name.startswith("book_") and img.stem.split("_")[1].isdigit():
                book_id = int(img.stem.split("_")[1])
                correct_images[book_id] = img
        
        print("=" * 80)
        print("🔄 SMART REMAP ẢNH SÁCH")
        print("=" * 80)
        print()
        print(f"📚 Tổng số sách: {len(books)}")
        print(f"🖼️  Tổng số ảnh: {len(all_images)}")
        print(f"✅ Ảnh đã đúng tên: {len(correct_images)}")
        print()
        
        # Tìm ảnh chưa được map
        unmapped_images = [img for img in all_images 
                          if not (img.name.startswith("book_") and img.stem.split("_")[1].isdigit())]
        
        if unmapped_images:
            print(f"⚠️  Ảnh chưa được map: {len(unmapped_images)}")
            for img in unmapped_images:
                print(f"   - {img.name}")
            print()
        
        # Hiển thị mapping hiện tại
        print("=" * 80)
        print("📋 MAPPING HIỆN TẠI:")
        print("=" * 80)
        print()
        print(f"{'ID':<6} | {'Tên Sách':<45} | {'Ảnh':<25}")
        print("-" * 80)
        
        base_url = "http://localhost:8000"
        updated_count = 0
        
        for book in books:
            title = book.title[:43] + ".." if len(book.title) > 45 else book.title
            
            # Kiểm tra ảnh hiện tại trong database
            current_img_name = None
            if book.cover_url and book.cover_url.startswith("http://localhost"):
                current_img_name = book.cover_url.split("/")[-1]
            
            # Kiểm tra ảnh đúng tên có tồn tại không
            correct_img = correct_images.get(book.id)
            
            if correct_img:
                img_name = correct_img.name
                status = "✅"
            elif current_img_name:
                img_name = current_img_name
                status = "⚠️ "
            else:
                img_name = "(chưa có)"
                status = "❌"
            
            print(f"{book.id:<6} | {title:<45} | {status} {img_name:<23}")
            
            # Cập nhật cover_url nếu cần
            if correct_img:
                expected_url = f"{base_url}/static/images/books/{correct_img.name}"
                if book.cover_url != expected_url:
                    book.cover_url = expected_url
                    updated_count += 1
        
        # Commit
        if updated_count > 0:
            db.commit()
            print()
            print("=" * 80)
            print(f"✅ Đã cập nhật {updated_count} sách!")
            print("=" * 80)
        else:
            print()
            print("ℹ️  Tất cả mapping đã đúng, không cần cập nhật.")
        
        # Hiển thị sách chưa có ảnh
        books_without_images = [b for b in books if b.id not in correct_images]
        if books_without_images:
            print()
            print("=" * 80)
            print(f"⚠️  SÁCH CHƯA CÓ ẢNH ({len(books_without_images)} sách):")
            print("=" * 80)
            for book in books_without_images:
                print(f"   ID {book.id:2d}: {book.title}")
            print()
            if unmapped_images:
                print("💡 Bạn có thể:")
                print(f"   1. Đổi tên {len(unmapped_images)} ảnh chưa map thành book_{{ID}}.jpg")
                print("   2. Chạy lại script này")
        
        db.close()
        
    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        db.close()

if __name__ == "__main__":
    smart_remap()

