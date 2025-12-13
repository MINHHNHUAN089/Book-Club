"""
Script để thêm nhiều sách hơn vào danh sách của users
"""
import sys
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database import SessionLocal
from app.models import User, Book, UserBook
import random

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

db: Session = SessionLocal()

print("=" * 60)
print("THÊM NHIỀU SÁCH HƠN VÀO DANH SÁCH CỦA USERS")
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
    
    # Thêm sách cho mỗi user (mỗi user sẽ có 15-20 sách)
    total_added = 0
    
    for user in users:
        # Lấy sách hiện tại của user
        existing_user_books = db.query(UserBook).filter(UserBook.user_id == user.id).all()
        existing_book_ids = {ub.book_id for ub in existing_user_books}
        
        # Lấy sách chưa có trong danh sách
        available_books = [b for b in books if b.id not in existing_book_ids]
        
        if len(available_books) == 0:
            print(f"   ℹ️  User {user.email}: Đã có tất cả sách")
            continue
        
        # Mỗi user sẽ có tổng cộng 15-20 sách
        target_count = random.randint(15, 20)
        needed = target_count - len(existing_user_books)
        
        if needed <= 0:
            print(f"   ℹ️  User {user.email}: Đã đủ sách ({len(existing_user_books)})")
            continue
        
        # Chọn sách ngẫu nhiên
        num_to_add = min(needed, len(available_books))
        selected_books = random.sample(available_books, num_to_add)
        
        user_added = 0
        for book in selected_books:
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
            print(f"   ✅ User {user.email}: Thêm {user_added} sách (Tổng: {len(existing_user_books) + user_added})")
    
    db.commit()
    
    print("\n" + "=" * 60)
    print(f"✅ HOÀN THÀNH!")
    print(f"   - Đã thêm {total_added} sách vào danh sách của users")
    print(f"   - Mỗi user giờ có 15-20 sách")
    print("=" * 60)
    
except Exception as e:
    db.rollback()
    print(f"\n❌ Lỗi: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()

