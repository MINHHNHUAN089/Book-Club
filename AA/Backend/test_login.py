"""
Script để test đăng nhập các tài khoản mẫu
"""
import requests
import sys

BASE_URL = "http://localhost:8000"

# Danh sách tài khoản test
TEST_ACCOUNTS = [
    {"email": "admin@library.com", "password": "password123", "role": "admin"},
    {"email": "hoa@example.com", "password": "password123", "role": "user"},
    {"email": "nam@example.com", "password": "password123", "role": "user"},
    {"email": "john@example.com", "password": "password123", "role": "user"},
    {"email": "jane@example.com", "password": "password123", "role": "user"},
    {"email": "bob@example.com", "password": "password123", "role": "user"},
]

def test_login(email: str, password: str):
    """Test đăng nhập một tài khoản"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={
                "username": email,  # OAuth2PasswordRequestForm uses 'username' field
                "password": password
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print(f"✅ {email}: Đăng nhập thành công!")
            print(f"   Token: {token[:50]}...")
            return True, token
        else:
            print(f"❌ {email}: Đăng nhập thất bại!")
            print(f"   Status: {response.status_code}")
            print(f"   Error: {response.json().get('detail', 'Unknown error')}")
            return False, None
    except requests.exceptions.ConnectionError:
        print(f"❌ {email}: Không thể kết nối đến server!")
        print(f"   Đảm bảo server đang chạy tại {BASE_URL}")
        return False, None
    except Exception as e:
        print(f"❌ {email}: Lỗi: {str(e)}")
        return False, None

def test_get_user_info(token: str):
    """Test lấy thông tin user với token"""
    try:
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            user_data = response.json()
            print(f"   User info: {user_data.get('name')} ({user_data.get('email')})")
            print(f"   Role: {user_data.get('role')}, Active: {user_data.get('is_active')}")
            return True
        else:
            print(f"   ⚠️  Không thể lấy thông tin user: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ⚠️  Lỗi khi lấy thông tin user: {str(e)}")
        return False

def main():
    print("🔐 Testing Login Functionality\n")
    print("=" * 60)
    
    success_count = 0
    fail_count = 0
    
    for account in TEST_ACCOUNTS:
        email = account["email"]
        password = account["password"]
        role = account["role"]
        
        print(f"\n📧 Testing: {email} ({role})")
        success, token = test_login(email, password)
        
        if success:
            success_count += 1
            # Test get user info
            test_get_user_info(token)
        else:
            fail_count += 1
    
    print("\n" + "=" * 60)
    print(f"\n📊 Kết quả:")
    print(f"   ✅ Thành công: {success_count}/{len(TEST_ACCOUNTS)}")
    print(f"   ❌ Thất bại: {fail_count}/{len(TEST_ACCOUNTS)}")
    
    if fail_count > 0:
        print("\n⚠️  Một số tài khoản đăng nhập thất bại!")
        print("   Kiểm tra:")
        print("   1. Server có đang chạy không?")
        print("   2. Database có dữ liệu user không?")
        print("   3. Password hash có đúng không?")
        sys.exit(1)
    else:
        print("\n🎉 Tất cả tài khoản đăng nhập thành công!")
        sys.exit(0)

if __name__ == "__main__":
    main()

