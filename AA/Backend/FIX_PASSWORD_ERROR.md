# Hướng dẫn sửa lỗi "password authentication failed"

## Lỗi: "password authentication failed for user 'postgres'"

Lỗi này xảy ra khi mật khẩu PostgreSQL không đúng hoặc chưa được thiết lập.

## Giải pháp

### Cách 1: Đặt lại mật khẩu PostgreSQL (Khuyến nghị)

#### Bước 1: Mở Command Prompt hoặc PowerShell với quyền Administrator

#### Bước 2: Tìm thư mục bin của PostgreSQL

Thường nằm ở:
- `C:\Program Files\PostgreSQL\15\bin` (hoặc version khác)
- `C:\Program Files (x86)\PostgreSQL\15\bin`

#### Bước 3: Đặt lại mật khẩu

```powershell
# Thay đổi đường dẫn nếu cần
cd "C:\Program Files\PostgreSQL\15\bin"

# Đặt lại mật khẩu cho user postgres
.\psql.exe -U postgres -c "ALTER USER postgres WITH PASSWORD 'mat_khau_moi_cua_ban';"
```

**Lưu ý:** Thay `mat_khau_moi_cua_ban` bằng mật khẩu bạn muốn đặt.

#### Bước 4: Cập nhật file .env

Mở file `.env` trong thư mục `Backend` và cập nhật:

```env
DATABASE_URL=postgresql://postgres:mat_khau_moi_cua_ban@localhost:5432/bookclub_db
```

### Cách 2: Sử dụng pgAdmin để đặt lại mật khẩu

1. Nếu bạn đã từng kết nối thành công trước đó:
   - Click chuột phải vào server → **Properties** → Tab **Connection**
   - Kiểm tra lại password đã lưu

2. Nếu chưa từng kết nối:
   - Thử password mặc định (thường là `postgres` hoặc `admin`)
   - Hoặc password bạn đã đặt khi cài đặt PostgreSQL

### Cách 3: Sử dụng SQL Shell (psql)

1. Mở **SQL Shell (psql)** từ Start Menu
2. Nhấn Enter để chấp nhận các giá trị mặc định:
   - Server: `localhost`
   - Database: `postgres`
   - Port: `5432`
   - Username: `postgres`
3. Nhập password hiện tại (hoặc Enter nếu chưa có)
4. Chạy lệnh:

```sql
ALTER USER postgres WITH PASSWORD 'mat_khau_moi_cua_ban';
```

### Cách 4: Kiểm tra file pg_hba.conf (Nâng cao)

Nếu vẫn không được, có thể cần sửa file cấu hình:

1. Tìm file `pg_hba.conf` (thường ở `C:\Program Files\PostgreSQL\15\data\`)
2. Tìm dòng:
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            scram-sha-256
   ```
3. Đảm bảo phương thức xác thực là `scram-sha-256` hoặc `md5`
4. Restart PostgreSQL service

## Sau khi đặt lại mật khẩu

### 1. Cập nhật pgAdmin

1. Mở pgAdmin
2. Click chuột phải vào server → **Properties**
3. Tab **Connection** → Nhập password mới
4. Tích **Save password** → Click **Save**

### 2. Cập nhật file .env

```env
DATABASE_URL=postgresql://postgres:mat_khau_moi_cua_ban@localhost:5432/bookclub_db
```

### 3. Test kết nối

```bash
cd Backend
python test_connection.py
```

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG:**
- Sử dụng mật khẩu mạnh (ít nhất 8 ký tự, có chữ hoa, chữ thường, số)
- Không chia sẻ mật khẩu
- File `.env` đã được thêm vào `.gitignore` để không commit lên Git

## Troubleshooting

### Lỗi: "psql: error: connection to server failed"
- Kiểm tra PostgreSQL service có đang chạy không:
  ```powershell
  Get-Service -Name postgresql*
  ```
- Nếu không chạy, khởi động:
  ```powershell
  Start-Service postgresql-x64-15  # Thay version nếu khác
  ```

### Lỗi: "psql: error: FATAL: role 'postgres' does not exist"
- Tạo user postgres:
  ```sql
  CREATE USER postgres WITH SUPERUSER PASSWORD 'mat_khau';
  ```

### Vẫn không kết nối được
- Thử kết nối với user khác (nếu có)
- Kiểm tra firewall có chặn port 5432 không
- Kiểm tra PostgreSQL đang chạy trên port nào:
  ```powershell
  netstat -ano | findstr :5432
  ```

