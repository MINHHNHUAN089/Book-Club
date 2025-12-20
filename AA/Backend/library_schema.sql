CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_users_id ON users(id);
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);

-- ============================================
-- BẢNG AUTHORS (Tác giả)
-- ============================================
CREATE TABLE IF NOT EXISTS authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    followers_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_authors_id ON authors(id);
CREATE INDEX IF NOT EXISTS ix_authors_name ON authors(name);

-- ============================================
-- BẢNG BOOKS (Sách)
-- ============================================
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    cover_url VARCHAR(500),
    file_url VARCHAR(500),
    description TEXT,
    published_date VARCHAR(50),
    page_count INTEGER,
    google_books_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_books_id ON books(id);
CREATE INDEX IF NOT EXISTS ix_books_title ON books(title);
CREATE INDEX IF NOT EXISTS ix_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS ix_books_google_books_id ON books(google_books_id);

-- ============================================
-- BẢNG BOOK_AUTHOR (Liên kết Sách - Tác giả)
-- ============================================
CREATE TABLE IF NOT EXISTS book_author (
    book_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

-- ============================================
-- BẢNG USER_BOOKS (Sách của người dùng)
-- ============================================
CREATE TABLE IF NOT EXISTS user_books (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'want_to_read',
    progress INTEGER DEFAULT 0,
    rating FLOAT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_user_books_id ON user_books(id);
CREATE INDEX IF NOT EXISTS ix_user_books_user_id ON user_books(user_id);
CREATE INDEX IF NOT EXISTS ix_user_books_book_id ON user_books(book_id);

-- ============================================
-- BẢNG REVIEWS (Đánh giá)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    rating FLOAT NOT NULL,
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_reviews_id ON reviews(id);
CREATE INDEX IF NOT EXISTS ix_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS ix_reviews_book_id ON reviews(book_id);

-- ============================================
-- BẢNG GROUPS (Câu lạc bộ đọc sách)
-- ============================================
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    topic VARCHAR(100),
    cover_url VARCHAR(500),
    current_book_id INTEGER,
    members_count INTEGER DEFAULT 0,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (current_book_id) REFERENCES books(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS ix_groups_id ON groups(id);

-- ============================================
-- BẢNG USER_GROUP (Liên kết User - Group)
-- ============================================
CREATE TABLE IF NOT EXISTS user_group (
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- ============================================
-- BẢNG CHALLENGES (Thử thách đọc sách)
-- ============================================
CREATE TABLE IF NOT EXISTS challenges (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_url VARCHAR(500),
    target_books INTEGER NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    badge VARCHAR(100),
    tags VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_challenges_id ON challenges(id);

-- ============================================
-- BẢNG USER_CHALLENGE (Liên kết User - Challenge)
-- ============================================
CREATE TABLE IF NOT EXISTS user_challenge (
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id, challenge_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

-- ============================================
-- BẢNG USER_AUTHOR_FOLLOW (Theo dõi tác giả)
-- ============================================
CREATE TABLE IF NOT EXISTS user_author_follow (
    user_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, author_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

-- ============================================
-- BẢNG USER_BOOK_FOLLOW (Theo dõi sách)
-- ============================================
CREATE TABLE IF NOT EXISTS user_book_follow (
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, book_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_user_book_follow_user_id ON user_book_follow(user_id);
CREATE INDEX IF NOT EXISTS ix_user_book_follow_book_id ON user_book_follow(book_id);

-- ============================================
-- BẢNG GROUP_DISCUSSIONS (Thảo luận trong group)
-- ============================================
CREATE TABLE IF NOT EXISTS group_discussions (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_group_discussions_id ON group_discussions(id);

-- ============================================
-- BẢNG GROUP_SCHEDULES (Lịch trình group)
-- ============================================
CREATE TABLE IF NOT EXISTS group_schedules (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS ix_group_schedules_id ON group_schedules(id);

-- ============================================
-- BẢNG GROUP_EVENTS (Sự kiện group)
-- ============================================
CREATE TABLE IF NOT EXISTS group_events (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS ix_group_events_id ON group_events(id);

-- ============================================
-- BẢNG AUTHOR_NOTIFICATIONS (Thông báo tác giả)
-- ============================================
CREATE TABLE IF NOT EXISTS author_notifications (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'new_book',
    book_id INTEGER,
    cover_url VARCHAR(500),
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS ix_author_notifications_id ON author_notifications(id);

-- ============================================
-- KẾT THÚC SCHEMA
-- ============================================

