"""
Seed data script for Book Club database
Run this script to populate the database with sample data
"""
from sqlalchemy.orm import Session
from sqlalchemy import insert
from app.database import SessionLocal, engine, Base
from app.models import (
    User, Book, Author, UserBook, Review, Group, Challenge,
    book_author_association, user_challenge_association
)
from app.auth import get_password_hash
from datetime import datetime, timezone, timedelta

# Create all tables
Base.metadata.create_all(bind=engine)

db: Session = SessionLocal()


def seed_data():
    """Seed the database with sample data"""
    print("🌱 Starting database seeding...")
    
    try:
        # Clear existing data (optional - comment out if you want to keep existing data)
        # db.query(UserBook).delete()
        # db.query(Review).delete()
        # db.query(Challenge).delete()
        # db.query(Group).delete()
        # db.query(Book).delete()
        # db.query(Author).delete()
        # db.query(User).delete()
        # db.commit()
        
        # Create Users
        print("📝 Creating users...")
        users = [
            User(
                name="John Doe",
                email="john@example.com",
                hashed_password=get_password_hash("password123"),
                avatar_url="https://i.pravatar.cc/150?img=1"
            ),
            User(
                name="Jane Smith",
                email="jane@example.com",
                hashed_password=get_password_hash("password123"),
                avatar_url="https://i.pravatar.cc/150?img=2"
            ),
            User(
                name="Bob Johnson",
                email="bob@example.com",
                hashed_password=get_password_hash("password123"),
                avatar_url="https://i.pravatar.cc/150?img=3"
            ),
        ]
        for user in users:
            existing = db.query(User).filter(User.email == user.email).first()
            if not existing:
                db.add(user)
        db.commit()
        print(f"✅ Created {len(users)} users")
        
        # Get users for relationships
        john = db.query(User).filter(User.email == "john@example.com").first()
        jane = db.query(User).filter(User.email == "jane@example.com").first()
        bob = db.query(User).filter(User.email == "bob@example.com").first()
        
        # Create Authors
        print("✍️ Creating authors...")
        authors = [
            Author(
                name="J.K. Rowling",
                bio="British author, best known for the Harry Potter series",
                avatar_url="https://i.pravatar.cc/150?img=10",
                followers_count=0
            ),
            Author(
                name="George R.R. Martin",
                bio="American novelist and short story writer, author of A Song of Ice and Fire",
                avatar_url="https://i.pravatar.cc/150?img=11",
                followers_count=0
            ),
            Author(
                name="Stephen King",
                bio="American author of horror, supernatural fiction, suspense, and fantasy novels",
                avatar_url="https://i.pravatar.cc/150?img=12",
                followers_count=0
            ),
        ]
        for author in authors:
            existing = db.query(Author).filter(Author.name == author.name).first()
            if not existing:
                db.add(author)
        db.commit()
        print(f"✅ Created {len(authors)} authors")
        
        # Get authors for relationships
        rowling = db.query(Author).filter(Author.name == "J.K. Rowling").first()
        martin = db.query(Author).filter(Author.name == "George R.R. Martin").first()
        king = db.query(Author).filter(Author.name == "Stephen King").first()
        
        # Create Books
        print("📚 Creating books...")
        books = [
            Book(
                title="Harry Potter and the Philosopher's Stone",
                isbn="9780747532699",
                description="The first book in the Harry Potter series",
                published_date="1997-06-26",
                page_count=223,
                cover_url="https://images-na.ssl-images-amazon.com/images/I/81YOuOGFCJL.jpg"
            ),
            Book(
                title="A Game of Thrones",
                isbn="9780553103540",
                description="The first book in A Song of Ice and Fire series",
                published_date="1996-08-01",
                page_count=694,
                cover_url="https://images-na.ssl-images-amazon.com/images/I/91dSMhdIzTL.jpg"
            ),
            Book(
                title="The Shining",
                isbn="9780307743657",
                description="A horror novel about a writer's descent into madness",
                published_date="1977-01-28",
                page_count=447,
                cover_url="https://images-na.ssl-images-amazon.com/images/I/81YOuOGFCJL.jpg"
            ),
            Book(
                title="Harry Potter and the Chamber of Secrets",
                isbn="9780747538493",
                description="The second book in the Harry Potter series",
                published_date="1998-07-02",
                page_count=251,
                cover_url="https://images-na.ssl-images-amazon.com/images/I/81YOuOGFCJL.jpg"
            ),
        ]
        for book in books:
            existing = db.query(Book).filter(Book.isbn == book.isbn).first()
            if not existing:
                db.add(book)
        db.commit()
        print(f"✅ Created {len(books)} books")
        
        # Get books for relationships
        hp1 = db.query(Book).filter(Book.isbn == "9780747532699").first()
        got = db.query(Book).filter(Book.isbn == "9780553103540").first()
        shining = db.query(Book).filter(Book.isbn == "9780307743657").first()
        hp2 = db.query(Book).filter(Book.isbn == "9780747538493").first()
        
        # Link books to authors
        print("🔗 Linking books to authors...")
        if hp1 and rowling:
            hp1.authors.append(rowling)
        if hp2 and rowling:
            hp2.authors.append(rowling)
        if got and martin:
            got.authors.append(martin)
        if shining and king:
            shining.authors.append(king)
        db.commit()
        print("✅ Linked books to authors")
        
        # Create UserBooks
        print("📖 Creating user books...")
        user_books = [
            UserBook(
                user_id=john.id,
                book_id=hp1.id,
                status="completed",
                progress=100,
                rating=5.0,
                started_at=datetime.now(timezone.utc) - timedelta(days=30),
                completed_at=datetime.now(timezone.utc) - timedelta(days=20)
            ),
            UserBook(
                user_id=john.id,
                book_id=got.id,
                status="reading",
                progress=45,
                rating=None,
                started_at=datetime.now(timezone.utc) - timedelta(days=10)
            ),
            UserBook(
                user_id=jane.id,
                book_id=hp1.id,
                status="completed",
                progress=100,
                rating=4.5,
                started_at=datetime.now(timezone.utc) - timedelta(days=25),
                completed_at=datetime.now(timezone.utc) - timedelta(days=15)
            ),
            UserBook(
                user_id=jane.id,
                book_id=hp2.id,
                status="want_to_read",
                progress=0,
                rating=None
            ),
            UserBook(
                user_id=bob.id,
                book_id=shining.id,
                status="completed",
                progress=100,
                rating=4.0,
                started_at=datetime.now(timezone.utc) - timedelta(days=40),
                completed_at=datetime.now(timezone.utc) - timedelta(days=30)
            ),
        ]
        for user_book in user_books:
            existing = db.query(UserBook).filter(
                UserBook.user_id == user_book.user_id,
                UserBook.book_id == user_book.book_id
            ).first()
            if not existing:
                db.add(user_book)
        db.commit()
        print(f"✅ Created {len(user_books)} user books")
        
        # Create Reviews
        print("⭐ Creating reviews...")
        reviews = [
            Review(
                user_id=john.id,
                book_id=hp1.id,
                rating=5.0,
                review_text="An amazing start to an incredible series! The world-building is fantastic."
            ),
            Review(
                user_id=jane.id,
                book_id=hp1.id,
                rating=4.5,
                review_text="Great book, loved the characters and the magical world."
            ),
            Review(
                user_id=bob.id,
                book_id=shining.id,
                rating=4.0,
                review_text="Classic horror novel, very suspenseful and well-written."
            ),
        ]
        for review in reviews:
            existing = db.query(Review).filter(
                Review.user_id == review.user_id,
                Review.book_id == review.book_id
            ).first()
            if not existing:
                db.add(review)
        db.commit()
        print(f"✅ Created {len(reviews)} reviews")
        
        # Create Groups
        print("👥 Creating groups...")
        groups = [
            Group(
                name="Fantasy Book Club",
                description="A group for fantasy book lovers",
                topic="Fantasy",
                cover_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
                current_book_id=got.id,
                created_by=john.id,
                members_count=0
            ),
            Group(
                name="Horror Readers",
                description="Discussing the best horror novels",
                topic="Horror",
                cover_url="https://images.unsplash.com/photo-1517842645767-c639042777db?w=500",
                created_by=bob.id,
                members_count=0
            ),
        ]
        for group in groups:
            existing = db.query(Group).filter(Group.name == group.name).first()
            if not existing:
                db.add(group)
        db.commit()
        print(f"✅ Created {len(groups)} groups")
        
        # Get groups for relationships
        fantasy_group = db.query(Group).filter(Group.name == "Fantasy Book Club").first()
        horror_group = db.query(Group).filter(Group.name == "Horror Readers").first()
        
        # Add members to groups
        if fantasy_group:
            fantasy_group.members.append(john)
            fantasy_group.members.append(jane)
            fantasy_group.members_count = 2
        if horror_group:
            horror_group.members.append(bob)
            horror_group.members.append(john)
            horror_group.members_count = 2
        db.commit()
        print("✅ Added members to groups")
        
        # Create Challenges
        print("🎯 Creating challenges...")
        challenges = [
            Challenge(
                title="Read 10 Books in 2024",
                description="Challenge yourself to read 10 books this year",
                target_books=10,
                start_date=datetime.now(timezone.utc) - timedelta(days=100),
                end_date=datetime.now(timezone.utc) + timedelta(days=265),
                xp_reward=1000,
                badge="Bookworm",
                tags="reading,challenge,2024"
            ),
            Challenge(
                title="Fantasy Marathon",
                description="Read 5 fantasy books in a month",
                target_books=5,
                start_date=datetime.now(timezone.utc) - timedelta(days=10),
                end_date=datetime.now(timezone.utc) + timedelta(days=20),
                xp_reward=500,
                badge="Fantasy Master",
                tags="fantasy,marathon"
            ),
        ]
        for challenge in challenges:
            existing = db.query(Challenge).filter(Challenge.title == challenge.title).first()
            if not existing:
                db.add(challenge)
        db.commit()
        print(f"✅ Created {len(challenges)} challenges")
        
        # Get challenges for relationships
        year_challenge = db.query(Challenge).filter(Challenge.title == "Read 10 Books in 2024").first()
        fantasy_challenge = db.query(Challenge).filter(Challenge.title == "Fantasy Marathon").first()
        
        # Add participants to challenges
        if year_challenge:
            year_challenge.participants.append(john)
            year_challenge.participants.append(jane)
            # Add progress using insert
            db.execute(
                insert(user_challenge_association).values(
                    user_id=john.id,
                    challenge_id=year_challenge.id,
                    progress=2,
                    completed=False
                )
            )
            db.execute(
                insert(user_challenge_association).values(
                    user_id=jane.id,
                    challenge_id=year_challenge.id,
                    progress=1,
                    completed=False
                )
            )
        if fantasy_challenge:
            fantasy_challenge.participants.append(john)
            db.execute(
                insert(user_challenge_association).values(
                    user_id=john.id,
                    challenge_id=fantasy_challenge.id,
                    progress=1,
                    completed=False
                )
            )
        db.commit()
        print("✅ Added participants to challenges")
        
        # Follow authors
        print("👤 Following authors...")
        if john and rowling:
            rowling.followers.append(john)
            rowling.followers_count += 1
        if jane and rowling:
            rowling.followers.append(jane)
            rowling.followers_count += 1
        if bob and king:
            king.followers.append(bob)
            king.followers_count += 1
        db.commit()
        print("✅ Users followed authors")
        
        print("\n🎉 Database seeding completed successfully!")
        print("\n📊 Summary:")
        print(f"   - Users: {db.query(User).count()}")
        print(f"   - Authors: {db.query(Author).count()}")
        print(f"   - Books: {db.query(Book).count()}")
        print(f"   - User Books: {db.query(UserBook).count()}")
        print(f"   - Reviews: {db.query(Review).count()}")
        print(f"   - Groups: {db.query(Group).count()}")
        print(f"   - Challenges: {db.query(Challenge).count()}")
        print("\n🔑 Test accounts:")
        print("   - john@example.com / password123")
        print("   - jane@example.com / password123")
        print("   - bob@example.com / password123")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()

