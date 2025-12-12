from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, select, insert
from app.database import get_db
from app.models import Challenge, User, user_challenge_association
from app.schemas import ChallengeCreate, ChallengeResponse, UserChallengeResponse
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
            user_challenge_association.select().where(
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

