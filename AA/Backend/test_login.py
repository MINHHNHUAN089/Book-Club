"""
Script để test login và kiểm tra user trong database
Usage: python test_login.py
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User
from app.auth import verify_password, get_password_hash

def test_user_exists(email: str):
    """Kiểm tra user có tồn tại không"""
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"✅ User '{email}' tồn tại trong database")
            print(f"   - ID: {user.id}")
            print(f"   - Name: {user.name}")
            print(f"   - Email: {user.email}")
            print(f"   - Hashed password: {user.hashed_password[:50]}...")
            return user
        else:
            print(f"❌ User '{email}' KHÔNG tồn tại trong database")
            return None
    finally:
        db.close()

def test_password_verification(email: str, password: str):
    """Test password verification"""
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ User '{email}' không tồn tại")
            return False
        
        print(f"\n🔐 Testing password verification...")
        print(f"   - Input password: {password}")
        print(f"   - Stored hash: {user.hashed_password[:50]}...")
        
        is_valid = verify_password(password, user.hashed_password)
        
        if is_valid:
            print(f"✅ Password verification: SUCCESS")
        else:
            print(f"❌ Password verification: FAILED")
            print(f"   - Có thể password không đúng hoặc hash không khớp")
        
        return is_valid
    finally:
        db.close()

def list_all_users():
    """Liệt kê tất cả users trong database"""
    db: Session = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"\n📋 Tất cả users trong database ({len(users)}):")
        for user in users:
            print(f"   - {user.email} (ID: {user.id}, Name: {user.name})")
        return users
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("TEST LOGIN & USER VERIFICATION")
    print("=" * 60)
    
    # List all users
    list_all_users()
    
    # Test với email từ user
    email = input("\n📧 Nhập email để test (hoặc Enter để dùng 'john@example.com'): ").strip()
    if not email:
        email = "john@example.com"
    
    password = input("🔑 Nhập password để test (hoặc Enter để dùng 'password123'): ").strip()
    if not password:
        password = "password123"
    
    print(f"\n{'=' * 60}")
    print(f"Testing với: {email} / {password}")
    print(f"{'=' * 60}\n")
    
    # Check user exists
    user = test_user_exists(email)
    
    if user:
        # Test password
        test_password_verification(email, password)
    else:
        print(f"\n💡 User chưa tồn tại. Hãy đăng ký trước!")
        print(f"   Hoặc chạy seed data: python run_seed.py")

