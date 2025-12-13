"""
Script để sửa lại mapping ảnh với tên sách cho đúng
Hiển thị danh sách và cho phép map lại
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

def show_current_mapping():
    """Hiển thị mapping hiện tại"""
    db = SessionLocal()
    
    try:
        books = db.query(Book).order_by(Book.id).all()
        images_dir = Path(__file__).parent / "static" / "images" / "books"
        
        image_files = sorted([f for f in images_dir.glob("book_*.jpg") 
                             if f.is_file()], 
                            key=lambda x: int(x.stem.split('_')[1]) if x.stem.split('_')[1].isdigit() else 999)
        
        print("=" * 100)
        print("📋 MAPPING HIỆN TẠI: ẢNH VS TÊN SÁCH")
        print("=" * 100)
        print()
        print(f"{'ID':<6} | {'Tên Sách':<50} | {'Ảnh Hiện Tại':<30}")
        print("-" * 100)
        
        for book in books:
            title = book.title[:48] + ".." if len(book.title) > 50 else book.title
            
            if book.cover_url and book.cover_url.startswith("http://localhost"):
                # Lấy tên file từ URL
                img_name = book.cover_url.split("/")[-1]
                # Kiểm tra file có tồn tại không
                img_path = images_dir / img_name
                exists = "✅" if img_path.exists() else "❌"
                print(f"{book.id:<6} | {title:<50} | {exists} {img_name:<28}")
            else:
                print(f"{book.id:<6} | {title:<50} | ❌ (chưa có ảnh)")
        
        print()
        print("=" * 100)
        print("🖼️  DANH SÁCH ẢNH CÓ SẴN:")
        print("=" * 100)
        print()
        
        for i, img in enumerate(image_files, 1):
            print(f"{i:2d}. {img.name}")
        
        print()
        print("=" * 100)
        print("💡 ĐỂ SỬA LẠI MAPPING:")
        print("=" * 100)
        print()
        print("Cách 1: Đổi tên file ảnh theo ID sách đúng")
        print("   Ví dụ: Nếu ảnh 'book_1.jpg' đang map với sách ID 1 nhưng sai,")
        print("   hãy đổi tên file thành 'book_X.jpg' (X là ID sách đúng)")
        print()
        print("Cách 2: Chạy script tự động map lại (sẽ hỏi từng ảnh)")
        print()
        
        return books, image_files, images_dir, db
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        return None, None, None, None

def auto_remap_images():
    """Tự động map lại ảnh - hiển thị từng ảnh và hỏi map với sách nào"""
    result = show_current_mapping()
    if not result[0]:
        return
    
    books, image_files, images_dir, db = result
    
    print("=" * 100)
    print("🔄 TỰ ĐỘNG MAP LẠI ẢNH")
    print("=" * 100)
    print()
    print("Script sẽ hiển thị từng ảnh và bạn chọn sách tương ứng")
    print("(Nhấn Enter để bỏ qua ảnh đó)")
    print()
    
    base_url = "http://localhost:8000"
    mappings = {}  # {book_id: image_file}
    
    for img_file in image_files:
        # Lấy ID từ tên file
        try:
            current_id = int(img_file.stem.split('_')[1])
            current_book = next((b for b in books if b.id == current_id), None)
            
            if current_book:
                print(f"📸 Ảnh: {img_file.name}")
                print(f"   Đang map với: ID {current_id} - {current_book.title}")
                print()
                print("   Danh sách sách:")
                for book in books:
                    marker = "👉" if book.id == current_id else "  "
                    print(f"   {marker} ID {book.id:2d}: {book.title}")
                print()
                
                choice = input(f"   Nhập ID sách đúng (Enter để giữ nguyên, 'skip' để bỏ qua): ").strip()
                
                if choice.lower() == 'skip':
                    print(f"   ⏭️  Bỏ qua {img_file.name}")
                    print()
                    continue
                
                if not choice:
                    # Giữ nguyên
                    mappings[current_id] = img_file
                    print(f"   ✅ Giữ nguyên mapping")
                else:
                    try:
                        new_id = int(choice)
                        target_book = next((b for b in books if b.id == new_id), None)
                        if target_book:
                            mappings[new_id] = img_file
                            print(f"   ✅ Sẽ map với: ID {new_id} - {target_book.title}")
                        else:
                            print(f"   ❌ Không tìm thấy sách ID {new_id}")
                            mappings[current_id] = img_file  # Giữ nguyên
                    except ValueError:
                        print(f"   ❌ ID không hợp lệ, giữ nguyên")
                        mappings[current_id] = img_file
                
                print()
        except (ValueError, IndexError):
            print(f"⚠️  Không thể parse ID từ {img_file.name}, bỏ qua")
            print()
    
    # Áp dụng mapping
    print("=" * 100)
    print("🚀 ÁP DỤNG MAPPING MỚI...")
    print("=" * 100)
    print()
    
    updated_count = 0
    
    for book_id, img_file in mappings.items():
        book = next((b for b in books if b.id == book_id), None)
        if not book:
            continue
        
        # Đổi tên file nếu cần
        new_name = f"book_{book_id}{img_file.suffix}"
        new_file = images_dir / new_name
        
        if img_file.name != new_name:
            if new_file.exists() and new_file != img_file:
                print(f"⚠️  Bỏ qua ID {book_id}: {new_name} đã tồn tại")
                continue
            
            try:
                img_file.rename(new_file)
                print(f"✅ Đổi tên: {img_file.name} -> {new_name}")
            except Exception as e:
                print(f"❌ Lỗi khi đổi tên {img_file.name}: {e}")
                continue
        
        # Cập nhật cover_url
        image_url = f"{base_url}/static/images/books/{new_name}"
        if book.cover_url != image_url:
            book.cover_url = image_url
            updated_count += 1
            print(f"   ✅ Cập nhật: {book.title[:40]}")
    
    if updated_count > 0:
        db.commit()
        print()
        print(f"🎉 Đã cập nhật {updated_count} sách!")
    else:
        print()
        print("ℹ️  Không có gì cần cập nhật.")
    
    db.close()

def simple_remap():
    """Map đơn giản - chỉ cần xác nhận và đổi tên file"""
    result = show_current_mapping()
    if not result[0]:
        return
    
    books, image_files, images_dir, db = result
    
    print("=" * 100)
    print("📝 HƯỚNG DẪN SỬA MAPPING ĐƠN GIẢN")
    print("=" * 100)
    print()
    print("Bạn cần đổi tên file ảnh để map đúng với sách:")
    print()
    print("Ví dụ:")
    print("  - Nếu ảnh 'book_1.jpg' đang hiển thị cho sách 'Dune' nhưng thực ra là ảnh của '1984'")
    print("  - Và ảnh 'book_2.jpg' đang hiển thị cho sách '1984' nhưng thực ra là ảnh của 'Dune'")
    print("  -> Đổi tên: book_1.jpg -> temp_1.jpg, book_2.jpg -> book_1.jpg, temp_1.jpg -> book_2.jpg")
    print()
    print("Hoặc đơn giản hơn:")
    print("  1. Xem ảnh hiện tại map với sách nào")
    print("  2. Đổi tên file để map với sách đúng")
    print("  3. Chạy lại: python fix_book_images.py")
    print()
    
    # Hiển thị mapping hiện tại chi tiết hơn
    print("=" * 100)
    print("📋 MAPPING CHI TIẾT:")
    print("=" * 100)
    print()
    
    for book in books:
        if book.cover_url and book.cover_url.startswith("http://localhost"):
            img_name = book.cover_url.split("/")[-1]
            img_path = images_dir / img_name
            if img_path.exists():
                print(f"ID {book.id:2d}: {book.title[:45]:<45} <- {img_name}")
    
    print()
    print("💡 Để sửa:")
    print("  1. Xem ảnh trong thư mục: Backend\\static\\images\\books\\")
    print("  2. Xác định ảnh nào thuộc sách nào")
    print("  3. Đổi tên file theo ID sách đúng")
    print("  4. Chạy: python fix_book_images.py")
    
    db.close()

if __name__ == "__main__":
    print("Chọn chế độ:")
    print("1. Xem mapping hiện tại (đơn giản)")
    print("2. Tự động map lại (interactive)")
    print()
    choice = input("Nhập lựa chọn (1 hoặc 2, mặc định 1): ").strip()
    
    if choice == "2":
        auto_remap_images()
    else:
        simple_remap()

