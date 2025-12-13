"""
Script để thêm sách vào danh sách của users
"""
import sys
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, Book, UserBook
import random

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

db: Session = SessionLocal()

print("=" * 60)
print("THÊM SÁCH VÀO DANH SÁCH CỦA USERS")
print("=" * 60)

try:
    # Lấy tất cả users
    users = db.query(User).all()
    print(f"\n👥 Tìm thấy {len(users)} users")
    
    # Lấy tất cả books
    books = db.query(Book).all()
    print(f"📚 Tìm thấy {len(books)} books")
    
    if len(users) == 0 or len(books) == 0:
        print("❌ Không có users hoặc books!")
        sys.exit(1)
    
    # Thêm sách cho mỗi user
    total_added = 0
    
    for user in users:
        # Mỗi user sẽ có 5-10 sách ngẫu nhiên
        num_books = random.randint(5, 10)
        selected_books = random.sample(books, min(num_books, len(books)))
        
        user_added = 0
        for book in selected_books:
            # Kiểm tra xem user đã có sách này chưa
            existing = db.query(UserBook).filter(
                UserBook.user_id == user.id,
                UserBook.book_id == book.id
            ).first()
            
            if not existing:
                # Tạo UserBook với status và progress ngẫu nhiên
                statuses = ['want_to_read', 'reading', 'completed']
                status = random.choice(statuses)
                
                if status == 'completed':
                    progress = 100
                    rating = random.choice([4.0, 4.5, 5.0])
                elif status == 'reading':
                    progress = random.randint(10, 90)
                    rating = None
                else:  # want_to_read
                    progress = 0
                    rating = None
                
                user_book = UserBook(
                    user_id=user.id,
                    book_id=book.id,
                    status=status,
                    progress=progress,
                    rating=rating
                )
                db.add(user_book)
                user_added += 1
                total_added += 1
        
        if user_added > 0:
            print(f"   ✅ User {user.email}: Thêm {user_added} sách")
    
    db.commit()
    
    print("\n" + "=" * 60)
    print(f"✅ HOÀN THÀNH!")
    print(f"   - Đã thêm {total_added} sách vào danh sách của users")
    print("=" * 60)
    
except Exception as e:
    db.rollback()
    print(f"\n❌ Lỗi: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()

