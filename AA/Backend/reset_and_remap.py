"""
Script để reset cover_url và map lại ảnh từ đầu
Sử dụng khi ảnh bị sai mapping
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

def reset_cover_urls():
    """Reset tất cả cover_url về null (trừ những URL hợp lệ từ static)"""
    db = SessionLocal()
    
    try:
        books = db.query(Book).all()
        
        print("=" * 80)
        print("🔄 RESET COVER_URL")
        print("=" * 80)
        print()
        
        reset_count = 0
        
        for book in books:
            # Chỉ reset những URL không hợp lệ (không phải từ static/images/books/)
            if book.cover_url and not book.cover_url.startswith("http://localhost:8000/static/images/books/"):
                print(f"🔄 Reset: ID {book.id} - {book.title[:40]}")
                print(f"   URL cũ: {book.cover_url}")
                book.cover_url = None
                reset_count += 1
        
        if reset_count > 0:
            db.commit()
            print()
            print(f"✅ Đã reset {reset_count} sách")
            print()
            print("💡 Bây giờ bạn có thể:")
            print("   1. Xem ảnh trong: Backend\\static\\images\\books\\")
            print("   2. Đổi tên file ảnh theo ID sách đúng")
            print("   3. Chạy: python fix_book_images.py")
        else:
            print("ℹ️  Không có URL nào cần reset")
            print("   (Tất cả URL đều hợp lệ hoặc đã là null)")
        
        db.close()
        
    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        db.close()

def show_instructions():
    """Hiển thị hướng dẫn chi tiết"""
    db = SessionLocal()
    
    try:
        books = db.query(Book).order_by(Book.id).all()
        images_dir = Path(__file__).parent / "static" / "images" / "books"
        
        image_files = sorted([f for f in images_dir.glob("book_*.*") 
                             if f.is_file() and f.suffix.lower() in {".jpg", ".jpeg", ".png"}],
                            key=lambda x: int(x.stem.split('_')[1]) if x.stem.split('_')[1].isdigit() else 999)
        
        print("=" * 100)
        print("📖 HƯỚNG DẪN SỬA MAPPING ẢNH SÁCH")
        print("=" * 100)
        print()
        print("BƯỚC 1: Xem danh sách sách và ảnh")
        print("-" * 100)
        print()
        print("Danh sách sách:")
        for book in books:
            print(f"   ID {book.id:2d}: {book.title}")
        print()
        print(f"Danh sách ảnh ({len(image_files)} ảnh):")
        for img in image_files:
            print(f"   - {img.name}")
        print()
        
        print("BƯỚC 2: Xác định ảnh nào thuộc sách nào")
        print("-" * 100)
        print()
        print("1. Mở thư mục: Backend\\static\\images\\books\\")
        print("2. Xem từng ảnh và ghi chú:")
        print("   - Ảnh 'book_1.jpg' thực ra là ảnh của sách nào?")
        print("   - Ảnh 'book_2.jpg' thực ra là ảnh của sách nào?")
        print("   - ...")
        print()
        
        print("BƯỚC 3: Đổi tên file ảnh")
        print("-" * 100)
        print()
        print("Ví dụ:")
        print("  - Nếu ảnh 'book_1.jpg' là ảnh của sách ID 5 (Sapiens)")
        print("    -> Đổi tên: book_1.jpg -> book_5.jpg")
        print()
        print("  - Nếu ảnh 'book_2.jpg' là ảnh của sách ID 1 (Dune)")
        print("    -> Đổi tên: book_2.jpg -> book_1.jpg")
        print()
        print("Lưu ý: Nếu file đích đã tồn tại, đổi tên tạm:")
        print("  - book_1.jpg -> temp_1.jpg")
        print("  - book_5.jpg -> book_1.jpg")
        print("  - temp_1.jpg -> book_5.jpg")
        print()
        
        print("BƯỚC 4: Chạy script cập nhật")
        print("-" * 100)
        print()
        print("Sau khi đổi tên xong, chạy:")
        print("  python fix_book_images.py")
        print()
        print("Script sẽ tự động cập nhật cover_url cho tất cả sách!")
        print()
        
        # Tạo file mapping template
        mapping_file = Path(__file__).parent / "mapping_template.txt"
        with open(mapping_file, "w", encoding="utf-8") as f:
            f.write("=" * 100 + "\n")
            f.write("TEMPLATE ĐỂ GHI CHÚ MAPPING ẢNH\n")
            f.write("=" * 100 + "\n\n")
            f.write("Hướng dẫn: Ghi chú ảnh nào thuộc sách nào, sau đó đổi tên file\n\n")
            f.write("=" * 100 + "\n")
            f.write("DANH SÁCH SÁCH:\n")
            f.write("=" * 100 + "\n\n")
            for book in books:
                f.write(f"ID {book.id:2d}: {book.title}\n")
            f.write("\n" + "=" * 100 + "\n")
            f.write("DANH SÁCH ẢNH:\n")
            f.write("=" * 100 + "\n\n")
            for img in image_files:
                f.write(f"{img.name} -> Thuộc sách ID: ____ (ghi ID vào đây)\n")
        
        print(f"💾 Đã tạo file template: {mapping_file}")
        print("   Bạn có thể mở file này để ghi chú mapping!")
        print()
        
        db.close()
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        db.close()

if __name__ == "__main__":
    print("Chọn hành động:")
    print("1. Xem hướng dẫn chi tiết (khuyên dùng)")
    print("2. Reset tất cả cover_url (xóa mapping cũ)")
    print()
    
    # Tự động chọn option 1
    choice = "1"
    
    if choice == "2":
        confirm = input("⚠️  Bạn có chắc muốn reset tất cả cover_url? (yes/no): ").strip().lower()
        if confirm == "yes":
            reset_cover_urls()
        else:
            print("Đã hủy.")
    else:
        show_instructions()

