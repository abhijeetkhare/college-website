from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import Journal, User, Role
from app.schemas.schemas import JournalResponse, JournalModerate
from app.auth.auth import get_current_user, PermissionChecker
from app.services.cloudinary_service import upload_media, delete_media
from app.utils.logging_service import log_action
import datetime

router = APIRouter(prefix="/api/journals", tags=["Journals Management"])

# Public Routes
@router.get("", response_model=List[JournalResponse])
def get_public_journals(
    search: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Journal).join(User).filter(
        Journal.status == "Approved",
        Journal.is_archived == False,
        Journal.is_deleted == False
    )

    if search:
        query = query.filter(
            (Journal.title.ilike(f"%{search}%")) | 
            (Journal.abstract.ilike(f"%{search}%"))
        )
    if category:
        query = query.filter(Journal.category == category)
    if tag:
        query = query.filter(Journal.tags.ilike(f"%{tag}%"))

    journals = query.all()
    return [
        JournalResponse(
            id=j.id,
            title=j.title,
            abstract=j.abstract,
            content_url=j.content_url,
            author_id=j.author_id,
            author_name=j.author.full_name,
            tags=j.tags,
            category=j.category,
            status=j.status,
            moderator_comment=j.moderator_comment,
            is_archived=j.is_archived,
            is_deleted=j.is_deleted,
            deleted_at=j.deleted_at,
            created_at=j.created_at,
            updated_at=j.updated_at
        ) for j in journals
    ]

@router.get("/detail/{journal_id}", response_model=JournalResponse)
def get_journal_detail(journal_id: int, db: Session = Depends(get_db)):
    journal = db.query(Journal).filter(
        Journal.id == journal_id,
        Journal.is_deleted == False
    ).first()
    
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
        
    return JournalResponse(
        id=journal.id,
        title=journal.title,
        abstract=journal.abstract,
        content_url=journal.content_url,
        author_id=journal.author_id,
        author_name=journal.author.full_name,
        tags=journal.tags,
        category=journal.category,
        status=journal.status,
        moderator_comment=journal.moderator_comment,
        is_archived=journal.is_archived,
        is_deleted=journal.is_deleted,
        deleted_at=journal.deleted_at,
        created_at=journal.created_at,
        updated_at=journal.updated_at
    )

# Registered User Routes
@router.post("/submit", response_model=JournalResponse, status_code=status.HTTP_201_CREATED)
async def submit_journal(
    title: str = Form(...),
    abstract: str = Form(...),
    category: str = Form(...),
    tags: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate PDF extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF submissions are allowed.")

    try:
        # Upload PDF to Cloudinary raw/docs storage
        file_bytes = await file.read()
        cloudinary_url = upload_media(file_bytes, file.filename, folder="journals")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload journal PDF: {str(e)}")

    db_journal = Journal(
        title=title,
        abstract=abstract,
        content_url=cloudinary_url,
        author_id=current_user.id,
        tags=tags,
        category=category,
        status="Pending"
    )
    db.add(db_journal)
    db.commit()
    db.refresh(db_journal)

    log_action(
        db,
        action="SUBMIT_JOURNAL",
        target_type="journal",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=db_journal.id,
        details=f"User {current_user.email} submitted journal '{title}' for approval."
    )

    return JournalResponse(
        id=db_journal.id,
        title=db_journal.title,
        abstract=db_journal.abstract,
        content_url=db_journal.content_url,
        author_id=db_journal.author_id,
        author_name=current_user.full_name,
        tags=db_journal.tags,
        category=db_journal.category,
        status=db_journal.status,
        moderator_comment=db_journal.moderator_comment,
        is_archived=db_journal.is_archived,
        is_deleted=db_journal.is_deleted,
        deleted_at=db_journal.deleted_at,
        created_at=db_journal.created_at,
        updated_at=db_journal.updated_at
    )

@router.get("/my-submissions", response_model=List[JournalResponse])
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    journals = db.query(Journal).filter(
        Journal.author_id == current_user.id,
        Journal.is_deleted == False
    ).order_by(Journal.created_at.desc()).all()

    return [
        JournalResponse(
            id=j.id,
            title=j.title,
            abstract=j.abstract,
            content_url=j.content_url,
            author_id=j.author_id,
            author_name=current_user.full_name,
            tags=j.tags,
            category=j.category,
            status=j.status,
            moderator_comment=j.moderator_comment,
            is_archived=j.is_archived,
            is_deleted=j.is_deleted,
            deleted_at=j.deleted_at,
            created_at=j.created_at,
            updated_at=j.updated_at
        ) for j in journals
    ]

# Admin/Moderation Routes
@router.get("/admin/all", response_model=List[JournalResponse])
def admin_get_all_journals(
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_journals"))
):
    # Non-deleted journals
    journals = db.query(Journal).filter(Journal.is_deleted == False).order_by(Journal.created_at.desc()).all()
    return [
        JournalResponse(
            id=j.id,
            title=j.title,
            abstract=j.abstract,
            content_url=j.content_url,
            author_id=j.author_id,
            author_name=j.author.full_name,
            tags=j.tags,
            category=j.category,
            status=j.status,
            moderator_comment=j.moderator_comment,
            is_archived=j.is_archived,
            is_deleted=j.is_deleted,
            deleted_at=j.deleted_at,
            created_at=j.created_at,
            updated_at=j.updated_at
        ) for j in journals
    ]

@router.put("/moderate/{journal_id}", response_model=JournalResponse)
def moderate_journal(
    journal_id: int,
    mod: JournalModerate,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_journals"))
):
    journal = db.query(Journal).filter(Journal.id == journal_id, Journal.is_deleted == False).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")

    if mod.status not in ["Approved", "Rejected"]:
        raise HTTPException(status_code=400, detail="Invalid moderation status")

    journal.status = mod.status
    journal.moderator_comment = mod.moderator_comment
    db.commit()
    db.refresh(journal)

    log_action(
        db,
        action=f"MODERATE_{mod.status.upper()}",
        target_type="journal",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=journal.id,
        details=f"Moderator approved/rejected journal '{journal.title}' with comment: {mod.moderator_comment}"
    )

    return JournalResponse(
        id=journal.id,
        title=journal.title,
        abstract=journal.abstract,
        content_url=journal.content_url,
        author_id=journal.author_id,
        author_name=journal.author.full_name,
        tags=journal.tags,
        category=journal.category,
        status=journal.status,
        moderator_comment=journal.moderator_comment,
        is_archived=journal.is_archived,
        is_deleted=journal.is_deleted,
        deleted_at=journal.deleted_at,
        created_at=journal.created_at,
        updated_at=journal.updated_at
    )

@router.put("/archive/{journal_id}", response_model=JournalResponse)
def toggle_archive_journal(
    journal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_journals"))
):
    journal = db.query(Journal).filter(Journal.id == journal_id, Journal.is_deleted == False).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")

    journal.is_archived = not journal.is_archived
    db.commit()
    db.refresh(journal)

    log_action(
        db,
        action="ARCHIVE_TOGGLE",
        target_type="journal",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=journal.id,
        details=f"Journal '{journal.title}' archive toggled to {journal.is_archived}."
    )

    return JournalResponse(
        id=journal.id,
        title=journal.title,
        abstract=journal.abstract,
        content_url=journal.content_url,
        author_id=journal.author_id,
        author_name=journal.author.full_name,
        tags=journal.tags,
        category=journal.category,
        status=journal.status,
        moderator_comment=journal.moderator_comment,
        is_archived=journal.is_archived,
        is_deleted=journal.is_deleted,
        deleted_at=journal.deleted_at,
        created_at=journal.created_at,
        updated_at=journal.updated_at
    )

@router.delete("/{journal_id}", status_code=status.HTTP_200_OK)
def soft_delete_journal(
    journal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_journals"))
):
    journal = db.query(Journal).filter(Journal.id == journal_id, Journal.is_deleted == False).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")

    journal.is_deleted = True
    journal.deleted_at = datetime.datetime.utcnow()
    db.commit()

    log_action(
        db,
        action="SOFT_DELETE",
        target_type="journal",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=journal.id,
        details=f"Soft deleted journal '{journal.title}', moved to Recycle Bin."
    )

    return {"message": "Journal soft deleted and sent to Recycle Bin."}
