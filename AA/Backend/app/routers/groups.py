from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Group, User, Book, GroupDiscussion, GroupSchedule, GroupEvent
from app.schemas import (
    GroupCreate, GroupResponse, GroupUpdate, MemberResponse, GroupDetailResponse,
    GroupDiscussionCreate, GroupDiscussionResponse,
    GroupScheduleCreate, GroupScheduleUpdate, GroupScheduleResponse,
    GroupEventCreate, GroupEventUpdate, GroupEventResponse
)
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
    try:
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
    except Exception as e:
        import traceback
        print(f"Error in get_groups: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Lỗi khi lấy danh sách câu lạc bộ: {str(e)}")


@router.get("/{group_id}", response_model=GroupDetailResponse)
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


@router.patch("/{group_id}", response_model=GroupResponse)
def update_group(
    group_id: int,
    group_update: GroupUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a group (only creator can update)"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Check if user is the creator
    if group.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only group creator can update the group"
        )
    
    # Verify current_book_id if provided
    if group_update.current_book_id:
        book = db.query(Book).filter(Book.id == group_update.current_book_id).first()
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
    
    # Update fields
    update_data = group_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(group, field, value)
    
    db.commit()
    db.refresh(group)
    return group


@router.get("/{group_id}/members", response_model=List[MemberResponse])
def get_group_members(
    group_id: int,
    db: Session = Depends(get_db)
):
    """Get all members of a group"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    return group.members


@router.post("/{group_id}/set-current-book", response_model=GroupResponse)
def set_current_book(
    group_id: int,
    book_id: int = Query(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Set the current book for a group (only creator can set)"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Check if user is the creator
    if group.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only group creator can set the current book"
        )
    
    # Verify book exists
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    group.current_book_id = book_id
    db.commit()
    db.refresh(group)
    return group


# ============================================
# DISCUSSION ENDPOINTS
# ============================================

@router.get("/{group_id}/discussions", response_model=List[GroupDiscussionResponse])
def get_group_discussions(
    group_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all discussions for a group"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    discussions = db.query(GroupDiscussion).filter(
        GroupDiscussion.group_id == group_id
    ).order_by(GroupDiscussion.created_at.desc()).offset(skip).limit(limit).all()
    
    return discussions


@router.post("/{group_id}/discussions", response_model=GroupDiscussionResponse, status_code=status.HTTP_201_CREATED)
def create_discussion(
    group_id: int,
    discussion_data: GroupDiscussionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new discussion/comment in a group (must be a member)"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Check if user is a member
    if current_user not in group.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn phải là thành viên của nhóm để bình luận"
        )
    
    discussion = GroupDiscussion(
        group_id=group_id,
        user_id=current_user.id,
        content=discussion_data.content
    )
    db.add(discussion)
    db.commit()
    db.refresh(discussion)
    return discussion


@router.delete("/{group_id}/discussions/{discussion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_discussion(
    group_id: int,
    discussion_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a discussion (only author or group creator/admin can delete)"""
    discussion = db.query(GroupDiscussion).filter(
        GroupDiscussion.id == discussion_id,
        GroupDiscussion.group_id == group_id
    ).first()
    
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    group = db.query(Group).filter(Group.id == group_id).first()
    
    # Check permissions
    if discussion.user_id != current_user.id and group.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xóa bình luận này"
        )
    
    db.delete(discussion)
    db.commit()
    return None


# ============================================
# SCHEDULE ENDPOINTS
# ============================================

@router.get("/{group_id}/schedules", response_model=List[GroupScheduleResponse])
def get_group_schedules(
    group_id: int,
    db: Session = Depends(get_db)
):
    """Get all schedules for a group"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    schedules = db.query(GroupSchedule).filter(
        GroupSchedule.group_id == group_id
    ).order_by(GroupSchedule.scheduled_date.asc()).all()
    
    return schedules


@router.post("/{group_id}/schedules", response_model=GroupScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_schedule(
    group_id: int,
    schedule_data: GroupScheduleCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new schedule (only group creator or admin can create)"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Check permissions
    if group.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ quản trị viên nhóm mới có quyền thêm lịch trình"
        )
    
    schedule = GroupSchedule(
        group_id=group_id,
        created_by=current_user.id,
        **schedule_data.model_dump()
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.patch("/{group_id}/schedules/{schedule_id}", response_model=GroupScheduleResponse)
def update_schedule(
    group_id: int,
    schedule_id: int,
    schedule_update: GroupScheduleUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a schedule (only group creator or admin can update)"""
    schedule = db.query(GroupSchedule).filter(
        GroupSchedule.id == schedule_id,
        GroupSchedule.group_id == group_id
    ).first()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    group = db.query(Group).filter(Group.id == group_id).first()
    
    # Check permissions
    if group.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ quản trị viên nhóm mới có quyền sửa lịch trình"
        )
    
    update_data = schedule_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(schedule, field, value)
    
    db.commit()
    db.refresh(schedule)
    return schedule


@router.delete("/{group_id}/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(
    group_id: int,
    schedule_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a schedule (only group creator or admin can delete)"""
    schedule = db.query(GroupSchedule).filter(
        GroupSchedule.id == schedule_id,
        GroupSchedule.group_id == group_id
    ).first()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    group = db.query(Group).filter(Group.id == group_id).first()
    
    # Check permissions
    if group.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ quản trị viên nhóm mới có quyền xóa lịch trình"
        )
    
    db.delete(schedule)
    db.commit()
    return None


# ============================================
# EVENT ENDPOINTS
# ============================================

@router.get("/{group_id}/events", response_model=List[GroupEventResponse])
def get_group_events(
    group_id: int,
    db: Session = Depends(get_db)
):
    """Get all events for a group"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    events = db.query(GroupEvent).filter(
        GroupEvent.group_id == group_id
    ).order_by(GroupEvent.event_date.asc()).all()
    
    return events


@router.post("/{group_id}/events", response_model=GroupEventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    group_id: int,
    event_data: GroupEventCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new event (only group creator or admin can create)"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Check permissions
    if group.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ quản trị viên nhóm mới có quyền thêm sự kiện"
        )
    
    event = GroupEvent(
        group_id=group_id,
        created_by=current_user.id,
        **event_data.model_dump()
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.patch("/{group_id}/events/{event_id}", response_model=GroupEventResponse)
def update_event(
    group_id: int,
    event_id: int,
    event_update: GroupEventUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an event (only group creator or admin can update)"""
    event = db.query(GroupEvent).filter(
        GroupEvent.id == event_id,
        GroupEvent.group_id == group_id
    ).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    group = db.query(Group).filter(Group.id == group_id).first()
    
    # Check permissions
    if group.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ quản trị viên nhóm mới có quyền sửa sự kiện"
        )
    
    update_data = event_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{group_id}/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    group_id: int,
    event_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an event (only group creator or admin can delete)"""
    event = db.query(GroupEvent).filter(
        GroupEvent.id == event_id,
        GroupEvent.group_id == group_id
    ).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    group = db.query(Group).filter(Group.id == group_id).first()
    
    # Check permissions
    if group.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ quản trị viên nhóm mới có quyền xóa sự kiện"
        )
    
    db.delete(event)
    db.commit()
    return None

