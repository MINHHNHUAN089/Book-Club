"""
Script để thêm 40 cuốn sách vào database
Chạy: python insert_40_books.py
"""
import sys
import io
# Set UTF-8 encoding for output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.models import Book, Author, User
from app.auth import get_password_hash
from sqlalchemy.orm import joinedload

# Dữ liệu 40 cuốn sách
BOOKS_DATA = [
    ('Dune', 'Frank Herbert', 'Ace Books', 1965, 'Câu chuyện khoa học viễn tưởng về một hành tinh sa mạc.', 'a1/1.jpg', 688, 'international', 4.5, 120),
    ('1984', 'George Orwell', 'Penguin', 1949, 'Cuốn sách tiểu thuyết phản địa đàng về sự giám sát.', 'a1/2.jpg', 328, 'international', 5.0, 250),
    ('Pride and Prejudice', 'Jane Austen', 'T. Egerton', 1813, 'Tiểu thuyết lãng mạn kinh điển.', 'a1/3.jpg', 432, 'international', 4.0, 180),
    ('The Hobbit', 'J.R.R. Tolkien', 'Allen & Unwin', 1937, 'Cuộc phiêu lưu của Bilbo Baggins, chuyến đi đầy nguy hiểm để giành lại kho báu từ con rồng Smaug.', 'a1/4.jpg', 310, 'international', 5.0, 200),
    ('Sapiens', 'Yuval Noah Harari', 'Harper', 2011, 'Bộ tiểu thuyết kể lại lịch sử loài người từ thời tiền sử đến hiện đại.', 'a1/5.jpg', 464, 'international', 4.0, 150),
    ('To Kill a Mockingbird', 'Harper Lee', 'J.B. Lippincott', 1960, 'Cuốn sách công lý và phân biệt chủng tộc qua mắt một đứa trẻ.', 'a1/6.jpg', 376, 'international', 4.5, 220),
    ('The Catcher in the Rye', 'J.D. Salinger', 'Little, Brown', 1951, 'Câu chuyện về tuổi trẻ nổi loạn và nỗi cô đơn giữa đời thường.', 'a1/7.png', 234, 'international', 4.0, 140),
    ('Brave New World', 'Aldous Huxley', 'Chatto & Windus', 1932, 'Câu chuyện về thế giới hạnh phúc giả tạo dưới lớp vỏ công nghệ và trật tự.', 'a1/8.jpg', 311, 'international', 5.0, 190),
    ('The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 1925, 'Câu chuyện về giấc mơ Mỹ và sự suy tàn của nó trong thập niên 1920.', 'a2/9.jpg', 180, 'international', 4.5, 170),
    ('Lord of the Flies', 'William Golding', 'Faber and Faber', 1954, 'Câu chuyện về một nhóm trẻ em bị mắc kẹt trên đảo hoang.', 'a2/10.jpg', 224, 'international', 4.0, 130),
    ('Animal Farm', 'George Orwell', 'Secker and Warburg', 1945, 'Câu chuyện ngụ ngôn về cuộc cách mạng của động vật.', 'a2/11.jpg', 112, 'international', 4.5, 200),
    ('The Lord of the Rings', 'J.R.R. Tolkien', 'Allen & Unwin', 1954, 'Cuộc phiêu lưu vĩ đại để tiêu diệt chiếc nhẫn quyền lực.', 'a2/12.jpg', 1178, 'international', 5.0, 300),
    ('Harry Potter and the Philosopher\'s Stone', 'J.K. Rowling', 'Bloomsbury', 1997, 'Câu chuyện về cậu bé phù thủy trẻ tuổi.', 'a2/13.jpg', 223, 'international', 4.8, 500),
    ('The Chronicles of Narnia', 'C.S. Lewis', 'Geoffrey Bles', 1950, 'Cuộc phiêu lưu trong thế giới phép thuật Narnia.', 'a2/14.jpg', 767, 'international', 4.5, 280),
    ('War and Peace', 'Leo Tolstoy', 'The Russian Messenger', 1869, 'Tiểu thuyết sử thi về xã hội Nga trong thời kỳ chiến tranh Napoleon.', 'a2/15.jpg', 1225, 'international', 4.8, 350),
    ('The Kite Runner', 'Khaled Hosseini', 'Riverhead Books', 2003, 'Câu chuyện về tình bạn và sự chuộc lỗi ở Afghanistan.', 'a2/16.jpg', 371, 'international', 4.6, 240),
    ('Đất Rừng Phương Nam', 'Đoàn Giỏi', 'NXB Kim Đồng', 1957, 'Câu chuyện về cuộc sống ở miền Tây Nam Bộ.', 'a3/17.jpg', 280, 'vietnamese', 4.5, 150),
    ('Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', 'NXB Kim Đồng', 1941, 'Cuộc phiêu lưu của chú dế mèn.', 'a3/18.jpg', 200, 'vietnamese', 4.8, 200),
    ('Số Đỏ', 'Vũ Trọng Phụng', 'NXB Văn Học', 1936, 'Tiểu thuyết châm biếm xã hội Việt Nam thời thuộc địa.', 'a3/19.jpg', 320, 'vietnamese', 4.7, 180),
    ('Chí Phèo', 'Nam Cao', 'NXB Văn Học', 1941, 'Truyện ngắn về số phận người nông dân.', 'a3/20.jpg', 150, 'vietnamese', 4.6, 160),
    ('Tắt Đèn', 'Ngô Tất Tố', 'NXB Văn Học', 1939, 'Tiểu thuyết về cuộc sống nông thôn Việt Nam.', 'a3/21.jpg', 250, 'vietnamese', 4.5, 140),
    ('Những Ngôi Sao Xa Xôi', 'Lê Minh Khuê', 'NXB Kim Đồng', 1973, 'Truyện ngắn về cuộc sống thanh niên.', 'a3/22.jpg', 180, 'vietnamese', 4.4, 120),
    ('Vợ Nhặt', 'Kim Lân', 'NXB Văn Học', 1962, 'Truyện ngắn về tình người trong hoàn cảnh khó khăn.', 'a3/23.jpg', 100, 'vietnamese', 4.5, 130),
    ('Làng', 'Kim Lân', 'NXB Văn Học', 1948, 'Truyện ngắn về tình yêu quê hương.', 'a3/24.jpg', 120, 'vietnamese', 4.3, 110),
    ('Đắc Nhân Tâm', 'Dale Carnegie', 'NXB Trẻ', 1936, 'Nghệ thuật thu phục lòng người.', 'a4/25.jpg', 320, 'international', 4.5, 400),
    ('Nhà Giả Kim', 'Paulo Coelho', 'NXB Hội Nhà Văn', 1988, 'Hành trình tìm kiếm kho báu và ý nghĩa cuộc sống.', 'a4/26.jpg', 163, 'international', 4.3, 350),
    ('Tư Duy Nhanh và Chậm', 'Daniel Kahneman', 'NXB Trẻ', 2011, 'Khám phá cách bộ não hoạt động.', 'a4/27.jpg', 499, 'international', 4.6, 280),
    ('Sức Mạnh Của Thói Quen', 'Charles Duhigg', 'NXB Trẻ', 2012, 'Tại sao chúng ta làm những gì chúng ta làm trong cuộc sống và kinh doanh.', 'a4/28.jpg', 371, 'international', 4.4, 250),
    ('Atomic Habits', 'James Clear', 'Avery', 2018, 'Xây dựng thói quen tốt và loại bỏ thói quen xấu.', 'a4/29.jpg', 320, 'international', 4.7, 300),
    ('The 7 Habits of Highly Effective People', 'Stephen R. Covey', 'Free Press', 1989, '7 thói quen của người thành đạt.', 'a4/30.jpg', 372, 'international', 4.5, 380),
    ('Think and Grow Rich', 'Napoleon Hill', 'The Ralston Society', 1937, 'Nguyên tắc thành công trong cuộc sống.', 'a4/31.jpg', 320, 'international', 4.3, 320),
    ('Rich Dad Poor Dad', 'Robert Kiyosaki', 'Warner Books', 1997, 'Bài học về tài chính cá nhân.', 'a4/32.jpg', 207, 'international', 4.2, 290),
    ('A Brief History of Time', 'Stephen Hawking', 'Bantam Books', 1988, 'Lịch sử vũ trụ từ Big Bang đến lỗ đen.', 'a5/33.jpg', 256, 'international', 4.5, 200),
    ('Cosmos', 'Carl Sagan', 'Random House', 1980, 'Hành trình khám phá vũ trụ.', 'a5/34.jpg', 384, 'international', 4.7, 180),
    ('The Selfish Gene', 'Richard Dawkins', 'Oxford University Press', 1976, 'Lý thuyết về gen ích kỷ.', 'a5/35.jpg', 360, 'international', 4.4, 150),
    ('Guns, Germs, and Steel', 'Jared Diamond', 'W. W. Norton', 1997, 'Lịch sử nhân loại trong 13,000 năm.', 'a5/36.jpg', 480, 'international', 4.6, 220),
    ('21 Lessons for the 21st Century', 'Yuval Noah Harari', 'Spiegel & Grau', 2018, '21 bài học về những thách thức lớn nhất của thế kỷ 21.', 'a5/37.jpg', 372, 'international', 4.4, 150),
    ('Homo Deus', 'Yuval Noah Harari', 'Harper', 2015, 'Lịch sử tương lai của loài người.', 'a5/38.jpg', 464, 'international', 4.2, 140),
    ('The Art of War', 'Sun Tzu', 'Various', -500, 'Nghệ thuật chiến tranh và chiến lược.', 'a5/39.jpg', 273, 'international', 4.5, 250),
    ('The Prince', 'Niccolò Machiavelli', 'Antonio Blado d\'Asola', 1532, 'Chính trị và quyền lực.', 'a5/40.jpg', 140, 'international', 4.3, 180),
]

def insert_40_books():
    """Insert 40 books into database"""
    db = SessionLocal()
    try:
        print("Bat dau them 40 cuon sach...\n")
        
        # Tạo users mẫu nếu chưa có
        print("Tao users mau...")
        users_data = [
            ('Nguyễn Văn Admin', 'admin@library.com', 'password123'),
            ('Trần Thị Hoa', 'hoa@example.com', 'password123'),
            ('Lê Văn Nam', 'nam@example.com', 'password123'),
            ('Phạm Thị Mai', 'mai@example.com', 'password123'),
            ('Hoàng Văn Đức', 'duc@example.com', 'password123'),
        ]
        
        for name, email, password in users_data:
            existing_user = db.query(User).filter(User.email == email).first()
            if not existing_user:
                hashed_password = get_password_hash(password)
                user = User(
                    name=name,
                    email=email,
                    hashed_password=hashed_password,
                    role="admin" if email == "admin@library.com" else "user",
                    is_active=True
                )
                db.add(user)
                print(f"  [OK] Tao user: {name} ({email})")
            else:
                print(f"  [INFO] User da co: {name}")
        
        db.commit()
        print(f"\nThem sach...\n")
        
        books_created = 0
        authors_created = 0
        
        for book_data in BOOKS_DATA:
            title, author_name, publisher, year, description, cover_image, pages, country, rating, reviews = book_data
            
            # Kiểm tra sách đã tồn tại chưa
            existing_book = db.query(Book).filter(Book.title == title).first()
            if existing_book:
                print(f"  [INFO] Da co: {title}")
                continue
            
            # Tìm hoặc tạo author
            author = db.query(Author).filter(Author.name == author_name).first()
            if not author:
                author = Author(name=author_name)
                db.add(author)
                db.flush()
                authors_created += 1
                print(f"  [OK] Tao author: {author_name}")
            
            # Tạo book
            book = Book(
                title=title,
                description=description,
                cover_url=f"http://localhost:8000/static/images/books/{cover_image}" if cover_image else None,
                published_date=str(year) if year > 0 else None,
                page_count=pages,
            )
            
            # Link author to book
            book.authors.append(author)
            
            db.add(book)
            books_created += 1
            print(f"  [OK] Tao sach: {title}")
        
        db.commit()
        
        print(f"\nKET QUA:")
        print(f"   [OK] Da tao {books_created} cuon sach moi")
        print(f"   [OK] Da tao {authors_created} tac gia moi")
        print(f"   [OK] Tong cong: {len(BOOKS_DATA)} cuon sach trong database")
        
    except Exception as e:
        print(f"[ERROR] Loi: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    insert_40_books()

