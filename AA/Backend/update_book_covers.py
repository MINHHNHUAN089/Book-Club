"""
Script để cập nhật cover_url cho các sách trong database
Sử dụng ảnh từ thư mục static/images/books/
"""
import sys
from pathlib import Path

# Thêm thư mục Backend vào path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Book
from sqlalchemy.orm import Session

def update_book_covers(db: Session):
    """Cập nhật cover_url cho các sách"""
    books = db.query(Book).all()
    
    # Thư mục chứa ảnh
    images_dir = Path(__file__).parent / "static" / "images" / "books"
    
    if not images_dir.exists():
        print(f"❌ Thư mục {images_dir} không tồn tại!")
        print(f"📁 Tạo thư mục: {images_dir}")
        images_dir.mkdir(parents=True, exist_ok=True)
        print("✅ Đã tạo thư mục. Hãy đặt ảnh vào thư mục này và chạy lại script.")
        return
    
    # Lấy danh sách ảnh
    image_files = list(images_dir.glob("*"))
    image_files = [f for f in image_files if f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}]
    
    if not image_files:
        print(f"❌ Không tìm thấy ảnh nào trong {images_dir}")
        print("📁 Hãy đặt ảnh vào thư mục này và chạy lại script.")
        return
    
    print(f"📚 Tìm thấy {len(books)} sách trong database")
    print(f"🖼️  Tìm thấy {len(image_files)} ảnh trong thư mục")
    print()
    
    # Mapping: tên file -> URL
    base_url = "http://localhost:8000"
    updated_count = 0
    
    for book in books:
        # Tìm ảnh phù hợp (theo tên sách hoặc ID)
        # Có thể đặt tên file theo pattern: book_{id}.jpg hoặc {title}.jpg
        book_id_str = str(book.id)
        book_title_clean = book.title.lower().replace(" ", "_").replace("/", "_")[:50]
        
        # Tìm ảnh theo ID
        matching_image = None
        for img_file in image_files:
            img_name = img_file.stem.lower()
            if book_id_str in img_name or book_title_clean in img_name:
                matching_image = img_file
                break
        
        # Nếu không tìm thấy, dùng ảnh đầu tiên chưa dùng
        if not matching_image and image_files:
            matching_image = image_files[0]
            image_files.remove(matching_image)
        
        if matching_image:
            # Tạo URL
            image_url = f"{base_url}/static/images/books/{matching_image.name}"
            
            # Cập nhật cover_url
            if book.cover_url != image_url:
                book.cover_url = image_url
                updated_count += 1
                print(f"✅ Cập nhật: {book.title[:40]}... -> {matching_image.name}")
    
    # Commit changes
    if updated_count > 0:
        db.commit()
        print()
        print(f"🎉 Đã cập nhật {updated_count} sách!")
    else:
        print("ℹ️  Không có sách nào cần cập nhật.")
    
    # Hiển thị sách chưa có ảnh
    books_without_cover = [b for b in books if not b.cover_url or b.cover_url == ""]
    if books_without_cover:
        print()
        print(f"⚠️  Còn {len(books_without_cover)} sách chưa có ảnh:")
        for book in books_without_cover[:10]:  # Hiển thị 10 đầu tiên
            print(f"   - {book.id}: {book.title}")
        if len(books_without_cover) > 10:
            print(f"   ... và {len(books_without_cover) - 10} sách khác")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        update_book_covers(db)
    finally:
        db.close()

