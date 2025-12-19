from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import Review, Book, User, UserBook
from app.schemas import ReviewCreate, ReviewResponse, ReviewUpdate
from app.auth import get_current_active_user

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.get("", response_model=List[ReviewResponse])
def get_reviews(
    book_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get reviews with optional filters"""
    query = db.query(Review).options(joinedload(Review.user), joinedload(Review.book))
    
    if book_id:
        query = query.filter(Review.book_id == book_id)
    
    if user_id:
        query = query.filter(Review.user_id == user_id)
    
    reviews = query.offset(skip).limit(limit).all()
    return reviews


@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(review_id: int, db: Session = Depends(get_db)):
    """Get a specific review by ID"""
    review = db.query(Review).options(joinedload(Review.user), joinedload(Review.book)).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return review


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new review"""
    # Check if book exists
    book = db.query(Book).filter(Book.id == review_data.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Allow multiple reviews per book - removed the check for existing review
    
    # Create review
    review_dict = review_data.model_dump()
    db_review = Review(
        user_id=current_user.id,
        **review_dict
    )
    db.add(db_review)
    
    # Update rating in user_books if the book is in user's list
    # If book is not in user's list, add it first
    user_book = db.query(UserBook).filter(
        UserBook.user_id == current_user.id,
        UserBook.book_id == review_data.book_id
    ).first()
    
    if user_book:
        # Update existing user_book with new rating
        user_book.rating = review_data.rating
        db.add(user_book)
    else:
        # Create new user_book entry if it doesn't exist
        user_book = UserBook(
            user_id=current_user.id,
            book_id=review_data.book_id,
            rating=review_data.rating,
            status="want_to_read",
            progress=0
        )
        db.add(user_book)
    
    db.commit()
    db.refresh(db_review)
    
    # Reload with user relationship to get user name
    db_review = db.query(Review).options(joinedload(Review.user), joinedload(Review.book)).filter(Review.id == db_review.id).first()
    return db_review


@router.patch("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    review_update: ReviewUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a review"""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.user_id == current_user.id
    ).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Update fields
    update_data = review_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(review, field, value)
    
    # Update rating in user_books if rating was updated
    if "rating" in update_data:
        user_book = db.query(UserBook).filter(
            UserBook.user_id == current_user.id,
            UserBook.book_id == review.book_id
        ).first()
        
        if user_book:
            user_book.rating = update_data["rating"]
            db.add(user_book)
    
    db.commit()
    db.refresh(review)
    
    # Reload with user and book relationships
    review = db.query(Review).options(joinedload(Review.user), joinedload(Review.book)).filter(Review.id == review.id).first()
    return review


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a review"""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.user_id == current_user.id
    ).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    db.delete(review)
    db.commit()
    return None

