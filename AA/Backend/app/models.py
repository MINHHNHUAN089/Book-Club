from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# Association tables for many-to-many relationships
book_author_association = Table(
    'book_author',
    Base.metadata,
    Column('book_id', Integer, ForeignKey('books.id')),
    Column('author_id', Integer, ForeignKey('authors.id'))
)

user_group_association = Table(
    'user_group',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('group_id', Integer, ForeignKey('groups.id'))
)

user_challenge_association = Table(
    'user_challenge',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('challenge_id', Integer, ForeignKey('challenges.id')),
    Column('progress', Integer, default=0),
    Column('completed', Boolean, default=False)
)

user_author_follow_association = Table(
    'user_author_follow',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('author_id', Integer, ForeignKey('authors.id'))
)


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    role = Column(String(20), default="user", nullable=False)  # 'user' or 'admin'
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    books = relationship("UserBook", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    groups = relationship("Group", secondary=user_group_association, back_populates="members")
    challenges = relationship("Challenge", secondary=user_challenge_association, back_populates="participants")
    followed_authors = relationship("Author", secondary=user_author_follow_association, back_populates="followers")


class Book(Base):
    __tablename__ = "books"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    isbn = Column(String(20), unique=True, nullable=True, index=True)
    cover_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    published_date = Column(String(50), nullable=True)
    page_count = Column(Integer, nullable=True)
    google_books_id = Column(String(100), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    authors = relationship("Author", secondary=book_author_association, back_populates="books")
    user_books = relationship("UserBook", back_populates="book", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="book", cascade="all, delete-orphan")


class Author(Base):
    __tablename__ = "authors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    followers_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    books = relationship("Book", secondary=book_author_association, back_populates="authors")
    followers = relationship("User", secondary=user_author_follow_association, back_populates="followed_authors")


class UserBook(Base):
    __tablename__ = "user_books"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    status = Column(String(50), default="want_to_read")  # want_to_read, reading, completed, paused
    progress = Column(Integer, default=0)  # 0-100
    rating = Column(Float, nullable=True)  # 0-5
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="books")
    book = relationship("Book", back_populates="user_books")


class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    rating = Column(Float, nullable=False)  # 0-5
    review_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="reviews")
    book = relationship("Book", back_populates="reviews")


class Group(Base):
    __tablename__ = "groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    topic = Column(String(100), nullable=True)
    cover_url = Column(String(500), nullable=True)
    current_book_id = Column(Integer, ForeignKey("books.id"), nullable=True)
    members_count = Column(Integer, default=0)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    members = relationship("User", secondary=user_group_association, back_populates="groups")
    current_book = relationship("Book", foreign_keys=[current_book_id])


class Challenge(Base):
    __tablename__ = "challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    cover_url = Column(String(500), nullable=True)
    target_books = Column(Integer, nullable=False)  # Number of books to read
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    xp_reward = Column(Integer, default=0)
    badge = Column(String(100), nullable=True)
    tags = Column(String(500), nullable=True)  # Comma-separated tags
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    participants = relationship("User", secondary=user_challenge_association, back_populates="challenges")

