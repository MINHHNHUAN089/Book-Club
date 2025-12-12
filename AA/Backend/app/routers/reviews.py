from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Review, Book, User
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
    query = db.query(Review)
    
    if book_id:
        query = query.filter(Review.book_id == book_id)
    
    if user_id:
        query = query.filter(Review.user_id == user_id)
    
    reviews = query.offset(skip).limit(limit).all()
    return reviews


@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(review_id: int, db: Session = Depends(get_db)):
    """Get a specific review by ID"""
    review = db.query(Review).filter(Review.id == review_id).first()
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
    
    # Check if user already reviewed this book
    existing = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.book_id == review_data.book_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this book")
    
    # Create review
    review_dict = review_data.model_dump()
    db_review = Review(
        user_id=current_user.id,
        **review_dict
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
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
    
    db.commit()
    db.refresh(review)
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

