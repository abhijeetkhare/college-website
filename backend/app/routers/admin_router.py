from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models.models import Journal, Event, GalleryItem, NewsResource, ArchiveSetting, User
from app.schemas.schemas import ArchiveSettingResponse, ArchiveSettingUpdate
from app.auth.auth import PermissionChecker, require_super_admin
from app.services.cloudinary_service import delete_media
from app.utils.logging_service import log_action

router = APIRouter(prefix="/api/admin", tags=["Admin System Control"])

# RECYCLE BIN ENDPOINTS
@router.get("/recycle-bin", response_model=Dict[str, List[Any]])
def get_recycle_bin(
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_journals"))  # Any content admin or super admin
):
    # Retrieve all soft-deleted items across all models
    journals = db.query(Journal).filter(Journal.is_deleted == True).all()
    events = db.query(Event).filter(Event.is_deleted == True).all()
    gallery = db.query(GalleryItem).filter(GalleryItem.is_deleted == True).all()
    resources = db.query(NewsResource).filter(NewsResource.is_deleted == True).all()

    return {
        "journals": [
            {
                "id": j.id,
                "title": j.title,
                "category": j.category,
                "deleted_at": j.deleted_at,
                "author_name": j.author.full_name
            } for j in journals
        ],
        "events": [
            {
                "id": e.id,
                "title": e.title,
                "deleted_at": e.deleted_at,
                "date": e.date
            } for e in events
        ],
        "gallery": [
            {
                "id": g.id,
                "title": g.title,
                "deleted_at": g.deleted_at,
                "category": g.category,
                "image_url": g.image_url
            } for g in gallery
        ],
        "resources": [
            {
                "id": r.id,
                "title": r.title,
                "deleted_at": r.deleted_at,
                "type": r.type,
                "category": r.category
            } for r in resources
        ]
    }

@router.put("/recycle-bin/restore/{item_type}/{item_id}", status_code=status.HTTP_200_OK)
def restore_recycled_item(
    item_type: str,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_journals"))
):
    title = ""
    if item_type == "journal":
        item = db.query(Journal).filter(Journal.id == item_id, Journal.is_deleted == True).first()
        if item:
            item.is_deleted = False
            item.deleted_at = None
            title = item.title
    elif item_type == "event":
        item = db.query(Event).filter(Event.id == item_id, Event.is_deleted == True).first()
        if item:
            item.is_deleted = False
            item.deleted_at = None
            title = item.title
    elif item_type == "gallery":
        item = db.query(GalleryItem).filter(GalleryItem.id == item_id, GalleryItem.is_deleted == True).first()
        if item:
            item.is_deleted = False
            item.deleted_at = None
            title = item.title
    elif item_type == "resource":
        item = db.query(NewsResource).filter(NewsResource.id == item_id, NewsResource.is_deleted == True).first()
        if item:
            item.is_deleted = False
            item.deleted_at = None
            title = item.title
    else:
        raise HTTPException(status_code=400, detail="Invalid item type")

    if not item:
        raise HTTPException(status_code=404, detail=f"Soft-deleted {item_type} not found")

    db.commit()

    log_action(
        db,
        action="RESTORE_ITEM",
        target_type=item_type,
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=item_id,
        details=f"Admin restored {item_type} '{title}' from Recycle Bin."
    )

    return {"message": f"Successfully restored {item_type} from Recycle Bin."}

@router.delete("/recycle-bin/purge/{item_type}/{item_id}", status_code=status.HTTP_200_OK)
def permanently_purge_item(
    item_type: str,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)  # Only Super Admin can hard-delete permanently!
):
    title = ""
    if item_type == "journal":
        item = db.query(Journal).filter(Journal.id == item_id, Journal.is_deleted == True).first()
        if item:
            delete_media(item.content_url)
            title = item.title
            db.delete(item)
    elif item_type == "event":
        item = db.query(Event).filter(Event.id == item_id, Event.is_deleted == True).first()
        if item:
            delete_media(item.banner_url)
            title = item.title
            db.delete(item)
    elif item_type == "gallery":
        item = db.query(GalleryItem).filter(GalleryItem.id == item_id, GalleryItem.is_deleted == True).first()
        if item:
            delete_media(item.image_url)
            title = item.title
            db.delete(item)
    elif item_type == "resource":
        item = db.query(NewsResource).filter(NewsResource.id == item_id, NewsResource.is_deleted == True).first()
        if item:
            if item.file_url:
                delete_media(item.file_url)
            title = item.title
            db.delete(item)
    else:
        raise HTTPException(status_code=400, detail="Invalid item type")

    if not item:
        raise HTTPException(status_code=404, detail=f"Soft-deleted {item_type} not found")

    db.commit()

    log_action(
        db,
        action="PERMANENT_DELETE",
        target_type=item_type,
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=item_id,
        details=f"Super Admin permanently purged {item_type} '{title}' and deleted related files."
    )

    return {"message": f"Successfully permanently deleted {item_type}."}

# DYNAMIC ARCHIVE SETTINGS ENDPOINTS
@router.get("/archive-settings", response_model=List[ArchiveSettingResponse])
def get_archive_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_journals"))
):
    settings = db.query(ArchiveSetting).all()
    return settings

@router.put("/archive-settings/{setting_id}", response_model=ArchiveSettingResponse)
def update_archive_setting(
    setting_id: int,
    setting_up: ArchiveSettingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    setting = db.query(ArchiveSetting).filter(ArchiveSetting.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Archive setting not found")

    setting.duration_days = setting_up.duration_days
    db.commit()
    db.refresh(setting)

    log_action(
        db,
        action="UPDATE_ARCHIVE_SETTING",
        target_type="setting",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=setting.id,
        details=f"Super Admin updated auto-archive duration for '{setting.category}' to {setting.duration_days} days."
    )

    return setting
