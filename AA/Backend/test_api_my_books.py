"""
Script để test API get_my_books
"""
import sys
import requests
from app.config import settings

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("=" * 60)
print("TEST API GET MY BOOKS")
print("=" * 60)

# Test login first
print("\n1. Đăng nhập...")
login_data = {
    "username": "admin@library.com",
    "password": "password123"
}

try:
    response = requests.post(
        "http://localhost:8000/api/auth/login",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    if response.status_code != 200:
        print(f"   ❌ Login failed: {response.status_code}")
        print(f"   Response: {response.text}")
        sys.exit(1)
    
    token_data = response.json()
    token = token_data.get("access_token")
    print(f"   ✅ Login thành công")
    print(f"   Token: {token[:50]}...")
    
    # Test get_my_books
    print("\n2. Lấy danh sách sách...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(
        "http://localhost:8000/api/books/user/my-books",
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"   ❌ Get books failed: {response.status_code}")
        print(f"   Response: {response.text}")
        sys.exit(1)
    
    books = response.json()
    print(f"   ✅ Lấy được {len(books)} sách")
    
    if len(books) > 0:
        print(f"\n   Sách đầu tiên:")
        first_book = books[0]
        print(f"   - ID: {first_book.get('id')}")
        print(f"   - Book ID: {first_book.get('book_id')}")
        print(f"   - Title: {first_book.get('book', {}).get('title', 'N/A')}")
        print(f"   - Status: {first_book.get('status')}")
        print(f"   - Progress: {first_book.get('progress')}%")
    else:
        print("   ⚠️  Không có sách nào!")
        print("   💡 User này chưa có sách trong danh sách")
    
    print("\n" + "=" * 60)
    print("✅ Test hoàn thành!")
    print("=" * 60)
    
except requests.exceptions.ConnectionError:
    print("   ❌ Không thể kết nối đến Backend!")
    print("   💡 Đảm bảo Backend đang chạy: python -m uvicorn app.main:app --reload")
except Exception as e:
    print(f"   ❌ Lỗi: {e}")
    import traceback
    traceback.print_exc()

