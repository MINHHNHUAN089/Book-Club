from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from app.database import get_db
from app.models import Book, Author, UserBook, User, Review
from app.schemas import BookCreate, BookUpdate, BookResponse, UserBookCreate, UserBookResponse, UserBookUpdate, BookStatistics, ReviewResponse
from app.auth import get_current_active_user

router = APIRouter(prefix="/api/books", tags=["books"])


@router.get("", response_model=List[BookResponse])
def get_books(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all books with optional search"""
    from sqlalchemy.orm import joinedload
    
    try:
        query = db.query(Book)
        
        if search:
            query = query.filter(
                or_(
                    Book.title.ilike(f"%{search}%"),
                    Book.description.ilike(f"%{search}%")
                )
            )
        
        # Eager load authors to avoid N+1 queries
        books = query.options(joinedload(Book.authors)).offset(skip).limit(limit).all()
        return books
    except Exception as e:
        import traceback
        print(f"Error in get_books: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Lỗi khi lấy danh sách sách: {str(e)}")


@router.get("/{book_id}", response_model=BookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)):
    """Get a specific book by ID"""
    from sqlalchemy.orm import joinedload
    book = db.query(Book).options(joinedload(Book.authors)).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.patch("/{book_id}", response_model=BookResponse)
def update_book(
    book_id: int,
    book_data: BookUpdate,
    db: Session = Depends(get_db)
):
    """Update a book (e.g., cover_url, authors)"""
    from sqlalchemy.orm import joinedload
    book = db.query(Book).options(joinedload(Book.authors)).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Update only provided fields
    update_data = book_data.model_dump(exclude_unset=True, exclude={"author_names"})
    for field, value in update_data.items():
        setattr(book, field, value)
    
    # Update authors if provided
    if book_data.author_names is not None:
        # Clear existing authors
        book.authors.clear()
        # Add new authors
        for author_name in book_data.author_names:
            if author_name.strip():
                author = db.query(Author).filter(Author.name == author_name.strip()).first()
                if not author:
                    author = Author(name=author_name.strip())
                    db.add(author)
                    db.flush()
                book.authors.append(author)
    
    db.commit()
    db.refresh(book)
    return book


@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(book_data: BookCreate, db: Session = Depends(get_db)):
    """Create a new book"""
    # Check if book already exists by ISBN or Google Books ID
    if book_data.isbn:
        existing = db.query(Book).filter(Book.isbn == book_data.isbn).first()
        if existing:
            return existing
    
    if book_data.google_books_id:
        existing = db.query(Book).filter(Book.google_books_id == book_data.google_books_id).first()
        if existing:
            return existing
    
    # Create book
    book_dict = book_data.model_dump(exclude={"author_names"})
    db_book = Book(**book_dict)
    db.add(db_book)
    
    # Add authors
    if book_data.author_names:
        for author_name in book_data.author_names:
            author = db.query(Author).filter(Author.name == author_name).first()
            if not author:
                author = Author(name=author_name)
                db.add(author)
                db.flush()
            db_book.authors.append(author)
    
    db.commit()
    db.refresh(db_book)
    return db_book


@router.get("/user/my-books", response_model=List[UserBookResponse])
def get_my_books(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's books"""
    query = db.query(UserBook).filter(UserBook.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(UserBook.status == status_filter)
    
    # Eager load book and authors to avoid N+1 queries
    from sqlalchemy.orm import joinedload
    user_books = query.options(joinedload(UserBook.book).joinedload(Book.authors)).all()
    return user_books


@router.post("/user/add", response_model=UserBookResponse, status_code=status.HTTP_201_CREATED)
def add_book_to_my_list(
    book_data: UserBookCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add a book to user's reading list"""
    # Check if book exists
    book = db.query(Book).filter(Book.id == book_data.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Check if user already has this book
    existing = db.query(UserBook).filter(
        UserBook.user_id == current_user.id,
        UserBook.book_id == book_data.book_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Book already in your list")
    
    # Create user book
    user_book_dict = book_data.model_dump(exclude={"book_id"})
    db_user_book = UserBook(
        user_id=current_user.id,
        book_id=book_data.book_id,
        **user_book_dict
    )
    db.add(db_user_book)
    db.commit()
    db.refresh(db_user_book)
    return db_user_book


@router.patch("/user/{user_book_id}", response_model=UserBookResponse)
def update_my_book(
    user_book_id: int,
    book_update: UserBookUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user's book progress/status/rating"""
    user_book = db.query(UserBook).filter(
        UserBook.id == user_book_id,
        UserBook.user_id == current_user.id
    ).first()
    
    if not user_book:
        raise HTTPException(status_code=404, detail="Book not found in your list")
    
    # Update fields
    update_data = book_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user_book, field, value)
    
    # Update timestamps
    if book_update.status == "reading" and not user_book.started_at:
        from datetime import datetime, timezone
        user_book.started_at = datetime.now(timezone.utc)
    
    if book_update.status == "completed" and not user_book.completed_at:
        from datetime import datetime, timezone
        user_book.completed_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(user_book)
    return user_book


@router.delete("/user/{user_book_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_book_from_my_list(
    user_book_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove a book from user's reading list"""
    user_book = db.query(UserBook).filter(
        UserBook.id == user_book_id,
        UserBook.user_id == current_user.id
    ).first()
    
    if not user_book:
        raise HTTPException(status_code=404, detail="Book not found in your list")
    
    db.delete(user_book)
    db.commit()
    return None


@router.get("/{book_id}/reviews", response_model=List[ReviewResponse])
def get_book_reviews(
    book_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get reviews for a specific book"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    reviews = db.query(Review).filter(Review.book_id == book_id)\
        .offset(skip).limit(limit).all()
    
    return reviews


@router.get("/{book_id}/statistics", response_model=BookStatistics)
def get_book_statistics(book_id: int, db: Session = Depends(get_db)):
    """Get statistics for a specific book"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Get review statistics
    review_stats = db.query(
        func.count(Review.id).label('total_reviews'),
        func.avg(Review.rating).label('average_rating')
    ).filter(Review.book_id == book_id).first()
    
    # Get total readers
    total_readers = db.query(func.count(UserBook.id)).filter(
        UserBook.book_id == book_id
    ).scalar() or 0
    
    return BookStatistics(
        total_books=1,
        total_reviews=review_stats.total_reviews or 0,
        average_rating=float(review_stats.average_rating) if review_stats.average_rating else None,
        total_readers=total_readers
    )


@router.get("/popular/list", response_model=List[BookResponse])
def get_popular_books(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get popular books based on number of readers and reviews"""
    # Get books ordered by number of user_books and reviews
    popular_books = db.query(Book)\
        .outerjoin(UserBook)\
        .outerjoin(Review)\
        .group_by(Book.id)\
        .order_by(
            desc(func.count(UserBook.id)),
            desc(func.count(Review.id))
        )\
        .offset(skip).limit(limit).all()
    
    return popular_books

