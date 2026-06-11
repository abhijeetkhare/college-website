from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import NewsResource, User
from app.schemas.schemas import NewsResourceResponse
from app.auth.auth import PermissionChecker
from app.services.cloudinary_service import upload_media
from app.utils.logging_service import log_action
import datetime

router = APIRouter(prefix="/api/resources", tags=["News & Resources"])

@router.get("", response_model=List[NewsResourceResponse])
def get_public_resources(
    type: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(NewsResource).filter(
        NewsResource.is_deleted == False,
        NewsResource.is_archived == False
    )

    if type:
        query = query.filter(NewsResource.type == type)
    if category:
        query = query.filter(NewsResource.category == category)

    items = query.order_by(NewsResource.created_at.desc()).all()
    return items

@router.post("", response_model=NewsResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_news_resource(
    title: str = Form(...),
    type: str = Form(...),  # News, Resource
    category: str = Form(...),  # E.g. General, MUN RoP, MUN Country Guide
    content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_journals"))  # content admin permission
):
    file_url = None
    if file is not None and file.filename != "":
        try:
            file_bytes = await file.read()
            file_url = upload_media(file_bytes, file.filename, folder="resources")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload resource file: {str(e)}")

    db_item = NewsResource(
        title=title,
        type=type,
        category=category,
        content=content,
        file_url=file_url
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    log_action(
        db,
        action="CREATE_RESOURCE",
        target_type="resource",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=db_item.id,
        details=f"Admin created {type} item '{title}' (Category={category})."
    )

    return db_item

@router.put("/{resource_id}", response_model=NewsResourceResponse)
async def update_news_resource(
    resource_id: int,
    title: Optional[str] = Form(None),
    type: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_journals"))
):
    item = db.query(NewsResource).filter(NewsResource.id == resource_id, NewsResource.is_deleted == False).first()
    if not item:
        raise HTTPException(status_code=404, detail="Resource not found")

    if title is not None:
        item.title = title
    if type is not None:
        item.type = type
    if category is not None:
        item.category = category
    if content is not None:
        item.content = content if content else None

    if file is not None and file.filename != "":
        try:
            file_bytes = await file.read()
            file_url = upload_media(file_bytes, file.filename, folder="resources")
            item.file_url = file_url
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload new resource file: {str(e)}")

    db.commit()
    db.refresh(item)

    log_action(
        db,
        action="UPDATE_RESOURCE",
        target_type="resource",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=item.id,
        details=f"Admin updated resource/news '{item.title}' details."
    )

    return item

@router.delete("/{resource_id}", status_code=status.HTTP_200_OK)
def soft_delete_news_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_journals"))
):
    item = db.query(NewsResource).filter(NewsResource.id == resource_id, NewsResource.is_deleted == False).first()
    if not item:
        raise HTTPException(status_code=404, detail="Resource not found")

    item.is_deleted = True
    item.deleted_at = datetime.datetime.utcnow()
    db.commit()

    log_action(
        db,
        action="SOFT_DELETE",
        target_type="resource",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=item.id,
        details=f"Soft deleted news/resource '{item.title}'."
    )

    return {"message": "Resource soft deleted."}
