"""
Script để chạy library_schema.sql lên database
Usage: python run_library_schema.py
"""
import sys
import os
from pathlib import Path
from sqlalchemy import create_engine, text
from app.config import settings

# Đảm bảo encoding UTF-8
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def run_library_schema():
    """Chạy file library_schema.sql lên database"""
    print("=" * 60)
    print("CHẠY LIBRARY SCHEMA SQL LÊN DATABASE")
    print("=" * 60)
    
    # Đọc file SQL
    backend_dir = Path(__file__).parent
    sql_file = backend_dir / "library_schema.sql"
    
    if not sql_file.exists():
        print(f"❌ Không tìm thấy file: {sql_file}")
        return False
    
    print(f"📄 Đọc file SQL: {sql_file}")
    
    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
    except Exception as e:
        print(f"❌ Lỗi khi đọc file SQL: {e}")
        return False
    
    # Tạo engine và kết nối
    print(f"🔌 Kết nối database: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else '***'}")
    
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        # Chia SQL thành các câu lệnh
        # Xử lý đặc biệt cho DO blocks và các câu lệnh phức tạp
        statements = []
        current_statement = []
        in_do_block = False
        do_block_depth = 0
        
        lines = sql_content.split('\n')
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # Bỏ qua comment và dòng trống
            if not line or line.startswith('--'):
                i += 1
                continue
            
            current_statement.append(line)
            
            # Kiểm tra DO block
            if 'DO $$' in line.upper():
                in_do_block = True
                do_block_depth = line.upper().count('$$')
            
            # Kiểm tra END trong DO block
            if in_do_block:
                if 'END $$' in line.upper():
                    do_block_depth -= line.upper().count('$$')
                    if do_block_depth <= 0:
                        in_do_block = False
                        if line.endswith(';'):
                            statements.append(' '.join(current_statement))
                            current_statement = []
                            i += 1
                            continue
            
            # Kết thúc câu lệnh thông thường
            if line.endswith(';') and not in_do_block:
                statements.append(' '.join(current_statement))
                current_statement = []
            
            i += 1
        
        # Thêm statement cuối nếu còn
        if current_statement:
            statements.append(' '.join(current_statement))
        
        # Lọc bỏ các statement rỗng
        statements = [s for s in statements if s.strip() and not s.strip().startswith('--')]
        
        print(f"📊 Tìm thấy {len(statements)} câu lệnh SQL")
        
        # Chạy từng câu lệnh
        with engine.connect() as connection:
            # Bắt đầu transaction
            trans = connection.begin()
            
            try:
                success_count = 0
                error_count = 0
                warning_count = 0
                
                for i, statement in enumerate(statements, 1):
                    if not statement.strip():
                        continue
                    
                    # Bỏ qua các dòng chỉ có comment
                    if statement.strip().startswith('--'):
                        continue
                    
                    try:
                        # Chạy câu lệnh
                        connection.execute(text(statement))
                        success_count += 1
                        
                        if i % 5 == 0:
                            print(f"   ✓ Đã chạy {i}/{len(statements)} câu lệnh...")
                    
                    except Exception as e:
                        error_msg = str(e).lower()
                        
                        # Một số lỗi có thể bỏ qua
                        ignorable_errors = [
                            'already exists',
                            'duplicate',
                            'does not exist',  # Một số constraint có thể không tồn tại
                            'relation already exists',
                            'column already exists',
                            'constraint already exists',
                            'index already exists'
                        ]
                        
                        if any(err in error_msg for err in ignorable_errors):
                            warning_count += 1
                            if i <= 10 or i % 20 == 0:  # Chỉ hiển thị một số warnings
                                print(f"   ⚠ Câu lệnh {i}: {str(e)[:80]}... (bỏ qua)")
                        else:
                            error_count += 1
                            print(f"   ❌ Lỗi ở câu lệnh {i}: {str(e)[:200]}")
                            # Tiếp tục chạy các câu lệnh khác
                
                # Commit transaction cuối cùng
                try:
                    trans.commit()
                except Exception as commit_err:
                    # Nếu commit fail, thử rollback
                    try:
                        trans.rollback()
                    except:
                        pass
                    print(f"   ⚠ Lỗi commit: {commit_err}")
                
                print("\n" + "=" * 60)
                print(f"✅ Hoàn thành!")
                print(f"   - Thành công: {success_count} câu lệnh")
                if warning_count > 0:
                    print(f"   - Cảnh báo: {warning_count} câu lệnh (đã tồn tại, bỏ qua)")
                if error_count > 0:
                    print(f"   - Lỗi: {error_count} câu lệnh")
                print("=" * 60)
                
                return True
                
            except Exception as e:
                trans.rollback()
                print(f"\n❌ Lỗi khi chạy SQL: {e}")
                print("   Đã rollback transaction")
                return False
        
    except Exception as e:
        print(f"❌ Lỗi kết nối database: {e}")
        print(f"   Kiểm tra DATABASE_URL trong .env file")
        return False

if __name__ == "__main__":
    success = run_library_schema()
    sys.exit(0 if success else 1)

