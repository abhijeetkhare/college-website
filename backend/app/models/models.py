from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    permissions = Column(JSON, nullable=False, default=dict)

    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    role = relationship("Role", back_populates="users")
    journals = relationship("Journal", back_populates="author")

class Journal(Base):
    __tablename__ = "journals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    abstract = Column(Text, nullable=False)
    content_url = Column(String(500), nullable=False)  # PDF URL
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tags = Column(String(255), nullable=True)  # Comma-separated tags
    category = Column(String(100), nullable=False)
    status = Column(String(50), default="Pending")  # Pending, Approved, Rejected
    moderator_comment = Column(Text, nullable=True)
    is_archived = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = relationship("User", back_populates="journals")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    date = Column(DateTime, nullable=False)
    location = Column(String(255), nullable=False)
    banner_url = Column(String(500), nullable=False)
    registration_url = Column(String(500), nullable=True)
    is_mun = Column(Boolean, default=False)  # Dedicated Model United Nations tag
    is_archived = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class GalleryCategory(Base):
    __tablename__ = "gallery_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)

class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    image_url = Column(String(500), nullable=False)
    category = Column(String(100), nullable=False)  # General, Debating, Literary, MUN
    is_archived = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class NewsResource(Base):
    __tablename__ = "news_resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # News, Resource
    category = Column(String(100), nullable=False)  # E.g. General, MUN RoP, MUN Country Guide
    content = Column(Text, nullable=True)
    file_url = Column(String(500), nullable=True)  # Optional attached document
    is_archived = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_email = Column(String(100), nullable=False)  # Capture email directly for audits
    action = Column(String(100), nullable=False)  # E.g. LOGIN, CREATE_EVENT, RESTORE_JOURNAL, DELETE_LOG
    target_type = Column(String(50), nullable=False)  # journal, event, gallery, resource, user, log
    target_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ArchiveSetting(Base):
    __tablename__ = "archive_settings"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), unique=True, index=True, nullable=False)  # journals, events, gallery, news
    duration_days = Column(Integer, nullable=False, default=180)  # 6 months default
