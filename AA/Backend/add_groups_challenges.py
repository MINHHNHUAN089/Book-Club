"""
Script để thêm dữ liệu mẫu cho Groups và Challenges
"""
import sys
import io
from datetime import datetime, timedelta
from pathlib import Path

# Fix encoding
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Group, Challenge, User, Book

def add_sample_data():
    """Thêm dữ liệu mẫu cho Groups và Challenges"""
    db = SessionLocal()
    
    try:
        # Lấy user đầu tiên làm creator
        first_user = db.query(User).first()
        if not first_user:
            print("❌ Không tìm thấy user nào trong database!")
            print("   Hãy tạo user trước khi chạy script này.")
            return
        
        # Lấy một số sách để làm current_book
        books = db.query(Book).limit(5).all()
        
        print("=" * 80)
        print("📚 THÊM DỮ LIỆU MẪU CHO GROUPS VÀ CHALLENGES")
        print("=" * 80)
        print()
        
        # Tạo Groups
        print("👥 Tạo Groups...")
        groups_data = [
            {
                "name": "Câu lạc bộ Sách Khoa học Viễn tưởng",
                "description": "Thảo luận về các tác phẩm khoa học viễn tưởng hay nhất",
                "topic": "Khoa học viễn tưởng",
                "cover_url": "http://localhost:8000/static/images/books/book_1.jpg",
                "current_book_id": books[0].id if books else None,
            },
            {
                "name": "Câu lạc bộ Sách Văn học Việt Nam",
                "description": "Khám phá và thảo luận về văn học Việt Nam",
                "topic": "Văn học Việt Nam",
                "cover_url": "http://localhost:8000/static/images/books/book_6.jpg",
                "current_book_id": books[1].id if len(books) > 1 else None,
            },
            {
                "name": "Câu lạc bộ Self-help & Phát triển bản thân",
                "description": "Chia sẻ và học hỏi từ các cuốn sách phát triển bản thân",
                "topic": "Self-help",
                "cover_url": "http://localhost:8000/static/images/books/book_8.jpg",
                "current_book_id": books[2].id if len(books) > 2 else None,
            },
            {
                "name": "Câu lạc bộ Sách Lịch sử",
                "description": "Tìm hiểu lịch sử qua những cuốn sách hay",
                "topic": "Lịch sử",
                "cover_url": "http://localhost:8000/static/images/books/book_33.jpg",
                "current_book_id": books[3].id if len(books) > 3 else None,
            },
            {
                "name": "Câu lạc bộ Sách Kinh điển",
                "description": "Đọc và thảo luận các tác phẩm văn học kinh điển",
                "topic": "Văn học kinh điển",
                "cover_url": "http://localhost:8000/static/images/books/book_2.jpg",
                "current_book_id": books[4].id if len(books) > 4 else None,
            },
        ]
        
        groups_created = 0
        for group_data in groups_data:
            existing = db.query(Group).filter(Group.name == group_data["name"]).first()
            if not existing:
                group = Group(
                    created_by=first_user.id,
                    members_count=1,  # Creator là member đầu tiên
                    **group_data
                )
                db.add(group)
                # Thêm creator vào members
                group.members.append(first_user)
                groups_created += 1
                print(f"  ✅ Tạo: {group_data['name']}")
            else:
                print(f"  ℹ️  Đã có: {group_data['name']}")
        
        db.commit()
        print(f"\n📊 Đã tạo {groups_created} groups mới")
        
        # Tạo Challenges
        print("\n🎯 Tạo Challenges...")
        now = datetime.now()
        challenges_data = [
            {
                "title": "Thử thách đọc 50 cuốn sách năm 2024",
                "description": "Đọc 50 cuốn sách trước khi kết thúc năm 2024",
                "cover_url": "http://localhost:8000/static/images/books/book_1.jpg",
                "target_books": 50,
                "start_date": datetime(2024, 1, 1),
                "end_date": datetime(2024, 12, 31),
                "xp_reward": 5000,
                "badge": "📚 Bookworm 2024",
                "tags": "reading,2024,challenge",
            },
            {
                "title": "Thử thách đọc sách khoa học viễn tưởng",
                "description": "Đọc 10 cuốn sách khoa học viễn tưởng trong 3 tháng",
                "cover_url": "http://localhost:8000/static/images/books/book_1.jpg",
                "target_books": 10,
                "start_date": now,
                "end_date": now + timedelta(days=90),
                "xp_reward": 2000,
                "badge": "🚀 Sci-Fi Explorer",
                "tags": "scifi,fantasy,reading",
            },
            {
                "title": "Thử thách đọc sách Việt Nam",
                "description": "Đọc 15 cuốn sách văn học Việt Nam",
                "cover_url": "http://localhost:8000/static/images/books/book_6.jpg",
                "target_books": 15,
                "start_date": now,
                "end_date": now + timedelta(days=180),
                "xp_reward": 3000,
                "badge": "🇻🇳 Vietnamese Literature",
                "tags": "vietnamese,literature,reading",
            },
            {
                "title": "Thử thách Self-help 30 ngày",
                "description": "Đọc 5 cuốn sách self-help trong 30 ngày",
                "cover_url": "http://localhost:8000/static/images/books/book_8.jpg",
                "target_books": 5,
                "start_date": now,
                "end_date": now + timedelta(days=30),
                "xp_reward": 1500,
                "badge": "💪 Self-Improvement",
                "tags": "selfhelp,personal-development",
            },
            {
                "title": "Thử thách đọc sách lịch sử",
                "description": "Đọc 8 cuốn sách về lịch sử",
                "cover_url": "http://localhost:8000/static/images/books/book_33.jpg",
                "target_books": 8,
                "start_date": now,
                "end_date": now + timedelta(days=120),
                "xp_reward": 2500,
                "badge": "📜 History Buff",
                "tags": "history,non-fiction",
            },
        ]
        
        challenges_created = 0
        for challenge_data in challenges_data:
            existing = db.query(Challenge).filter(Challenge.title == challenge_data["title"]).first()
            if not existing:
                challenge = Challenge(**challenge_data)
                db.add(challenge)
                challenges_created += 1
                print(f"  ✅ Tạo: {challenge_data['title']}")
            else:
                print(f"  ℹ️  Đã có: {challenge_data['title']}")
        
        db.commit()
        print(f"\n📊 Đã tạo {challenges_created} challenges mới")
        
        # Tổng kết
        total_groups = db.query(Group).count()
        total_challenges = db.query(Challenge).count()
        
        print()
        print("=" * 80)
        print("✅ HOÀN TẤT!")
        print("=" * 80)
        print(f"📊 Tổng số Groups: {total_groups}")
        print(f"📊 Tổng số Challenges: {total_challenges}")
        print()
        print("💡 Bây giờ bạn có thể refresh Frontend để xem dữ liệu!")
        
        db.close()
        
    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        db.close()

if __name__ == "__main__":
    add_sample_data()

