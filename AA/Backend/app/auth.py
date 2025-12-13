from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas import TokenData

# Configure password context with bcrypt
# Using bcrypt with rounds=12 for better security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    if not plain_password or not hashed_password:
        return False
    
    try:
        # Try with passlib first (most common case)
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        # Fallback: try with direct bcrypt if passlib fails
        try:
            import bcrypt
            password_bytes = plain_password.encode('utf-8')
            if len(password_bytes) > 72:
                password_bytes = password_bytes[:72]
            
            # hashed_password might already be a string, check if it needs encoding
            if isinstance(hashed_password, str):
                hash_bytes = hashed_password.encode('utf-8')
            else:
                hash_bytes = hashed_password
            
            return bcrypt.checkpw(password_bytes, hash_bytes)
        except Exception:
            return False


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    if not password:
        raise ValueError("Password cannot be empty")
    
    try:
        # Ensure password is a string and handle encoding
        if not isinstance(password, str):
            password = str(password)
        
        # Bcrypt has a 72 byte limit, truncate if necessary
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            password = password_bytes[:72].decode('utf-8', errors='ignore')
        
        return pwd_context.hash(password)
    except Exception as e:
        # Fallback: try with direct bcrypt if passlib fails
        import bcrypt
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password_bytes, salt)
        # Ensure we return a string
        if isinstance(hashed, bytes):
            return hashed.decode('utf-8')
        return hashed


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_token(token: str, credentials_exception: HTTPException) -> TokenData:
    """Verify JWT token and return token data"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    return token_data


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_token(token, credentials_exception)
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user (can be extended for user status checks)"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    return current_user


def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Get current admin user - only allows admin role"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

