from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.database import get_db
from app.models import Author, User, Book
from app.schemas import AuthorCreate, AuthorResponse, AuthorStatistics, BookResponse
from app.auth import get_current_active_user

router = APIRouter(prefix="/api/authors", tags=["authors"])


@router.get("", response_model=List[AuthorResponse])
def get_authors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all authors with optional search"""
    query = db.query(Author)
    
    if search:
        query = query.filter(Author.name.ilike(f"%{search}%"))
    
    authors = query.offset(skip).limit(limit).all()
    return authors


@router.get("/{author_id}", response_model=AuthorResponse)
def get_author(author_id: int, db: Session = Depends(get_db)):
    """Get a specific author by ID"""
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return author


@router.post("", response_model=AuthorResponse, status_code=status.HTTP_201_CREATED)
def create_author(author_data: AuthorCreate, db: Session = Depends(get_db)):
    """Create a new author"""
    # Check if author already exists
    existing = db.query(Author).filter(Author.name == author_data.name).first()
    if existing:
        return existing
    
    author_dict = author_data.model_dump()
    db_author = Author(**author_dict)
    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    return db_author


@router.post("/{author_id}/follow", response_model=AuthorResponse)
def follow_author(
    author_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Follow an author"""
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    # Check if already following
    if current_user in author.followers:
        raise HTTPException(status_code=400, detail="Already following this author")
    
    # Add user to followers
    author.followers.append(current_user)
    author.followers_count += 1
    db.commit()
    db.refresh(author)
    return author


@router.post("/{author_id}/unfollow", response_model=AuthorResponse)
def unfollow_author(
    author_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Unfollow an author"""
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    # Check if user is following
    if current_user not in author.followers:
        raise HTTPException(status_code=400, detail="Not following this author")
    
    # Remove user from followers
    author.followers.remove(current_user)
    author.followers_count = max(0, author.followers_count - 1)
    db.commit()
    db.refresh(author)
    return author


@router.get("/user/followed", response_model=List[AuthorResponse])
def get_followed_authors(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's followed authors"""
    authors = db.query(Author).filter(Author.followers.contains(current_user)).all()
    return authors


@router.get("/{author_id}/books", response_model=List[BookResponse])
def get_author_books(
    author_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all books by a specific author"""
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    books = db.query(Book).join(Book.authors).filter(Author.id == author_id)\
        .offset(skip).limit(limit).all()
    
    return books


@router.get("/{author_id}/statistics", response_model=AuthorStatistics)
def get_author_statistics(author_id: int, db: Session = Depends(get_db)):
    """Get statistics for a specific author"""
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    total_books = db.query(func.count(Book.id))\
        .join(Book.authors)\
        .filter(Author.id == author_id)\
        .scalar() or 0
    
    return AuthorStatistics(
        total_books=total_books,
        total_followers=author.followers_count
    )

