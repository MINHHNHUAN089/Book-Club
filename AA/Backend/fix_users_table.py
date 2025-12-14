"""Script để thêm các cột còn thiếu vào bảng users"""
from sqlalchemy import text
from app.database import engine

def check_column_exists(conn, table_name, column_name):
    """Kiểm tra cột có tồn tại không"""
    try:
        result = conn.execute(text(f"""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = '{table_name}' 
            AND column_name = '{column_name}'
        """))
        return result.fetchone() is not None
    except Exception:
        return False

def fix_users_table():
    """Thêm các cột role và is_active vào bảng users nếu chưa có"""
    print("🔧 Fixing users table...")
    print("=" * 60)
    
    try:
        # Sử dụng begin() để có transaction control tốt hơn
        with engine.begin() as conn:
            # Kiểm tra và thêm cột role
            print("\n1️⃣ Checking 'role' column...")
            if check_column_exists(conn, 'users', 'role'):
                print("   ✅ Column 'role' already exists")
            else:
                print("   ⚠️  Column 'role' does not exist, adding...")
                conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL"))
                print("   ✅ Column 'role' added successfully!")
            
            # Kiểm tra và thêm cột is_active
            print("\n2️⃣ Checking 'is_active' column...")
            if check_column_exists(conn, 'users', 'is_active'):
                print("   ✅ Column 'is_active' already exists")
            else:
                print("   ⚠️  Column 'is_active' does not exist, adding...")
                conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL"))
                print("   ✅ Column 'is_active' added successfully!")
        
        # Cập nhật dữ liệu hiện có trong transaction riêng
        print("\n3️⃣ Updating existing data...")
        with engine.begin() as conn:
            # Chỉ update nếu cột tồn tại
            if check_column_exists(conn, 'users', 'role'):
                conn.execute(text("UPDATE users SET role = 'user' WHERE role IS NULL"))
            if check_column_exists(conn, 'users', 'is_active'):
                conn.execute(text("UPDATE users SET is_active = TRUE WHERE is_active IS NULL"))
        print("   ✅ Existing data updated!")
        
        # Kiểm tra lại
        print("\n4️⃣ Verifying...")
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT 
                    column_name, 
                    data_type, 
                    column_default,
                    is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name IN ('role', 'is_active')
                ORDER BY column_name
            """))
            
            columns = result.fetchall()
            if len(columns) == 2:
                print("   ✅ Both columns exist!")
                for col in columns:
                    print(f"      - {col[0]}: {col[1]} (default: {col[2]}, nullable: {col[3]})")
            else:
                print(f"   ⚠️  Found {len(columns)} columns (expected 2)")
                for col in columns:
                    print(f"      - {col[0]}: {col[1]}")
            
            # Đếm users
            result = conn.execute(text("SELECT COUNT(*) FROM users"))
            count = result.scalar()
            print(f"\n   Total users: {count}")
        
        print("\n" + "=" * 60)
        print("🎉 Users table fixed successfully!")
        print("\n✅ Bạn có thể chạy Backend server ngay bây giờ!")
        return True
        
    except Exception as e:
        print("\n" + "=" * 60)
        print("❌ Failed to fix users table!")
        print(f"\nError: {str(e)}")
        print("\n💡 Giải pháp thay thế:")
        print("   1. Chạy SQL trực tiếp trong pgAdmin (xem FIX_DATABASE_SCHEMA.md)")
        print("   2. Xóa và tạo lại database (nếu dữ liệu không quan trọng)")
        return False

if __name__ == "__main__":
    fix_users_table()

