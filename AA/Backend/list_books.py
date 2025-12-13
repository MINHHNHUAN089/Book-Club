"""
Script để liệt kê tất cả sách trong database với ID và tên
Giúp bạn biết cách đặt tên file ảnh
"""
import sys
import io
from pathlib import Path

# Fix encoding for Windows console
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Thêm thư mục Backend vào path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Book
from sqlalchemy.orm import Session

def list_books(db: Session):
    """Liệt kê tất cả sách với ID và tên"""
    books = db.query(Book).order_by(Book.id).all()
    
    if not books:
        print("❌ Không có sách nào trong database!")
        return
    
    print("=" * 80)
    print(f"📚 DANH SÁCH SÁCH TRONG DATABASE (Tổng: {len(books)} sách)")
    print("=" * 80)
    print()
    print(f"{'ID':<6} | {'Tên Sách':<60} | {'Có Ảnh':<10}")
    print("-" * 80)
    
    books_with_cover = 0
    books_without_cover = 0
    
    for book in books:
        has_cover = "✅" if book.cover_url and book.cover_url.strip() else "❌"
        if book.cover_url and book.cover_url.strip():
            books_with_cover += 1
        else:
            books_without_cover += 1
        
        # Cắt tên sách nếu quá dài
        title = book.title[:57] + "..." if len(book.title) > 60 else book.title
        print(f"{book.id:<6} | {title:<60} | {has_cover:<10}")
    
    print("-" * 80)
    print()
    print(f"📊 Thống kê:")
    print(f"   ✅ Có ảnh: {books_with_cover} sách")
    print(f"   ❌ Chưa có ảnh: {books_without_cover} sách")
    print()
    
    # Hiển thị gợi ý đặt tên file
    print("=" * 80)
    print("💡 GỢI Ý ĐẶT TÊN FILE ẢNH:")
    print("=" * 80)
    print()
    print("Cách 1: Theo ID sách (Khuyên dùng)")
    print("   Ví dụ: book_1.jpg, book_2.jpg, book_3.jpg, ...")
    print()
    print("Cách 2: Theo tên sách")
    print("   Ví dụ: dune.jpg, harry_potter.jpg, 1984.jpg, ...")
    print("   (Tên file nên viết thường, thay khoảng trắng bằng _)")
    print()
    
    # Hiển thị danh sách sách chưa có ảnh
    if books_without_cover > 0:
        print("=" * 80)
        print(f"⚠️  DANH SÁCH SÁCH CHƯA CÓ ẢNH ({books_without_cover} sách):")
        print("=" * 80)
        print()
        for book in books:
            if not book.cover_url or not book.cover_url.strip():
                # Tạo tên file gợi ý
                title_clean = book.title.lower().replace(" ", "_").replace("/", "_")
                title_clean = "".join(c for c in title_clean if c.isalnum() or c in "._-")[:50]
                print(f"   ID {book.id:<4} | {book.title:<50} | Gợi ý: book_{book.id}.jpg hoặc {title_clean}.jpg")
        print()
    
    # Hiển thị danh sách sách đã có ảnh
    if books_with_cover > 0:
        print("=" * 80)
        print(f"✅ DANH SÁCH SÁCH ĐÃ CÓ ẢNH ({books_with_cover} sách):")
        print("=" * 80)
        print()
        for book in books:
            if book.cover_url and book.cover_url.strip():
                print(f"   ID {book.id:<4} | {book.title:<50} | {book.cover_url}")
        print()
    
    # Tạo file text với danh sách
    output_file = Path(__file__).parent / "danh_sach_sach.txt"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("=" * 80 + "\n")
        f.write(f"DANH SÁCH SÁCH TRONG DATABASE (Tổng: {len(books)} sách)\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"{'ID':<6} | {'Tên Sách':<60} | {'Có Ảnh':<10}\n")
        f.write("-" * 80 + "\n")
        
        for book in books:
            has_cover = "Có" if book.cover_url and book.cover_url.strip() else "Chưa"
            title = book.title[:57] + "..." if len(book.title) > 60 else book.title
            f.write(f"{book.id:<6} | {title:<60} | {has_cover:<10}\n")
        
        f.write("\n" + "=" * 80 + "\n")
        f.write("GỢI Ý ĐẶT TÊN FILE ẢNH:\n")
        f.write("=" * 80 + "\n\n")
        f.write("Cách 1: Theo ID sách (Khuyên dùng)\n")
        f.write("   Ví dụ: book_1.jpg, book_2.jpg, book_3.jpg, ...\n\n")
        f.write("Cách 2: Theo tên sách\n")
        f.write("   Ví dụ: dune.jpg, harry_potter.jpg, 1984.jpg, ...\n\n")
        
        if books_without_cover > 0:
            f.write("\n" + "=" * 80 + "\n")
            f.write(f"SÁCH CHƯA CÓ ẢNH ({books_without_cover} sách):\n")
            f.write("=" * 80 + "\n\n")
            for book in books:
                if not book.cover_url or not book.cover_url.strip():
                    title_clean = book.title.lower().replace(" ", "_").replace("/", "_")
                    title_clean = "".join(c for c in title_clean if c.isalnum() or c in "._-")[:50]
                    f.write(f"ID {book.id:<4} | {book.title:<50} | Gợi ý: book_{book.id}.jpg hoặc {title_clean}.jpg\n")
    
    print(f"💾 Đã lưu danh sách vào file: {output_file}")
    print()


if __name__ == "__main__":
    db = SessionLocal()
    try:
        list_books(db)
    finally:
        db.close()

