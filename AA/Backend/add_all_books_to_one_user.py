"""
Script để thêm TẤT CẢ sách vào danh sách của MỘT user cụ thể
"""
import sys
import io
from datetime import datetime, timezone, timedelta
from pathlib import Path
import random

# Fix encoding
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import User, Book, UserBook

def add_all_books_to_one_user(user_email: str = None):
    """Thêm tất cả sách vào danh sách của một user"""
    db = SessionLocal()
    
    try:
        # Lấy user
        if user_email:
            user = db.query(User).filter(User.email == user_email).first()
        else:
            # Lấy user đầu tiên nếu không chỉ định
            user = db.query(User).first()
        
        if not user:
            print("❌ Không tìm thấy user!")
            if user_email:
                print(f"   Email: {user_email}")
            print("   Hãy kiểm tra lại email hoặc tạo user trước.")
            return
        
        # Lấy tất cả sách
        books = db.query(Book).all()
        if not books:
            print("❌ Không tìm thấy sách nào trong database!")
            print("   Hãy chạy insert_40_books.py trước.")
            return
        
        print("=" * 80)
        print("📚 THÊM TẤT CẢ SÁCH VÀO DANH SÁCH CỦA USER")
        print("=" * 80)
        print()
        print(f"👤 User: {user.name} ({user.email})")
        print(f"📖 Tổng số sách: {len(books)}")
        print()
        
        added = 0
        skipped = 0
        
        print("📚 Đang thêm sách...")
        for book in books:
            # Kiểm tra xem user đã có sách này chưa
            existing = db.query(UserBook).filter(
                UserBook.user_id == user.id,
                UserBook.book_id == book.id
            ).first()
            
            if existing:
                skipped += 1
                continue
            
            # Tạo status ngẫu nhiên
            statuses = ["want_to_read", "reading", "completed", "paused"]
            weights = [0.4, 0.2, 0.3, 0.1]
            status = random.choices(statuses, weights=weights)[0]
            
            # Tạo progress và rating dựa trên status
            if status == "completed":
                progress = 100
                rating = round(random.uniform(3.5, 5.0), 1)
                started_at = datetime.now(timezone.utc) - timedelta(days=random.randint(10, 60))
                completed_at = datetime.now(timezone.utc) - timedelta(days=random.randint(1, 10))
            elif status == "reading":
                progress = random.randint(10, 90)
                rating = None
                started_at = datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))
                completed_at = None
            elif status == "paused":
                progress = random.randint(5, 50)
                rating = None
                started_at = datetime.now(timezone.utc) - timedelta(days=random.randint(5, 20))
                completed_at = None
            else:  # want_to_read
                progress = 0
                rating = None
                started_at = None
                completed_at = None
            
            # Tạo UserBook
            user_book = UserBook(
                user_id=user.id,
                book_id=book.id,
                status=status,
                progress=progress,
                rating=rating,
                started_at=started_at,
                completed_at=completed_at
            )
            db.add(user_book)
            added += 1
            
            if added % 10 == 0:
                print(f"   ✅ Đã thêm {added} cuốn sách...")
        
        db.commit()
        
        # Tổng kết
        user_total_books = db.query(UserBook).filter(UserBook.user_id == user.id).count()
        
        print()
        print("=" * 80)
        print("✅ HOÀN TẤT!")
        print("=" * 80)
        print(f"📊 Đã thêm {added} cuốn sách mới")
        if skipped > 0:
            print(f"📊 Bỏ qua {skipped} cuốn đã có")
        print(f"📊 Tổng số sách của user: {user_total_books}")
        print()
        print(f"💡 User {user.name} giờ có tất cả {user_total_books} cuốn sách trong danh sách!")
        
        db.close()
        
    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        db.close()

if __name__ == "__main__":
    import sys
    user_email = sys.argv[1] if len(sys.argv) > 1 else None
    add_all_books_to_one_user(user_email)

