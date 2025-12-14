"""
Script để thêm TẤT CẢ sách vào danh sách của users
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

def add_all_books_to_users():
    """Thêm tất cả sách vào danh sách của tất cả users"""
    db = SessionLocal()
    
    try:
        # Lấy tất cả users
        users = db.query(User).all()
        if not users:
            print("❌ Không tìm thấy user nào trong database!")
            print("   Hãy tạo user trước khi chạy script này.")
            return
        
        # Lấy tất cả sách
        books = db.query(Book).all()
        if not books:
            print("❌ Không tìm thấy sách nào trong database!")
            print("   Hãy chạy insert_40_books.py trước.")
            return
        
        print("=" * 80)
        print("📚 THÊM TẤT CẢ SÁCH VÀO DANH SÁCH CỦA USERS")
        print("=" * 80)
        print()
        print(f"👥 Tìm thấy {len(users)} users")
        print(f"📖 Tìm thấy {len(books)} cuốn sách")
        print()
        
        total_added = 0
        total_skipped = 0
        
        # Thêm sách cho từng user
        for user in users:
            print(f"👤 Đang thêm sách cho: {user.name} ({user.email})")
            user_added = 0
            user_skipped = 0
            
            for book in books:
                # Kiểm tra xem user đã có sách này chưa
                existing = db.query(UserBook).filter(
                    UserBook.user_id == user.id,
                    UserBook.book_id == book.id
                ).first()
                
                if existing:
                    user_skipped += 1
                    continue
                
                # Tạo status ngẫu nhiên (để có dữ liệu đa dạng)
                statuses = ["want_to_read", "reading", "completed", "paused"]
                weights = [0.4, 0.2, 0.3, 0.1]  # want_to_read nhiều nhất
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
                user_added += 1
                total_added += 1
            
            db.commit()
            print(f"   ✅ Đã thêm {user_added} cuốn sách")
            if user_skipped > 0:
                print(f"   ℹ️  Bỏ qua {user_skipped} cuốn đã có")
            print()
        
        # Tổng kết
        total_user_books = db.query(UserBook).count()
        
        print("=" * 80)
        print("✅ HOÀN TẤT!")
        print("=" * 80)
        print(f"📊 Tổng số UserBooks đã thêm: {total_added}")
        print(f"📊 Tổng số UserBooks trong database: {total_user_books}")
        print()
        print("💡 Bây giờ bạn có thể refresh Frontend để xem dữ liệu!")
        print("   Mỗi user sẽ có tất cả sách trong danh sách của mình.")
        
        db.close()
        
    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        db.close()

if __name__ == "__main__":
    add_all_books_to_users()

