# Hướng dẫn sửa lỗi Build trên Windows

## Lỗi: "link.exe was not found" / "Failed building wheel"

Lỗi này xảy ra khi cài đặt các package Python cần compile native code (như `pydantic-core`, `psycopg2-binary`) nhưng thiếu Microsoft Visual C++ Build Tools.

## Giải pháp nhanh (Khuyến nghị)

### Cách 1: Cập nhật pip và thử lại với pre-built wheels

```powershell
# Cập nhật pip
python -m pip install --upgrade pip

# Cài đặt với chỉ sử dụng pre-built wheels (không build từ source)
pip install --only-binary :all: -r requirements.txt
```

Nếu vẫn lỗi, thử:

```powershell
# Cài đặt từng package một
pip install --upgrade pip setuptools wheel
pip install fastapi
pip install uvicorn[standard]
pip install sqlalchemy
pip install psycopg2-binary
pip install pydantic
pip install pydantic-settings
pip install python-jose[cryptography]
pip install passlib[bcrypt]
pip install python-multipart
pip install alembic
```

### Cách 2: Cài đặt Microsoft Visual C++ Build Tools

1. **Download Visual Studio Build Tools:**
   - Truy cập: https://visualstudio.microsoft.com/downloads/
   - Tải "Build Tools for Visual Studio 2022"

2. **Cài đặt:**
   - Chạy installer
   - Chọn "Desktop development with C++"
   - Đảm bảo tích các components:
     - MSVC v143 - VS 2022 C++ x64/x86 build tools
     - Windows 10/11 SDK
     - C++ CMake tools for Windows

3. **Sau khi cài đặt:**
   - Restart PowerShell/Command Prompt
   - Chạy lại: `pip install -r requirements.txt`

### Cách 3: Sử dụng Python version tương thích hơn

Python 3.13 có thể quá mới, một số package chưa có pre-built wheels. Thử dùng Python 3.11 hoặc 3.12:

```powershell
# Kiểm tra Python version
python --version

# Nếu là 3.13, cài Python 3.11 hoặc 3.12 từ python.org
# Tạo venv mới với Python version đó
py -3.11 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Cách 4: Cài đặt từng package với version cụ thể

Nếu vẫn lỗi, thử cài các version mới hơn có pre-built wheels:

```powershell
pip install --upgrade pip
pip install fastapi==0.115.0
pip install uvicorn[standard]==0.32.0
pip install sqlalchemy==2.0.36
pip install psycopg2-binary==2.9.10
pip install "pydantic>=2.5.0"
pip install "pydantic-settings>=2.1.0"
pip install python-jose[cryptography]==3.3.0
pip install passlib[bcrypt]==1.7.4
pip install python-multipart==0.0.6
pip install alembic==1.13.2
```

## Kiểm tra sau khi cài đặt

```powershell
# Test import các package
python -c "import fastapi; import sqlalchemy; import pydantic; print('OK')"
```

## Troubleshooting

### Lỗi: "Microsoft Visual C++ 14.0 or greater is required"
- Cài đặt Visual Studio Build Tools (Cách 2 ở trên)

### Lỗi: "No module named 'pydantic_core'"
- `pydantic-core` là dependency của `pydantic`
- Thử: `pip install pydantic-core --upgrade`

### Lỗi: "Failed to build wheel"
- Đảm bảo đã cập nhật pip: `python -m pip install --upgrade pip wheel setuptools`
- Thử: `pip install --only-binary :all: <package-name>`

### Vẫn không được?
- Kiểm tra Python version: `python --version`
- Kiểm tra pip version: `pip --version`
- Thử tạo venv mới: `python -m venv venv_new`
- Xem log chi tiết: `pip install -r requirements.txt -v`

