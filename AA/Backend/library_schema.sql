-- ============================================
-- DATABASE SCHEMA CHO HỆ THỐNG THƯ VIỆN/ĐÁNH GIÁ SÁCH
-- PostgreSQL Version
-- ============================================

-- Tạo database (chạy riêng nếu chưa có)
-- CREATE DATABASE bookclub_db;
-- \c bookclub_db;

-- ============================================
-- BẢNG DANH MỤC/THỂ LOẠI SÁCH (CATEGORIES)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    category_slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- BẢNG LIÊN KẾT SÁCH - DANH MỤC (BOOK_CATEGORIES)
-- ============================================
CREATE TABLE IF NOT EXISTS book_categories (
    book_category_id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
    UNIQUE (book_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_book_categories_book ON book_categories(book_id);
CREATE INDEX IF NOT EXISTS idx_book_categories_category ON book_categories(category_id);

-- ============================================
-- CẬP NHẬT BẢNG BOOKS (Thêm các trường mới)
-- ============================================
-- Thêm các cột mới vào bảng books nếu chưa có
DO $$ 
BEGIN
    -- Thêm cột author nếu chưa có (tạm thời, vì đã có quan hệ với authors)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='books' AND column_name='author') THEN
        ALTER TABLE books ADD COLUMN author VARCHAR(255);
    END IF;
    
    -- Thêm cột publisher
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='books' AND column_name='publisher') THEN
        ALTER TABLE books ADD COLUMN publisher VARCHAR(255);
    END IF;
    
    -- Thêm cột publication_year
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='books' AND column_name='publication_year') THEN
        ALTER TABLE books ADD COLUMN publication_year INTEGER;
    END IF;
    
    -- Thêm cột cover_image (nếu chưa có cover_url)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='books' AND column_name='cover_image') THEN
        ALTER TABLE books ADD COLUMN cover_image VARCHAR(500);
    END IF;
    
    -- Thêm cột total_pages (nếu chưa có page_count)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='books' AND column_name='total_pages') THEN
        ALTER TABLE books ADD COLUMN total_pages INTEGER;
    END IF;
    
    -- Thêm cột language
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='books' AND column_name='language') THEN
        ALTER TABLE books ADD COLUMN language VARCHAR(50) DEFAULT 'Vietnamese';
    END IF;
    
    -- Thêm cột country
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='books' AND column_name='country') THEN
        ALTER TABLE books ADD COLUMN country VARCHAR(20) DEFAULT 'international';
    END IF;
    
    -- Thêm cột average_rating
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='books' AND column_name='average_rating') THEN
        ALTER TABLE books ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.00;
    END IF;
    
    -- Thêm cột total_reviews
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='books' AND column_name='total_reviews') THEN
        ALTER TABLE books ADD COLUMN total_reviews INTEGER DEFAULT 0;
    END IF;
    
    -- Thêm cột total_borrows
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='books' AND column_name='total_borrows') THEN
        ALTER TABLE books ADD COLUMN total_borrows INTEGER DEFAULT 0;
    END IF;
    
    -- Thêm cột is_available
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='books' AND column_name='is_available') THEN
        ALTER TABLE books ADD COLUMN is_available BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Tạo indexes cho books
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_country ON books(country);
CREATE INDEX IF NOT EXISTS idx_books_rating ON books(average_rating);
CREATE INDEX IF NOT EXISTS idx_books_title_search ON books USING gin(to_tsvector('english', title));

-- ============================================
-- CẬP NHẬT BẢNG USERS (Thêm các trường mới)
-- ============================================
DO $$ 
BEGIN
    -- Thêm cột full_name nếu chưa có (có thể dùng name)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='full_name') THEN
        ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
        -- Copy từ name nếu có
        UPDATE users SET full_name = name WHERE full_name IS NULL;
    END IF;
    
    -- Thêm cột phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    END IF;
    
    -- Thêm cột address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='address') THEN
        ALTER TABLE users ADD COLUMN address TEXT;
    END IF;
    
    -- Thêm cột role
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
    END IF;
    
    -- Thêm cột is_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- CẬP NHẬT BẢNG REVIEWS (Thêm các trường mới)
-- ============================================
DO $$ 
BEGIN
    -- Thêm cột is_approved
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='reviews' AND column_name='is_approved') THEN
        ALTER TABLE reviews ADD COLUMN is_approved BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Đảm bảo rating là INTEGER (1-5) thay vì FLOAT
    -- Giữ nguyên FLOAT nếu đã có, chỉ thêm constraint
END $$;

-- Thêm constraint cho rating (1-5)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'reviews_rating_check'
    ) THEN
        ALTER TABLE reviews ADD CONSTRAINT reviews_rating_check 
        CHECK (rating >= 1 AND rating <= 5);
    END IF;
END $$;

-- Thêm unique constraint cho user-book review
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_user_book_review'
    ) THEN
        ALTER TABLE reviews ADD CONSTRAINT unique_user_book_review 
        UNIQUE (user_id, book_id);
    END IF;
END $$;

-- ============================================
-- BẢNG YÊU CẦU MƯỢN SÁCH (BORROWS)
-- ============================================
CREATE TABLE IF NOT EXISTS borrows (
    borrow_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    request_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_date TIMESTAMP WITH TIME ZONE,
    borrow_date TIMESTAMP WITH TIME ZONE,
    expected_return_date TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_return_date TIMESTAMP WITH TIME ZONE,
    return_date TIMESTAMP WITH TIME ZONE, -- Deprecated, dùng actual_return_date
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'borrowed', 'returned', 'rejected', 'overdue')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_borrows_user ON borrows(user_id);
CREATE INDEX IF NOT EXISTS idx_borrows_book ON borrows(book_id);
CREATE INDEX IF NOT EXISTS idx_borrows_status ON borrows(status);
CREATE INDEX IF NOT EXISTS idx_borrows_request_date ON borrows(request_date);
CREATE INDEX IF NOT EXISTS idx_borrows_borrow_date ON borrows(borrow_date);
CREATE INDEX IF NOT EXISTS idx_borrows_expected_return_date ON borrows(expected_return_date);

-- Trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_borrows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_borrows_updated_at ON borrows;
CREATE TRIGGER trigger_update_borrows_updated_at
    BEFORE UPDATE ON borrows
    FOR EACH ROW
    EXECUTE FUNCTION update_borrows_updated_at();

-- ============================================
-- BẢNG SÁCH YÊU THÍCH (FAVORITES)
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE (user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_book ON favorites(book_id);

-- ============================================
-- BẢNG PHIẾU PHẠT (FINES)
-- ============================================
CREATE TABLE IF NOT EXISTS fines (
    fine_id SERIAL PRIMARY KEY,
    borrow_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    fine_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    fine_reason VARCHAR(255) NOT NULL,
    overdue_days INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'waived', 'cancelled')),
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (borrow_id) REFERENCES borrows(borrow_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fines_borrow ON fines(borrow_id);
CREATE INDEX IF NOT EXISTS idx_fines_user ON fines(user_id);
CREATE INDEX IF NOT EXISTS idx_fines_status ON fines(status);
CREATE INDEX IF NOT EXISTS idx_fines_created_at ON fines(created_at);

-- Trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_fines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_fines_updated_at ON fines;
CREATE TRIGGER trigger_update_fines_updated_at
    BEFORE UPDATE ON fines
    FOR EACH ROW
    EXECUTE FUNCTION update_fines_updated_at();

-- ============================================
-- BẢNG PHIẾU MƯỢN SÁCH (BORROW_RECEIPTS)
-- ============================================
CREATE TABLE IF NOT EXISTS borrow_receipts (
    receipt_id SERIAL PRIMARY KEY,
    borrow_id INTEGER NOT NULL,
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    borrow_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expected_return_date TIMESTAMP WITH TIME ZONE NOT NULL,
    librarian_id INTEGER,
    librarian_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (borrow_id) REFERENCES borrows(borrow_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_borrow_receipts_borrow ON borrow_receipts(borrow_id);
CREATE INDEX IF NOT EXISTS idx_borrow_receipts_receipt_number ON borrow_receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_borrow_receipts_user ON borrow_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_borrow_receipts_created_at ON borrow_receipts(created_at);

-- ============================================
-- CHÈN DỮ LIỆU MẪU
-- ============================================

-- Chèn danh mục
INSERT INTO categories (category_name, category_slug, description) VALUES
('Tất cả', 'all', 'Tất cả các thể loại'),
('Việt Nam', 'vietnamese', 'Sách văn học Việt Nam'),
('Quốc tế', 'international', 'Sách văn học quốc tế'),
('Tiểu thuyết', 'novel', 'Tiểu thuyết'),
('Self-help', 'self-help', 'Sách phát triển bản thân'),
('Khoa học', 'science', 'Sách khoa học'),
('Lịch sử', 'history', 'Sách lịch sử'),
('Viễn tưởng', 'fantasy', 'Sách khoa học viễn tưởng và fantasy')
ON CONFLICT (category_slug) DO NOTHING;

-- Chèn người dùng mẫu (nếu chưa có)
-- Lưu ý: Mật khẩu mặc định: password123 - cần hash bằng bcrypt trong ứng dụng
INSERT INTO users (name, email, hashed_password, full_name, phone, role, is_active) VALUES
('Nguyễn Văn Admin', 'admin@library.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'Nguyễn Văn Admin', '0123456789', 'admin', TRUE),
('Trần Thị Hoa', 'hoa@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'Trần Thị Hoa', '0987654321', 'user', TRUE),
('Lê Văn Nam', 'nam@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'Lê Văn Nam', '0912345678', 'user', TRUE),
('Phạm Thị Mai', 'mai@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'Phạm Thị Mai', '0923456789', 'user', TRUE),
('Hoàng Văn Đức', 'duc@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'Hoàng Văn Đức', '0934567890', 'user', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Chèn 40 cuốn sách mẫu (chỉ chèn nếu chưa có)
-- Lưu ý: Cần điều chỉnh để phù hợp với schema hiện tại
INSERT INTO books (title, author, publisher, publication_year, description, cover_image, total_pages, country, average_rating, total_reviews, isbn) VALUES
('Dune', 'Frank Herbert', 'Ace Books', 1965, 'Câu chuyện khoa học viễn tưởng về một hành tinh sa mạc.', 'a1/1.jpg', 688, 'international', 4.5, 120, '9780441013593'),
('1984', 'George Orwell', 'Penguin', 1949, 'Cuốn sách tiểu thuyết phản địa đàng về sự giám sát.', 'a1/2.jpg', 328, 'international', 5.0, 250, '9780451524935'),
('Pride and Prejudice', 'Jane Austen', 'T. Egerton', 1813, 'Tiểu thuyết lãng mạn kinh điển.', 'a1/3.jpg', 432, 'international', 4.0, 180, '9780141439518'),
('The Hobbit', 'J.R.R. Tolkien', 'Allen & Unwin', 1937, 'Cuộc phiêu lưu của Bilbo Baggins, chuyến đi đầy nguy hiểm để giành lại kho báu từ con rồng Smaug.', 'a1/4.jpg', 310, 'international', 5.0, 200, '9780547928227'),
('Sapiens', 'Yuval Noah Harari', 'Harper', 2011, 'Bộ tiểu thuyết kể lại lịch sử loài người từ thời tiền sử đến hiện đại.', 'a1/5.jpg', 464, 'international', 4.0, 150, '9780062316097'),
('To Kill a Mockingbird', 'Harper Lee', 'J.B. Lippincott', 1960, 'Cuốn sách công lý và phân biệt chủng tộc qua mắt một đứa trẻ.', 'a1/6.jpg', 376, 'international', 4.5, 220, '9780061120084'),
('The Catcher in the Rye', 'J.D. Salinger', 'Little, Brown', 1951, 'Câu chuyện về tuổi trẻ nổi loạn và nỗi cô đơn giữa đời thường.', 'a1/7.png', 234, 'international', 4.0, 140, '9780316769174'),
('Brave New World', 'Aldous Huxley', 'Chatto & Windus', 1932, 'Câu chuyện về thế giới hạnh phúc giả tạo dưới lớp vỏ công nghệ và trật tự.', 'a1/8.jpg', 311, 'international', 5.0, 190, '9780060850524'),
('The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 1925, 'Câu chuyện về giấc mơ Mỹ và sự suy tàn của nó trong thập niên 1920.', 'a2/9.jpg', 180, 'international', 4.5, 170, '9780743273565'),
('Lord of the Flies', 'William Golding', 'Faber and Faber', 1954, 'Câu chuyện về một nhóm trẻ em bị mắc kẹt trên đảo hoang.', 'a2/10.jpg', 224, 'international', 4.0, 130, '9780571056866'),
('Animal Farm', 'George Orwell', 'Secker and Warburg', 1945, 'Câu chuyện ngụ ngôn về cuộc cách mạng của động vật.', 'a2/11.jpg', 112, 'international', 4.5, 200, '9780452284241'),
('The Lord of the Rings', 'J.R.R. Tolkien', 'Allen & Unwin', 1954, 'Cuộc phiêu lưu vĩ đại để tiêu diệt chiếc nhẫn quyền lực.', 'a2/12.jpg', 1178, 'international', 5.0, 300, '9780547928227'),
('Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', 'Bloomsbury', 1997, 'Câu chuyện về cậu bé phù thủy trẻ tuổi.', 'a2/13.jpg', 223, 'international', 4.8, 500, '9780747532699'),
('The Chronicles of Narnia', 'C.S. Lewis', 'Geoffrey Bles', 1950, 'Cuộc phiêu lưu trong thế giới phép thuật Narnia.', 'a2/14.jpg', 767, 'international', 4.5, 280, '9780064471190'),
('War and Peace', 'Leo Tolstoy', 'The Russian Messenger', 1869, 'Tiểu thuyết sử thi về xã hội Nga trong thời kỳ chiến tranh Napoleon.', 'a2/15.jpg', 1225, 'international', 4.8, 350, '9780140447934'),
('The Kite Runner', 'Khaled Hosseini', 'Riverhead Books', 2003, 'Câu chuyện về tình bạn và sự chuộc lỗi ở Afghanistan.', 'a2/16.jpg', 371, 'international', 4.6, 240, '9781594631931'),
('Đất Rừng Phương Nam', 'Đoàn Giỏi', 'NXB Kim Đồng', 1957, 'Câu chuyện về cuộc sống ở miền Tây Nam Bộ.', 'a3/17.jpg', 280, 'vietnamese', 4.5, 150, '9786042091234'),
('Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', 'NXB Kim Đồng', 1941, 'Cuộc phiêu lưu của chú dế mèn.', 'a3/18.jpg', 200, 'vietnamese', 4.8, 200, '9786042091241'),
('Số Đỏ', 'Vũ Trọng Phụng', 'NXB Văn Học', 1936, 'Tiểu thuyết châm biếm xã hội Việt Nam thời thuộc địa.', 'a3/19.jpg', 320, 'vietnamese', 4.7, 180, '9786042091258'),
('Chí Phèo', 'Nam Cao', 'NXB Văn Học', 1941, 'Truyện ngắn về số phận người nông dân.', 'a3/20.jpg', 150, 'vietnamese', 4.6, 160, '9786042091265'),
('Tắt Đèn', 'Ngô Tất Tố', 'NXB Văn Học', 1939, 'Tiểu thuyết về cuộc sống nông thôn Việt Nam.', 'a3/21.jpg', 250, 'vietnamese', 4.5, 140, '9786042091272'),
('Những Ngôi Sao Xa Xôi', 'Lê Minh Khuê', 'NXB Kim Đồng', 1973, 'Truyện ngắn về cuộc sống thanh niên.', 'a3/22.jpg', 180, 'vietnamese', 4.4, 120, '9786042091289'),
('Vợ Nhặt', 'Kim Lân', 'NXB Văn Học', 1962, 'Truyện ngắn về tình người trong hoàn cảnh khó khăn.', 'a3/23.jpg', 100, 'vietnamese', 4.5, 130, '9786042091296'),
('Làng', 'Kim Lân', 'NXB Văn Học', 1948, 'Truyện ngắn về tình yêu quê hương.', 'a3/24.jpg', 120, 'vietnamese', 4.3, 110, '9786042091302'),
('Đắc Nhân Tâm', 'Dale Carnegie', 'NXB Trẻ', 1936, 'Nghệ thuật thu phục lòng người.', 'a4/25.jpg', 320, 'international', 4.5, 400, '9780671027032'),
('Nhà Giả Kim', 'Paulo Coelho', 'NXB Hội Nhà Văn', 1988, 'Hành trình tìm kiếm kho báu và ý nghĩa cuộc sống.', 'a4/26.jpg', 163, 'international', 4.3, 350, '9780061122415'),
('Tư Duy Nhanh và Chậm', 'Daniel Kahneman', 'NXB Trẻ', 2011, 'Khám phá cách bộ não hoạt động.', 'a4/27.jpg', 499, 'international', 4.6, 280, '9780374533557'),
('Sức Mạnh Của Thói Quen', 'Charles Duhigg', 'NXB Trẻ', 2012, 'Tại sao chúng ta làm những gì chúng ta làm trong cuộc sống và kinh doanh.', 'a4/28.jpg', 371, 'international', 4.4, 250, '9780812981605'),
('Atomic Habits', 'James Clear', 'Avery', 2018, 'Xây dựng thói quen tốt và loại bỏ thói quen xấu.', 'a4/29.jpg', 320, 'international', 4.7, 300, '9780735211292'),
('The 7 Habits of Highly Effective People', 'Stephen R. Covey', 'Free Press', 1989, '7 thói quen của người thành đạt.', 'a4/30.jpg', 372, 'international', 4.5, 380, '9780743269513'),
('Think and Grow Rich', 'Napoleon Hill', 'The Ralston Society', 1937, 'Nguyên tắc thành công trong cuộc sống.', 'a4/31.jpg', 320, 'international', 4.3, 320, '9781585424337'),
('Rich Dad Poor Dad', 'Robert Kiyosaki', 'Warner Books', 1997, 'Bài học về tài chính cá nhân.', 'a4/32.jpg', 207, 'international', 4.2, 290, '9781612681139'),
('A Brief History of Time', 'Stephen Hawking', 'Bantam Books', 1988, 'Lịch sử vũ trụ từ Big Bang đến lỗ đen.', 'a5/33.jpg', 256, 'international', 4.5, 200, '9780553380163'),
('Cosmos', 'Carl Sagan', 'Random House', 1980, 'Hành trình khám phá vũ trụ.', 'a5/34.jpg', 384, 'international', 4.7, 180, '9780345331359'),
('The Selfish Gene', 'Richard Dawkins', 'Oxford University Press', 1976, 'Lý thuyết về gen ích kỷ.', 'a5/35.jpg', 360, 'international', 4.4, 150, '9780192860927'),
('Guns, Germs, and Steel', 'Jared Diamond', 'W. W. Norton', 1997, 'Lịch sử nhân loại trong 13,000 năm.', 'a5/36.jpg', 480, 'international', 4.6, 220, '9780393317558'),
('21 Lessons for the 21st Century', 'Yuval Noah Harari', 'Spiegel & Grau', 2018, '21 bài học về những thách thức lớn nhất của thế kỷ 21.', 'a5/37.jpg', 372, 'international', 4.4, 150, '9780525512172'),
('Homo Deus', 'Yuval Noah Harari', 'Harper', 2015, 'Lịch sử tương lai của loài người.', 'a5/38.jpg', 464, 'international', 4.2, 140, '9780062464316'),
('The Art of War', 'Sun Tzu', 'Various', -500, 'Nghệ thuật chiến tranh và chiến lược.', 'a5/39.jpg', 273, 'international', 4.5, 250, '9780486425576'),
('The Prince', 'Niccolò Machiavelli', 'Antonio Blado d''Asola', 1532, 'Chính trị và quyền lực.', 'a5/40.jpg', 140, 'international', 4.3, 180, '9780486272740')
ON CONFLICT (isbn) DO NOTHING;

-- Liên kết sách với danh mục (cần lấy book_id và category_id từ dữ liệu đã chèn)
-- Lưu ý: Cần chạy sau khi đã chèn sách và danh mục
-- INSERT INTO book_categories (book_id, category_id) 
-- SELECT b.id, c.category_id 
-- FROM books b, categories c 
-- WHERE (b.title = 'Dune' AND c.category_slug IN ('international', 'fantasy'))
--    OR (b.title = '1984' AND c.category_slug IN ('international', 'novel'))
--    ... (thêm các điều kiện khác)
-- ON CONFLICT (book_id, category_id) DO NOTHING;

-- ============================================
-- TẠO VIEWS HỮU ÍCH
-- ============================================

-- View sách phổ biến
CREATE OR REPLACE VIEW v_popular_books AS
SELECT 
    b.id AS book_id,
    b.title,
    b.author,
    b.cover_image,
    b.average_rating,
    b.total_reviews,
    b.total_borrows,
    (b.total_borrows + b.total_reviews * 2) AS popularity_score
FROM books b
WHERE b.is_available = TRUE
ORDER BY popularity_score DESC, b.average_rating DESC;

-- View sách mới
CREATE OR REPLACE VIEW v_new_books AS
SELECT 
    b.id AS book_id,
    b.title,
    b.author,
    b.cover_image,
    b.average_rating,
    b.created_at
FROM books b
WHERE b.is_available = TRUE
ORDER BY b.created_at DESC
LIMIT 20;

-- View thống kê người dùng
CREATE OR REPLACE VIEW v_user_stats AS
SELECT 
    u.id AS user_id,
    COALESCE(u.full_name, u.name) AS full_name,
    u.email,
    COUNT(DISTINCT br.borrow_id) AS total_borrows,
    COUNT(DISTINCT r.id) AS total_reviews,
    COUNT(DISTINCT f.favorite_id) AS total_favorites,
    COALESCE(SUM(CASE WHEN fi.status = 'unpaid' THEN fi.fine_amount ELSE 0 END), 0) AS total_unpaid_fines
FROM users u
LEFT JOIN borrows br ON u.id = br.user_id
LEFT JOIN reviews r ON u.id = r.user_id
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN fines fi ON u.id = fi.user_id
GROUP BY u.id, u.full_name, u.name, u.email;

-- View phiếu mượn chi tiết
CREATE OR REPLACE VIEW v_borrow_details AS
SELECT 
    br.receipt_id,
    br.receipt_number,
    u.id AS user_id,
    COALESCE(u.full_name, u.name) AS user_name,
    u.email AS user_email,
    b.id AS book_id,
    b.title AS book_title,
    b.author AS book_author,
    br.borrow_date,
    br.expected_return_date,
    bwr.actual_return_date,
    EXTRACT(DAY FROM (COALESCE(bwr.actual_return_date, CURRENT_TIMESTAMP) - br.expected_return_date))::INTEGER AS days_overdue,
    bwr.status AS borrow_status,
    br.librarian_name,
    br.created_at AS receipt_created_at
FROM borrow_receipts br
INNER JOIN borrows bwr ON br.borrow_id = bwr.borrow_id
INNER JOIN users u ON br.user_id = u.id
INNER JOIN books b ON br.book_id = b.id;

-- View phiếu phạt chi tiết
CREATE OR REPLACE VIEW v_fine_details AS
SELECT 
    f.fine_id,
    f.borrow_id,
    br.receipt_number,
    u.id AS user_id,
    COALESCE(u.full_name, u.name) AS user_name,
    u.email AS user_email,
    b.title AS book_title,
    f.fine_amount,
    f.fine_reason,
    f.overdue_days,
    f.status AS fine_status,
    f.payment_date,
    f.payment_method,
    f.created_at AS fine_created_at,
    br.expected_return_date,
    bwr.actual_return_date
FROM fines f
INNER JOIN borrows bwr ON f.borrow_id = bwr.borrow_id
INNER JOIN users u ON f.user_id = u.id
LEFT JOIN borrow_receipts br ON f.borrow_id = br.borrow_id
LEFT JOIN books b ON bwr.book_id = b.id;

-- ============================================
-- FUNCTIONS VÀ PROCEDURES
-- ============================================

-- Function tạo số phiếu mượn tự động
CREATE OR REPLACE FUNCTION fn_generate_receipt_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    v_year VARCHAR(4);
    v_sequence INTEGER;
    v_receipt_number VARCHAR(50);
BEGIN
    v_year := EXTRACT(YEAR FROM CURRENT_TIMESTAMP)::VARCHAR;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 10) AS INTEGER)), 0) + 1
    INTO v_sequence
    FROM borrow_receipts
    WHERE receipt_number LIKE 'PM-' || v_year || '-%';
    
    v_receipt_number := 'PM-' || v_year || '-' || LPAD(v_sequence::VARCHAR, 3, '0');
    
    RETURN v_receipt_number;
END;
$$ LANGUAGE plpgsql;

-- Function tự động tạo phiếu phạt cho sách quá hạn
CREATE OR REPLACE FUNCTION sp_create_overdue_fines(daily_fine_amount DECIMAL(10,2))
RETURNS INTEGER AS $$
DECLARE
    v_borrow_id INTEGER;
    v_user_id INTEGER;
    v_overdue_days INTEGER;
    v_fine_amount DECIMAL(10,2);
    v_count INTEGER := 0;
    cur CURSOR FOR
        SELECT 
            b.borrow_id,
            b.user_id,
            EXTRACT(DAY FROM (CURRENT_DATE - DATE(b.expected_return_date)))::INTEGER AS overdue_days
        FROM borrows b
        WHERE b.status IN ('borrowed', 'overdue')
        AND DATE(b.expected_return_date) < CURRENT_DATE
        AND NOT EXISTS (
            SELECT 1 FROM fines f 
            WHERE f.borrow_id = b.borrow_id 
            AND f.status = 'unpaid'
        );
BEGIN
    FOR rec IN cur LOOP
        v_borrow_id := rec.borrow_id;
        v_user_id := rec.user_id;
        v_overdue_days := rec.overdue_days;
        v_fine_amount := v_overdue_days * daily_fine_amount;
        
        INSERT INTO fines (borrow_id, user_id, fine_amount, fine_reason, overdue_days, status)
        VALUES (v_borrow_id, v_user_id, v_fine_amount, 'Mượn sách quá hạn', v_overdue_days, 'unpaid')
        ON CONFLICT DO NOTHING;
        
        UPDATE borrows SET status = 'overdue' WHERE borrow_id = v_borrow_id;
        v_count := v_count + 1;
    END LOOP;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function thanh toán phiếu phạt
CREATE OR REPLACE FUNCTION sp_pay_fine(
    p_fine_id INTEGER,
    p_payment_method VARCHAR(50),
    p_payment_reference VARCHAR(100)
)
RETURNS INTEGER AS $$
DECLARE
    v_affected INTEGER;
BEGIN
    UPDATE fines
    SET 
        status = 'paid',
        payment_date = CURRENT_TIMESTAMP,
        payment_method = p_payment_method,
        payment_reference = p_payment_reference,
        updated_at = CURRENT_TIMESTAMP
    WHERE fine_id = p_fine_id AND status = 'unpaid';
    
    GET DIAGNOSTICS v_affected = ROW_COUNT;
    RETURN v_affected;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS TỰ ĐỘNG CẬP NHẬT THỐNG KÊ
-- ============================================

-- Trigger cập nhật average_rating và total_reviews khi có review mới
CREATE OR REPLACE FUNCTION update_book_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE books
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE book_id = NEW.book_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE book_id = NEW.book_id
        )
    WHERE id = NEW.book_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_book_rating_stats ON reviews;
CREATE TRIGGER trigger_update_book_rating_stats
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_book_rating_stats();

-- Trigger cập nhật total_borrows khi có borrow mới
CREATE OR REPLACE FUNCTION update_book_borrow_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE books
    SET total_borrows = (
        SELECT COUNT(*)
        FROM borrows
        WHERE book_id = NEW.book_id 
        AND status IN ('borrowed', 'returned')
    )
    WHERE id = NEW.book_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_book_borrow_stats ON borrows;
CREATE TRIGGER trigger_update_book_borrow_stats
    AFTER INSERT OR UPDATE ON borrows
    FOR EACH ROW
    EXECUTE FUNCTION update_book_borrow_stats();

-- ============================================
-- KẾT THÚC
-- ============================================

