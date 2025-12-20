from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models import User, Book, Review, Group, Challenge, Author, UserBook, AuthorNotification
from app.schemas import (
    UserResponse, BookResponse, ReviewResponse, GroupResponse, ChallengeResponse, AuthorResponse,
    AuthorNotificationCreate, AuthorNotificationResponse, AuthorNotificationUpdate
)
from app.auth import get_current_admin_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ============================================
# USER MANAGEMENT
# ============================================

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    query = db.query(User)
    
    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )
    
    if role:
        query = query.filter(User.role == role)
    
    users = query.offset(skip).limit(limit).all()
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get a specific user by ID (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    name: Optional[str] = None,
    email: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from changing their own role or deactivating themselves
    if user_id == current_admin.id:
        if role and role != "admin":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change your own admin role"
            )
        if is_active is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate your own account"
            )
    
    if name is not None:
        user.name = name
    if email is not None:
        # Check if email already exists
        existing = db.query(User).filter(User.email == email, User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = email
    if role is not None:
        if role not in ["user", "admin"]:
            raise HTTPException(status_code=400, detail="Invalid role")
        user.role = role
    if is_active is not None:
        user.is_active = is_active
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deleting themselves
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    db.delete(user)
    db.commit()
    return None


# ============================================
# BOOK MANAGEMENT
# ============================================

@router.get("/books", response_model=List[BookResponse])
def get_all_books_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all books (admin only)"""
    query = db.query(Book)
    
    if search:
        query = query.filter(Book.title.ilike(f"%{search}%"))
    
    books = query.offset(skip).limit(limit).all()
    return books


@router.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a book (admin only)"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    db.delete(book)
    db.commit()
    return None


# ============================================
# REVIEW MANAGEMENT
# ============================================

@router.get("/reviews", response_model=List[ReviewResponse])
def get_all_reviews(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    book_id: Optional[int] = None,
    user_id: Optional[int] = None,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all reviews (admin only)"""
    query = db.query(Review)
    
    if book_id:
        query = query.filter(Review.book_id == book_id)
    if user_id:
        query = query.filter(Review.user_id == user_id)
    
    reviews = query.offset(skip).limit(limit).all()
    return reviews


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a review (admin only)"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    db.delete(review)
    db.commit()
    return None


# ============================================
# GROUP MANAGEMENT
# ============================================

@router.get("/groups", response_model=List[GroupResponse])
def get_all_groups_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all groups (admin only)"""
    groups = db.query(Group).offset(skip).limit(limit).all()
    return groups


@router.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(
    group_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a group (admin only)"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    db.delete(group)
    db.commit()
    return None


# ============================================
# CHALLENGE MANAGEMENT
# ============================================

@router.get("/challenges", response_model=List[ChallengeResponse])
def get_all_challenges_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all challenges (admin only)"""
    challenges = db.query(Challenge).offset(skip).limit(limit).all()
    return challenges


@router.delete("/challenges/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_challenge(
    challenge_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a challenge (admin only)"""
    from app.models import user_challenge_association
    from sqlalchemy import delete as sql_delete
    
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    # Delete all participants from the challenge first
    db.execute(
        sql_delete(user_challenge_association).where(
            user_challenge_association.c.challenge_id == challenge_id
        )
    )
    
    # Then delete the challenge
    db.delete(challenge)
    db.commit()
    return None


# ============================================
# STATISTICS
# ============================================

@router.get("/stats")
def get_admin_stats(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics"""
    stats = {
        "total_users": db.query(func.count(User.id)).scalar(),
        "total_books": db.query(func.count(Book.id)).scalar(),
        "total_reviews": db.query(func.count(Review.id)).scalar(),
        "total_groups": db.query(func.count(Group.id)).scalar(),
        "total_challenges": db.query(func.count(Challenge.id)).scalar(),
        "total_user_books": db.query(func.count(UserBook.id)).scalar(),
        "active_users": db.query(func.count(User.id)).filter(User.is_active == True).scalar(),
        "admin_users": db.query(func.count(User.id)).filter(User.role == "admin").scalar(),
    }
    return stats


# ============================================
# AUTHOR NOTIFICATIONS (Admin only)
# ============================================

@router.post("/author-notifications", response_model=AuthorNotificationResponse, status_code=status.HTTP_201_CREATED)
def create_author_notification(
    notification_data: AuthorNotificationCreate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a notification for an author (admin only)"""
    # Verify author exists
    author = db.query(Author).filter(Author.id == notification_data.author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    # Verify book exists if provided
    if notification_data.book_id:
        book = db.query(Book).filter(Book.id == notification_data.book_id).first()
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
    
    # Create notification
    notification_dict = notification_data.model_dump()
    db_notification = AuthorNotification(
        created_by=current_admin.id,
        **notification_dict
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


@router.get("/author-notifications", response_model=List[AuthorNotificationResponse])
def get_author_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    author_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all author notifications (admin only)"""
    query = db.query(AuthorNotification)
    
    if author_id:
        query = query.filter(AuthorNotification.author_id == author_id)
    
    if is_active is not None:
        query = query.filter(AuthorNotification.is_active == is_active)
    
    notifications = query.order_by(desc(AuthorNotification.created_at)).offset(skip).limit(limit).all()
    return notifications


@router.get("/author-notifications/{notification_id}", response_model=AuthorNotificationResponse)
def get_author_notification(
    notification_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get a specific author notification (admin only)"""
    notification = db.query(AuthorNotification).filter(AuthorNotification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification


@router.patch("/author-notifications/{notification_id}", response_model=AuthorNotificationResponse)
def update_author_notification(
    notification_id: int,
    notification_update: AuthorNotificationUpdate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update an author notification (admin only)"""
    notification = db.query(AuthorNotification).filter(AuthorNotification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Verify book exists if provided
    if notification_update.book_id:
        book = db.query(Book).filter(Book.id == notification_update.book_id).first()
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
    
    # Update fields
    update_data = notification_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(notification, field, value)
    
    db.commit()
    db.refresh(notification)
    return notification


@router.delete("/author-notifications/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_author_notification(
    notification_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete an author notification (admin only)"""
    notification = db.query(AuthorNotification).filter(AuthorNotification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    db.commit()
    return None

