from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.config import settings
from app.models.models import User, Role
from app.schemas.schemas import UserCreate, UserResponse, Token, UserLogin, TokenRefreshRequest
from app.auth.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user
)
from app.utils.logging_service import log_action

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email address already exists."
        )

    # Get default 'User' role
    user_role = db.query(Role).filter(Role.name == "User").first()
    if not user_role:
        # Auto-create User role if it doesn't exist yet
        user_role = Role(name="User", permissions={})
        db.add(user_role)
        db.commit()
        db.refresh(user_role)

    hashed_pw = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_pw,
        full_name=user_in.full_name,
        role_id=user_role.id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Log action
    log_action(
        db,
        action="USER_REGISTER",
        target_type="user",
        user_id=db_user.id,
        user_email=db_user.email,
        target_id=db_user.id,
        details=f"User {db_user.email} registered successfully."
    )

    return UserResponse(
        id=db_user.id,
        email=db_user.email,
        full_name=db_user.full_name,
        role_id=db_user.role_id,
        role_name=user_role.name,
        is_active=db_user.is_active,
        created_at=db_user.created_at,
        updated_at=db_user.updated_at
    )

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled. Please contact the administrator.")

    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})

    # Log login action
    log_action(
        db,
        action="USER_LOGIN",
        target_type="user",
        user_id=user.id,
        user_email=user.email,
        target_id=user.id,
        details=f"User {user.email} logged in successfully."
    )

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        role=user.role.name,
        email=user.email,
        full_name=user.full_name
    )

@router.post("/refresh", response_model=Token)
def refresh_token(request: TokenRefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(request.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive or not found",
        )

    new_access_token = create_access_token(data={"sub": user.email})
    new_refresh_token = create_refresh_token(data={"sub": user.email})

    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        role=user.role.name,
        email=user.email,
        full_name=user.full_name
    )

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role_id=current_user.role_id,
        role_name=current_user.role.name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )
