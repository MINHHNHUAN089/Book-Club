"""
Script để set role admin cho một user
Usage: python set_admin_role.py <email>
"""
import sys
from app.database import SessionLocal
from app.models import User

def set_admin_role(email: str):
    """Set admin role for a user"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ Không tìm thấy user với email: {email}")
            return False
        
        user.role = "admin"
        user.is_active = True
        db.commit()
        print(f"✅ Đã set role admin cho user: {user.name} ({user.email})")
        return True
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python set_admin_role.py <email>")
        print("Example: python set_admin_role.py admin@library.com")
        sys.exit(1)
    
    email = sys.argv[1]
    set_admin_role(email)

