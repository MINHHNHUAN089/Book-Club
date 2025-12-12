# Hướng dẫn cấu hình Connection trong pgAdmin 4

## Cách 1: Tạo Server mới (nếu chưa có)

1. **Click chuột phải vào "Servers"** (trong Object Explorer bên trái)
2. Chọn **"Create"** → **"Server..."**
3. Cửa sổ **"Create - Server"** sẽ mở ra

### Tab "General":
- **Name**: `BookClub Server` (hoặc tên bạn muốn)

### Tab "Connection" (QUAN TRỌNG):
Đây là nơi bạn nhập thông tin kết nối:

- **Host name/address**: `localhost` (hoặc `127.0.0.1`)
- **Port**: `5432` (port mặc định PostgreSQL)
- **Maintenance database**: `postgres` (database mặc định)
- **Username**: `postgres` (hoặc username PostgreSQL của bạn)
- **Password**: Nhập password PostgreSQL của bạn
- ✅ **Save password**: Tích vào để lưu password (không phải nhập lại mỗi lần)

4. Click **"Save"** ở dưới cùng

## Cách 2: Sửa Connection của Server đã có

Nếu bạn đã có "BookClub Server" nhưng chưa cấu hình đúng:

1. **Click chuột phải vào "BookClub Server"** (trong Object Explorer)
2. Chọn **"Properties..."**
3. Cửa sổ **"Properties - BookClub Server"** sẽ mở ra
4. Click vào tab **"Connection"** (tab thứ 2)
5. Nhập thông tin:
   - **Host name/address**: `localhost`
   - **Port**: `5432`
   - **Maintenance database**: `postgres`
   - **Username**: `postgres`
   - **Password**: Password của bạn
6. Click **"Save"**

## Sau khi kết nối thành công:

1. **Mở rộng "BookClub Server"** (click vào mũi tên `>`)
2. Bạn sẽ thấy:
   - `>` Databases
   - `>` Login/Group Roles
   - `>` Tablespaces
   - v.v.

3. **Tạo Database mới:**
   - Click chuột phải vào **"Databases"**
   - Chọn **"Create"** → **"Database..."**
   - Tab **"General"**:
     - **Database**: `bookclub_db`
   - Click **"Save"**

## Kiểm tra kết nối:

- Nếu kết nối thành công: Server sẽ mở rộng được, không có dấu X đỏ
- Nếu kết nối thất bại: Sẽ có thông báo lỗi, kiểm tra lại:
  - PostgreSQL service có đang chạy không?
  - Username/Password có đúng không?
  - Port 5432 có bị chặn không?

## Lưu ý:

- Tab **"Connection"** nằm ở cửa sổ Properties của Server
- Nếu không thấy tab Connection, đảm bảo bạn đang ở cửa sổ Properties (không phải Dashboard)
- Password sẽ được mã hóa và lưu trong pgAdmin nếu bạn tích "Save password"

