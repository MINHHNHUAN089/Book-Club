"""
Script để hiển thị mapping ảnh với sách và tạo file hướng dẫn sửa
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

def show_mapping():
    """Hiển thị mapping và tạo file hướng dẫn"""
    db = SessionLocal()
    
    try:
        books = db.query(Book).order_by(Book.id).all()
        images_dir = Path(__file__).parent / "static" / "images" / "books"
        
        image_files = sorted([f for f in images_dir.glob("book_*.jpg") 
                             if f.is_file()], 
                            key=lambda x: int(x.stem.split('_')[1]) if x.stem.split('_')[1].isdigit() else 999)
        
        # Thêm .png và .jpeg
        image_files.extend([f for f in images_dir.glob("book_*.png") if f.is_file()])
        image_files.extend([f for f in images_dir.glob("book_*.jpeg") if f.is_file()])
        image_files = sorted(image_files, key=lambda x: int(x.stem.split('_')[1]) if x.stem.split('_')[1].isdigit() else 999)
        
        print("=" * 100)
        print("📋 MAPPING HIỆN TẠI: ẢNH VS TÊN SÁCH")
        print("=" * 100)
        print()
        print(f"{'ID':<6} | {'Tên Sách':<50} | {'Ảnh Hiện Tại':<30}")
        print("-" * 100)
        
        mapping_data = []
        
        for book in books:
            title = book.title[:48] + ".." if len(book.title) > 50 else book.title
            
            if book.cover_url and book.cover_url.startswith("http://localhost"):
                img_name = book.cover_url.split("/")[-1]
                img_path = images_dir / img_name
                exists = "✅" if img_path.exists() else "❌"
                status = f"{exists} {img_name}"
                print(f"{book.id:<6} | {title:<50} | {status:<30}")
                mapping_data.append({
                    "book_id": book.id,
                    "title": book.title,
                    "current_image": img_name,
                    "image_exists": img_path.exists()
                })
            else:
                print(f"{book.id:<6} | {title:<50} | ❌ (chưa có ảnh)")
                mapping_data.append({
                    "book_id": book.id,
                    "title": book.title,
                    "current_image": None,
                    "image_exists": False
                })
        
        print()
        print("=" * 100)
        print("🖼️  DANH SÁCH ẢNH CÓ SẴN:")
        print("=" * 100)
        print()
        
        for i, img in enumerate(image_files, 1):
            print(f"{i:2d}. {img.name}")
        
        # Tạo file mapping để sửa
        mapping_file = Path(__file__).parent / "image_mapping.txt"
        with open(mapping_file, "w", encoding="utf-8") as f:
            f.write("=" * 100 + "\n")
            f.write("MAPPING ẢNH VS SÁCH - FILE ĐỂ SỬA\n")
            f.write("=" * 100 + "\n\n")
            f.write("Hướng dẫn:\n")
            f.write("1. Xem mapping hiện tại bên dưới\n")
            f.write("2. Xác định ảnh nào thuộc sách nào\n")
            f.write("3. Đổi tên file ảnh theo ID sách đúng\n")
            f.write("4. Chạy: python fix_book_images.py\n\n")
            f.write("=" * 100 + "\n")
            f.write("MAPPING HIỆN TẠI:\n")
            f.write("=" * 100 + "\n\n")
            
            for item in mapping_data:
                f.write(f"ID {item['book_id']:2d}: {item['title']}\n")
                if item['current_image']:
                    f.write(f"   Ảnh hiện tại: {item['current_image']}\n")
                else:
                    f.write(f"   Ảnh hiện tại: (chưa có)\n")
                f.write(f"   -> Cần đổi tên thành: book_{item['book_id']}.jpg (hoặc .png)\n")
                f.write("\n")
            
            f.write("\n" + "=" * 100 + "\n")
            f.write("DANH SÁCH ẢNH CÓ SẴN:\n")
            f.write("=" * 100 + "\n\n")
            for i, img in enumerate(image_files, 1):
                f.write(f"{i:2d}. {img.name}\n")
        
        print()
        print("=" * 100)
        print("💾 ĐÃ TẠO FILE HƯỚNG DẪN:")
        print("=" * 100)
        print(f"   {mapping_file}")
        print()
        print("💡 ĐỂ SỬA MAPPING:")
        print("=" * 100)
        print()
        print("Cách 1: Đổi tên file thủ công")
        print("   1. Mở thư mục: Backend\\static\\images\\books\\")
        print("   2. Xem từng ảnh và xác định ảnh nào thuộc sách nào")
        print("   3. Đổi tên file theo ID sách đúng:")
        print("      - Ảnh của sách ID 1 -> book_1.jpg")
        print("      - Ảnh của sách ID 2 -> book_2.jpg")
        print("      - ...")
        print("   4. Chạy: python fix_book_images.py")
        print()
        print("Cách 2: Swap ảnh giữa các sách")
        print("   Nếu ảnh book_1.jpg thuộc sách ID 2 và book_2.jpg thuộc sách ID 1:")
        print("   1. Đổi tên: book_1.jpg -> temp_1.jpg")
        print("   2. Đổi tên: book_2.jpg -> book_1.jpg")
        print("   3. Đổi tên: temp_1.jpg -> book_2.jpg")
        print("   4. Chạy: python fix_book_images.py")
        print()
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    show_mapping()

