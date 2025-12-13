"""
Script để test kết nối database PostgreSQL
Chạy: python test_connection.py
"""
import sys
import os
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

def test_connection():
    try:
        # Đảm bảo đọc .env từ đúng thư mục
        backend_dir = Path(__file__).parent
        env_file = backend_dir / ".env"
        
        if not env_file.exists():
            print("[ERROR] .env file not found!")
            print(f"Expected location: {env_file}")
            print()
            print("Please create .env file in Backend directory")
            return False
        
        # Import settings (sau khi đảm bảo .env tồn tại)
        from app.config import settings
        
        print("=" * 50)
        print("Testing Database Connection...")
        print("=" * 50)
        db_url_display = settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'Hidden'
        print(f"Database URL: {db_url_display}")
        print()
        
        # Create engine
        engine = create_engine(settings.DATABASE_URL)
        
        # Test connection
        print("Attempting to connect...")
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print("[OK] Connection successful!")
            print()
            print(f"PostgreSQL Version: {version}")
            print()
            
            # Check if database exists and is accessible
            result = connection.execute(text("SELECT current_database();"))
            db_name = result.fetchone()[0]
            print(f"Connected to database: {db_name}")
            print()
            
            # Check existing tables
            result = connection.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            tables = [row[0] for row in result.fetchall()]
            
            if tables:
                print(f"Existing tables ({len(tables)}):")
                for table in tables:
                    print(f"  - {table}")
            else:
                print("No tables found. Tables will be created when you run the app.")
            
            print()
            print("=" * 50)
            print("[OK] Database connection test PASSED!")
            print("=" * 50)
            return True
            
    except ImportError as e:
        print("[ERROR] Error importing settings:")
        print(f"   {e}")
        print()
        print("Make sure you have:")
        print("  1. Created .env file in Backend directory")
        print("  2. Installed dependencies: pip install -r requirements.txt")
        return False
        
    except OperationalError as e:
        print("[ERROR] Connection failed!")
        print()
        print("Error details:")
        print(f"   {e}")
        print()
        print("Please check:")
        print("  1. PostgreSQL service is running")
        print("  2. Database 'bookclub_db' exists")
        print("  3. Username and password in .env are correct")
        print("  4. Host and port are correct (default: localhost:5432)")
        return False
        
    except Exception as e:
        print("[ERROR] Unexpected error:")
        print(f"   {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)

