-- Script SQL để thêm các cột còn thiếu vào bảng users
-- Chạy script này trong pgAdmin hoặc psql

-- Thêm cột role nếu chưa có
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL;
        RAISE NOTICE 'Column role added successfully';
    ELSE
        RAISE NOTICE 'Column role already exists';
    END IF;
END $$;

-- Thêm cột is_active nếu chưa có
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL;
        RAISE NOTICE 'Column is_active added successfully';
    ELSE
        RAISE NOTICE 'Column is_active already exists';
    END IF;
END $$;

-- Cập nhật dữ liệu hiện có
UPDATE users SET role = 'user' WHERE role IS NULL;
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;

-- Kiểm tra kết quả
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('role', 'is_active')
ORDER BY column_name;

