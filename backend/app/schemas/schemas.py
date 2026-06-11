from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    email: str
    full_name: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Role Schemas
class RoleBase(BaseModel):
    name: str
    permissions: Dict[str, bool] = {}

class RoleCreate(RoleBase):
    pass

class RoleResponse(RoleBase):
    id: int
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenRefreshRequest(BaseModel):
    refresh_token: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    role_id: int
    role_name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Journal Schemas
class JournalBase(BaseModel):
    title: str
    abstract: str
    content_url: str
    tags: Optional[str] = None
    category: str

class JournalCreate(JournalBase):
    pass

class JournalUpdate(BaseModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    content_url: Optional[str] = None
    tags: Optional[str] = None
    category: Optional[str] = None

class JournalModerate(BaseModel):
    status: str  # Approved or Rejected
    moderator_comment: Optional[str] = None

class JournalResponse(JournalBase):
    id: int
    author_id: int
    author_name: str
    status: str
    moderator_comment: Optional[str] = None
    is_archived: bool
    is_deleted: bool
    deleted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Event Schemas
class EventBase(BaseModel):
    title: str
    description: str
    date: datetime
    location: str
    banner_url: str
    registration_url: Optional[str] = None
    is_mun: bool = False

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    location: Optional[str] = None
    banner_url: Optional[str] = None
    registration_url: Optional[str] = None
    is_mun: Optional[bool] = None

class EventResponse(EventBase):
    id: int
    is_archived: bool
    is_deleted: bool
    deleted_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Gallery Schemas
class GalleryBase(BaseModel):
    title: str
    image_url: str
    category: str

class GalleryCreate(GalleryBase):
    pass

class GalleryUpdate(BaseModel):
    title: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None

class GalleryResponse(GalleryBase):
    id: int
    is_archived: bool
    is_deleted: bool
    deleted_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# News & Resources Schemas
class NewsResourceBase(BaseModel):
    title: str
    type: str  # News, Resource
    category: str  # General, MUN RoP, MUN Country Guide
    content: Optional[str] = None
    file_url: Optional[str] = None

class NewsResourceCreate(NewsResourceBase):
    pass

class NewsResourceUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    content: Optional[str] = None
    file_url: Optional[str] = None

class NewsResourceResponse(NewsResourceBase):
    id: int
    is_archived: bool
    is_deleted: bool
    deleted_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: str
    action: str
    target_type: str
    target_id: Optional[int] = None
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Archive Setting Schemas
class ArchiveSettingBase(BaseModel):
    category: str
    duration_days: int

class ArchiveSettingUpdate(BaseModel):
    duration_days: int

class ArchiveSettingResponse(ArchiveSettingBase):
    id: int

    class Config:
        from_attributes = True

# Analytics & Dashboard Schema
class DashboardAnalytics(BaseModel):
    total_users: int
    total_journals: int
    pending_journals: int
    total_events: int
    total_gallery: int
    total_news_resources: int
    total_archived: int
    total_recycled: int

# Gallery Category Schemas
class GalleryCategoryBase(BaseModel):
    name: str

class GalleryCategoryCreate(GalleryCategoryBase):
    pass

class GalleryCategoryResponse(GalleryCategoryBase):
    id: int
    
    class Config:
        from_attributes = True
