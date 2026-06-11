from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import User, Role
from app.schemas.schemas import UserResponse, UserUpdate, RoleResponse, UserCreate
from app.auth.auth import get_current_user, require_super_admin, get_password_hash
from app.utils.logging_service import log_action

router = APIRouter(prefix="/api/users", tags=["Users Management"])

@router.get("", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    users = db.query(User).all()
    return [
        UserResponse(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            role_id=u.role_id,
            role_name=u.role.name,
            is_active=u.is_active,
            created_at=u.created_at,
            updated_at=u.updated_at
        ) for u in users
    ]

@router.get("/roles", response_model=List[RoleResponse])
def get_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    roles = db.query(Role).all()
    return roles

@router.post("/admin-create", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_admin_user(
    user_in: UserCreate,
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    # Check if role exists
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    # Check if user already exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User email already exists")

    hashed_pw = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_pw,
        full_name=user_in.full_name,
        role_id=role_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Log action
    log_action(
        db,
        action="CREATE_ADMIN",
        target_type="user",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=db_user.id,
        details=f"Super Admin created new user {db_user.email} with role {role.name}"
    )

    return UserResponse(
        id=db_user.id,
        email=db_user.email,
        full_name=db_user.full_name,
        role_id=db_user.role_id,
        role_name=role.name,
        is_active=db_user.is_active,
        created_at=db_user.created_at,
        updated_at=db_user.updated_at
    )

@router.put("/{user_id}", response_model=UserResponse)
def update_user_status_or_role(
    user_id: int,
    user_up: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.id == current_user.id and user_up.is_active is False:
        raise HTTPException(status_code=400, detail="Super Admin cannot disable their own account")

    if user_up.full_name is not None:
        user.full_name = user_up.full_name
        
    if user_up.role_id is not None:
        role = db.query(Role).filter(Role.id == user_up.role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        user.role_id = user_up.role_id
        
    if user_up.is_active is not None:
        user.is_active = user_up.is_active

    db.commit()
    db.refresh(user)

    log_action(
        db,
        action="UPDATE_USER",
        target_type="user",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=user.id,
        details=f"Super Admin updated user {user.email} permissions/roles."
    )

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role_id=user.role_id,
        role_name=user.role.name,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at
    )
