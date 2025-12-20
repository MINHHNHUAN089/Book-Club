from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, select, insert, update, delete, cast, Integer
from app.database import get_db
from app.models import Challenge, User, user_challenge_association
from app.schemas import ChallengeCreate, ChallengeResponse, UserChallengeResponse, ChallengeProgressUpdate, ChallengeStatistics
from sqlalchemy import func
from app.auth import get_current_active_user

router = APIRouter(prefix="/api/challenges", tags=["challenges"])


@router.get("", response_model=List[ChallengeResponse])
def get_challenges(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all challenges with optional search"""
    query = db.query(Challenge)
    
    if search:
        query = query.filter(
            or_(
                Challenge.title.ilike(f"%{search}%"),
                Challenge.description.ilike(f"%{search}%")
            )
        )
    
    challenges = query.offset(skip).limit(limit).all()
    return challenges


@router.get("/{challenge_id}", response_model=ChallengeResponse)
def get_challenge(challenge_id: int, db: Session = Depends(get_db)):
    """Get a specific challenge by ID"""
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge


@router.post("", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
def create_challenge(
    challenge_data: ChallengeCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new challenge"""
    challenge_dict = challenge_data.model_dump()
    db_challenge = Challenge(**challenge_dict)
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)
    return db_challenge


@router.post("/{challenge_id}/join", response_model=UserChallengeResponse)
def join_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Join a challenge"""
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    # Check if already participating
    if current_user in challenge.participants:
        raise HTTPException(status_code=400, detail="Already participating in this challenge")
    
    # Add user to challenge with initial progress
    db.execute(
        insert(user_challenge_association).values(
            user_id=current_user.id,
            challenge_id=challenge_id,
            progress=0,
            completed=False
        )
    )
    
    challenge.participants.append(current_user)
    db.commit()
    db.refresh(challenge)
    
    # Get user's challenge progress
    result = db.execute(
        select(user_challenge_association).where(
            user_challenge_association.c.user_id == current_user.id,
            user_challenge_association.c.challenge_id == challenge_id
        )
    ).first()
    
    return UserChallengeResponse(
        challenge=challenge,
        progress=result.progress if result else 0,
        completed=result.completed if result else False
    )


@router.get("/user/my-challenges", response_model=List[UserChallengeResponse])
def get_my_challenges(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's challenges with progress"""
    challenges = db.query(Challenge).filter(Challenge.participants.contains(current_user)).all()
    
    result = []
    for challenge in challenges:
        user_challenge = db.execute(
            select(user_challenge_association).where(
                user_challenge_association.c.user_id == current_user.id,
                user_challenge_association.c.challenge_id == challenge.id
            )
        ).first()
        
        result.append(UserChallengeResponse(
            challenge=challenge,
            progress=user_challenge.progress if user_challenge else 0,
            completed=user_challenge.completed if user_challenge else False
        ))
    
    return result


@router.patch("/{challenge_id}/progress", response_model=UserChallengeResponse)
def update_challenge_progress(
    challenge_id: int,
    progress_update: ChallengeProgressUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user's progress in a challenge"""
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    # Check if user is participating
    if current_user not in challenge.participants:
        raise HTTPException(
            status_code=400,
            detail="You are not participating in this challenge"
        )
    
    # Update progress
    db.execute(
        update(user_challenge_association)
        .where(
            user_challenge_association.c.user_id == current_user.id,
            user_challenge_association.c.challenge_id == challenge_id
        )
        .values(progress=progress_update.progress)
    )
    
    # Check if completed
    completed = progress_update.progress >= challenge.target_books
    if completed:
        db.execute(
            update(user_challenge_association)
            .where(
                user_challenge_association.c.user_id == current_user.id,
                user_challenge_association.c.challenge_id == challenge_id
            )
            .values(completed=True)
        )
    
    db.commit()
    db.refresh(challenge)
    
    # Get updated progress
    result = db.execute(
        select(user_challenge_association).where(
            user_challenge_association.c.user_id == current_user.id,
            user_challenge_association.c.challenge_id == challenge_id
        )
    ).first()
    
    return UserChallengeResponse(
        challenge=challenge,
        progress=result.progress if result else 0,
        completed=result.completed if result else False
    )


@router.post("/{challenge_id}/leave", status_code=status.HTTP_200_OK)
def leave_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Leave a challenge"""
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    # Check if user is participating by checking association table directly
    existing = db.execute(
        select(user_challenge_association).where(
            user_challenge_association.c.user_id == current_user.id,
            user_challenge_association.c.challenge_id == challenge_id
        )
    ).first()
    
    if not existing:
        raise HTTPException(
            status_code=400,
            detail="You are not participating in this challenge"
        )
    
    # Remove user from challenge by deleting from association table
    db.execute(
        delete(user_challenge_association).where(
            user_challenge_association.c.user_id == current_user.id,
            user_challenge_association.c.challenge_id == challenge_id
        )
    )
    
    db.commit()
    
    return {"message": "Successfully left the challenge"}


@router.get("/{challenge_id}/statistics", response_model=ChallengeStatistics)
def get_challenge_statistics(challenge_id: int, db: Session = Depends(get_db)):
    """Get statistics for a specific challenge"""
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    # Get participant statistics
    stats = db.execute(
        select(
            func.count(user_challenge_association.c.user_id).label('total_participants'),
            func.sum(cast(user_challenge_association.c.completed, Integer)).label('completed_count'),
            func.avg(user_challenge_association.c.progress).label('average_progress')
        ).where(
            user_challenge_association.c.challenge_id == challenge_id
        )
    ).first()
    
    return ChallengeStatistics(
        total_participants=stats.total_participants or 0,
        completed_count=stats.completed_count or 0,
        average_progress=float(stats.average_progress) if stats.average_progress else 0.0
    )

