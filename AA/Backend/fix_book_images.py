"""
Script để sửa tên file ảnh và cập nhật cover_url cho sách
Tự động đổi tên file ảnh theo ID sách hoặc tên sách
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

def normalize_title(title: str) -> str:
    """Chuẩn hóa tên sách để so sánh"""
    # Chuyển thành chữ thường, thay khoảng trắng và ký tự đặc biệt bằng _
    title = title.lower()
    title = "".join(c if c.isalnum() or c in "._-" else "_" for c in title)
    # Loại bỏ _ liên tiếp
    while "__" in title:
        title = title.replace("__", "_")
    return title.strip("_")

def find_matching_book(image_name: str, books: list) -> tuple:
    """
    Tìm sách phù hợp với tên file ảnh
    Trả về (book, confidence) - confidence từ 0-1
    """
    image_name_lower = image_name.lower()
    image_stem = Path(image_name).stem.lower()
    
    best_match = None
    best_confidence = 0
    
    # Kiểm tra nếu tên file chỉ là số (ví dụ: "1.jpg", "10.jpg")
    try:
        if image_stem.isdigit():
            book_id = int(image_stem)
            book = next((b for b in books if b.id == book_id), None)
            if book:
                return (book, 0.95)  # Rất chắc chắn nếu tên file là số thuần
    except:
        pass
    
    for book in books:
        confidence = 0
        
        # Kiểm tra theo ID - các pattern
        if f"book_{book.id}" in image_stem:
            confidence = 0.95
        elif image_stem == str(book.id) or image_stem.startswith(f"{book.id}_") or image_stem.endswith(f"_{book.id}"):
            confidence = 0.9
        elif f"_{book.id}_" in image_stem:
            confidence = 0.85
        elif str(book.id) in image_stem:
            confidence = 0.7
        
        # Kiểm tra theo tên sách
        book_title_normalized = normalize_title(book.title)
        
        # Tên sách chính xác
        if book_title_normalized in image_stem or image_stem in book_title_normalized:
            confidence = max(confidence, 0.8)
        
        # Một phần tên sách
        words = book_title_normalized.split("_")
        matching_words = sum(1 for word in words if word in image_stem and len(word) > 3)
        if matching_words > 0:
            confidence = max(confidence, 0.5 + (matching_words / len(words)) * 0.3)
        
        # Từ khóa quan trọng
        keywords = {
            "dune": ["dune"],
            "1984": ["1984", "nineteen"],
            "pride": ["pride", "prejudice"],
            "hobbit": ["hobbit"],
            "sapiens": ["sapiens"],
            "harry": ["harry", "potter"],
            "lord": ["lord", "rings"],
            "atomic": ["atomic", "habits"],
            "art": ["art", "war"],
            "prince": ["prince"],
        }
        
        for key, terms in keywords.items():
            if any(term in image_stem for term in terms):
                if key in normalize_title(book.title):
                    confidence = max(confidence, 0.6)
        
        if confidence > best_confidence:
            best_confidence = confidence
            best_match = book
    
    return (best_match, best_confidence)

def fix_book_images():
    """Sửa tên file ảnh và cập nhật cover_url"""
    db = SessionLocal()
    
    try:
        # Lấy tất cả sách
        books = db.query(Book).order_by(Book.id).all()
        
        # Thư mục chứa ảnh
        images_dir = Path(__file__).parent / "static" / "images" / "books"
        images_dir.mkdir(parents=True, exist_ok=True)
        
        # Lấy danh sách ảnh
        image_files = list(images_dir.glob("*"))
        image_files = [f for f in image_files if f.is_file() and f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}]
        
        if not image_files:
            print("❌ Không tìm thấy ảnh nào trong thư mục!")
            print(f"📁 Thư mục: {images_dir}")
            return
        
        print("=" * 80)
        print(f"🔍 TÌM THẤY {len(image_files)} ẢNH VÀ {len(books)} SÁCH")
        print("=" * 80)
        print()
        
        # Mapping: book_id -> (old_filename, new_filename, confidence)
        mappings = {}
        unmatched_images = []
        
        print("🔍 Đang phân tích và ghép ảnh với sách...")
        print()
        
        for img_file in image_files:
            book, confidence = find_matching_book(img_file.name, books)
            
            if book and confidence >= 0.5:
                new_name = f"book_{book.id}{img_file.suffix}"
                mappings[book.id] = {
                    "book": book,
                    "old_file": img_file,
                    "new_name": new_name,
                    "confidence": confidence
                }
            else:
                unmatched_images.append(img_file)
        
        # Hiển thị kết quả mapping
        print("=" * 80)
        print("📋 KẾT QUẢ PHÂN TÍCH:")
        print("=" * 80)
        print()
        
        if mappings:
            print(f"✅ Tìm thấy {len(mappings)} ảnh phù hợp:")
            print()
            for book_id, mapping in sorted(mappings.items()):
                book = mapping["book"]
                old_name = mapping["old_file"].name
                new_name = mapping["new_name"]
                conf = mapping["confidence"]
                conf_str = "🟢" if conf >= 0.8 else "🟡" if conf >= 0.6 else "🟠"
                
                print(f"   {conf_str} ID {book.id:2d}: {book.title[:40]:<40}")
                print(f"      {old_name:<50} -> {new_name}")
                print()
        
        if unmatched_images:
            print(f"⚠️  {len(unmatched_images)} ảnh không khớp với sách nào:")
            for img in unmatched_images:
                print(f"      - {img.name}")
            print()
        
        # Xác nhận trước khi đổi tên
        if not mappings:
            print("❌ Không tìm thấy ảnh nào phù hợp để đổi tên!")
            print()
            print("💡 Gợi ý:")
            print("   - Đặt tên file có chứa ID sách: book_1.jpg, book_2.jpg, ...")
            print("   - Hoặc đặt tên theo tên sách: dune.jpg, harry_potter.jpg, ...")
            return
        
        print("=" * 80)
        print("🚀 BẮT ĐẦU ĐỔI TÊN VÀ CẬP NHẬT...")
        print("=" * 80)
        print()
        
        base_url = "http://localhost:8000"
        renamed_count = 0
        updated_count = 0
        
        for book_id, mapping in sorted(mappings.items()):
            book = mapping["book"]
            old_file = mapping["old_file"]
            new_name = mapping["new_name"]
            new_file = images_dir / new_name
            
            # Đổi tên file
            if old_file.name != new_name:
                # Nếu file mới đã tồn tại, bỏ qua
                if new_file.exists() and new_file != old_file:
                    print(f"⚠️  Bỏ qua ID {book.id}: {new_name} đã tồn tại")
                    continue
                
                try:
                    old_file.rename(new_file)
                    renamed_count += 1
                    print(f"✅ Đổi tên: {old_file.name} -> {new_name}")
                except Exception as e:
                    print(f"❌ Lỗi khi đổi tên {old_file.name}: {e}")
                    continue
            else:
                print(f"ℹ️  Giữ nguyên: {old_file.name} (đã đúng tên)")
            
            # Cập nhật cover_url
            image_url = f"{base_url}/static/images/books/{new_name}"
            if book.cover_url != image_url:
                book.cover_url = image_url
                updated_count += 1
                print(f"   ✅ Cập nhật cover_url cho: {book.title[:40]}")
        
        # Commit changes
        if updated_count > 0:
            db.commit()
            print()
            print("=" * 80)
            print(f"🎉 HOÀN THÀNH!")
            print("=" * 80)
            print(f"   ✅ Đã đổi tên: {renamed_count} file")
            print(f"   ✅ Đã cập nhật: {updated_count} sách")
            print()
            print("💡 Refresh Frontend để xem ảnh mới!")
        else:
            print()
            print("ℹ️  Không có gì cần cập nhật.")
        
        if unmatched_images:
            print()
            print("=" * 80)
            print("⚠️  CÁC ẢNH CHƯA ĐƯỢC GHÉP:")
            print("=" * 80)
            print()
            print("Danh sách sách còn thiếu ảnh:")
            books_without_images = [b for b in books if b.id not in mappings]
            for book in books_without_images[:10]:
                print(f"   ID {book.id}: {book.title}")
            if len(books_without_images) > 10:
                print(f"   ... và {len(books_without_images) - 10} sách khác")
            print()
            print("Bạn có thể:")
            print("1. Đổi tên file ảnh để chứa ID hoặc tên sách")
            print("2. Chạy lại script này")
    
    except Exception as e:
        db.rollback()
        print(f"\n❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    fix_book_images()

