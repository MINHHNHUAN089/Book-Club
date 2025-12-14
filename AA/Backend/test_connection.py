"""Script để test kết nối database"""
from app.database import engine, Base
from app.models import User, Book, Author, UserBook, Review, Group, Challenge
from sqlalchemy import text

def test_connection():
    """Test kết nối database"""
    print("🔍 Testing database connection...")
    print("=" * 60)
    
    try:
        # Test 1: Kết nối cơ bản
        print("\n1️⃣ Testing basic connection...")
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("   ✅ Database connection successful!")
        
        # Test 2: Tạo tables
        print("\n2️⃣ Creating tables...")
        Base.metadata.create_all(bind=engine)
        print("   ✅ Tables created successfully!")
        
        # Test 3: Query database
        print("\n3️⃣ Testing queries...")
        with engine.connect() as conn:
            # Kiểm tra users table
            try:
                result = conn.execute(text("SELECT COUNT(*) FROM users"))
                user_count = result.scalar()
                print(f"   ✅ Users table exists! Count: {user_count}")
            except Exception as e:
                print(f"   ⚠️  Users table query failed: {e}")
            
            # Kiểm tra books table
            try:
                result = conn.execute(text("SELECT COUNT(*) FROM books"))
                book_count = result.scalar()
                print(f"   ✅ Books table exists! Count: {book_count}")
            except Exception as e:
                print(f"   ⚠️  Books table query failed: {e}")
        
        # Test 4: Kiểm tra database info
        print("\n4️⃣ Database information...")
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"   PostgreSQL version: {version.split(',')[0]}")
            
            result = conn.execute(text("SELECT current_database()"))
            db_name = result.scalar()
            print(f"   Current database: {db_name}")
        
        print("\n" + "=" * 60)
        print("🎉 Database connection test passed!")
        print("\n✅ Bạn có thể chạy Backend server ngay bây giờ!")
        print("   Command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        return True
        
    except Exception as e:
        print("\n" + "=" * 60)
        print("❌ Database connection failed!")
        print(f"\nError: {str(e)}")
        print("\n💡 Kiểm tra:")
        print("   1. PostgreSQL service có đang chạy không?")
        print("      Command: Get-Service -Name postgresql*")
        print("   2. DATABASE_URL trong .env có đúng không?")
        print("      Format: postgresql://username:password@host:port/database_name")
        print("   3. Password PostgreSQL có đúng không?")
        print("   4. Database 'bookclub_db' đã được tạo chưa?")
        print("   5. File .env có trong thư mục Backend không?")
        print("\n📖 Xem hướng dẫn chi tiết: HUONG_DAN_KET_NOI_DATABASE.md")
        return False

if __name__ == "__main__":
    test_connection()

