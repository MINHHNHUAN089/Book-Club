from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    role: str = "user"
    is_active: bool = True
    created_at: datetime
    
    class Config:
        from_attributes = True


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Author Schemas
class AuthorBase(BaseModel):
    name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class AuthorCreate(AuthorBase):
    pass


class AuthorResponse(AuthorBase):
    id: int
    followers_count: int = 0
    
    class Config:
        from_attributes = True


# Book Schemas
class BookBase(BaseModel):
    title: str
    isbn: Optional[str] = None
    cover_url: Optional[str] = None
    file_url: Optional[str] = None  # URL của file sách (PDF, EPUB, etc.)
    description: Optional[str] = None
    published_date: Optional[str] = None
    page_count: Optional[int] = None
    google_books_id: Optional[str] = None


class BookCreate(BookBase):
    author_names: Optional[List[str]] = []


class BookUpdate(BaseModel):
    title: Optional[str] = None
    isbn: Optional[str] = None
    cover_url: Optional[str] = None
    file_url: Optional[str] = None  # URL của file sách (PDF, EPUB, etc.)
    description: Optional[str] = None
    published_date: Optional[str] = None
    page_count: Optional[int] = None
    google_books_id: Optional[str] = None
    author_names: Optional[List[str]] = None


class BookResponse(BookBase):
    id: int
    authors: List[AuthorResponse] = []
    average_rating: Optional[float] = None
    total_reviews: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True


# UserBook Schemas
class UserBookBase(BaseModel):
    status: str = "want_to_read"  # want_to_read, reading, completed, paused
    progress: int = Field(0, ge=0, le=100)
    rating: Optional[float] = Field(None, ge=0, le=5)


class UserBookCreate(UserBookBase):
    book_id: int


class UserBookUpdate(UserBookBase):
    pass


class UserBookResponse(UserBookBase):
    id: int
    book: BookResponse
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Review Schemas
class ReviewBase(BaseModel):
    rating: float = Field(..., ge=0, le=5)
    review_text: Optional[str] = None


class ReviewCreate(ReviewBase):
    book_id: int


class ReviewUpdate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    book_id: int
    user: UserResponse
    book: BookResponse
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Group Schemas
class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None
    topic: Optional[str] = None
    cover_url: Optional[str] = None


class GroupCreate(GroupBase):
    current_book_id: Optional[int] = None


class GroupUpdate(GroupBase):
    current_book_id: Optional[int] = None


class GroupResponse(GroupBase):
    id: int
    members_count: int = 0
    current_book: Optional[BookResponse] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class MemberResponse(UserResponse):
    pass


# Challenge Schemas
class ChallengeBase(BaseModel):
    title: str
    description: Optional[str] = None
    cover_url: Optional[str] = None
    target_books: int
    start_date: datetime
    end_date: datetime
    xp_reward: int = 0
    badge: Optional[str] = None
    tags: Optional[str] = None


class ChallengeCreate(ChallengeBase):
    pass


class ChallengeResponse(ChallengeBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ChallengeProgressUpdate(BaseModel):
    progress: int = Field(..., ge=0)


class UserChallengeResponse(BaseModel):
    challenge: ChallengeResponse
    progress: int = 0
    completed: bool = False
    
    class Config:
        from_attributes = True


# Statistics Schemas
class BookStatistics(BaseModel):
    total_books: int = 0
    total_reviews: int = 0
    average_rating: Optional[float] = None
    total_readers: int = 0


class AuthorStatistics(BaseModel):
    total_books: int = 0
    total_followers: int = 0


class ChallengeStatistics(BaseModel):
    total_participants: int = 0
    completed_count: int = 0
    average_progress: float = 0.0


# Group Discussion Schemas
class GroupDiscussionBase(BaseModel):
    content: str


class GroupDiscussionCreate(GroupDiscussionBase):
    pass


class GroupDiscussionResponse(GroupDiscussionBase):
    id: int
    group_id: int
    user_id: int
    user: UserResponse
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Group Schedule Schemas
class GroupScheduleBase(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_date: datetime


class GroupScheduleCreate(GroupScheduleBase):
    pass


class GroupScheduleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None


class GroupScheduleResponse(GroupScheduleBase):
    id: int
    group_id: int
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Group Event Schemas
class GroupEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: datetime
    location: Optional[str] = None


class GroupEventCreate(GroupEventBase):
    pass


class GroupEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[datetime] = None
    location: Optional[str] = None


class GroupEventResponse(GroupEventBase):
    id: int
    group_id: int
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Extended Group Response with creator info
class GroupDetailResponse(GroupResponse):
    created_by: int
    
    class Config:
        from_attributes = True
