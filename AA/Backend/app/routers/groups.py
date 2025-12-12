from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Group, User, Book
from app.schemas import GroupCreate, GroupResponse
from app.auth import get_current_active_user

router = APIRouter(prefix="/api/groups", tags=["groups"])


@router.get("", response_model=List[GroupResponse])
def get_groups(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all groups with optional search"""
    query = db.query(Group)
    
    if search:
        query = query.filter(
            or_(
                Group.name.ilike(f"%{search}%"),
                Group.description.ilike(f"%{search}%"),
                Group.topic.ilike(f"%{search}%")
            )
        )
    
    groups = query.offset(skip).limit(limit).all()
    return groups


@router.get("/{group_id}", response_model=GroupResponse)
def get_group(group_id: int, db: Session = Depends(get_db)):
    """Get a specific group by ID"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group


@router.post("", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(
    group_data: GroupCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new group"""
    # Verify current_book_id if provided
    if group_data.current_book_id:
        book = db.query(Book).filter(Book.id == group_data.current_book_id).first()
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
    
    # Create group
    group_dict = group_data.model_dump()
    db_group = Group(
        created_by=current_user.id,
        **group_dict
    )
    db.add(db_group)
    
    # Add creator as member
    db_group.members.append(current_user)
    db_group.members_count = 1
    
    db.commit()
    db.refresh(db_group)
    return db_group


@router.post("/{group_id}/join", response_model=GroupResponse)
def join_group(
    group_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Join a group"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Check if already a member
    if current_user in group.members:
        raise HTTPException(status_code=400, detail="Already a member of this group")
    
    # Add user to group
    group.members.append(current_user)
    group.members_count += 1
    db.commit()
    db.refresh(group)
    return group


@router.post("/{group_id}/leave", response_model=GroupResponse)
def leave_group(
    group_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Leave a group"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Check if user is a member
    if current_user not in group.members:
        raise HTTPException(status_code=400, detail="Not a member of this group")
    
    # Remove user from group
    group.members.remove(current_user)
    group.members_count = max(0, group.members_count - 1)
    db.commit()
    db.refresh(group)
    return group


@router.get("/user/my-groups", response_model=List[GroupResponse])
def get_my_groups(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's groups"""
    groups = db.query(Group).filter(Group.members.contains(current_user)).all()
    return groups

