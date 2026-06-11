from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import GalleryItem, User, GalleryCategory
from app.schemas.schemas import GalleryResponse, GalleryCategoryResponse, GalleryCategoryCreate
from app.auth.auth import PermissionChecker
from app.services.cloudinary_service import upload_media
from app.utils.logging_service import log_action
import datetime

router = APIRouter(prefix="/api/gallery", tags=["Gallery Management"])

@router.get("", response_model=List[GalleryResponse])
def get_public_gallery(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(GalleryItem).filter(
        GalleryItem.is_deleted == False,
        GalleryItem.is_archived == False
    )

    if category:
        query = query.filter(GalleryItem.category == category)

    items = query.order_by(GalleryItem.created_at.desc()).all()
    return items

@router.post("", response_model=GalleryResponse, status_code=status.HTTP_201_CREATED)
async def upload_gallery_image(
    title: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_gallery"))
):
    try:
        file_bytes = await file.read()
        image_url = upload_media(file_bytes, file.filename, folder="gallery")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload gallery image: {str(e)}")

    db_item = GalleryItem(
        title=title,
        image_url=image_url,
        category=category
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    log_action(
        db,
        action="UPLOAD_GALLERY",
        target_type="gallery",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=db_item.id,
        details=f"Admin uploaded image '{title}' to category '{category}'."
    )

    return db_item

@router.put("/{item_id}", response_model=GalleryResponse)
def update_gallery_item(
    item_id: int,
    title: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_gallery"))
):
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id, GalleryItem.is_deleted == False).first()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")

    if title is not None:
        item.title = title
    if category is not None:
        item.category = category

    db.commit()
    db.refresh(item)

    log_action(
        db,
        action="UPDATE_GALLERY",
        target_type="gallery",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=item.id,
        details=f"Admin updated gallery item '{item.title}' metadata."
    )

    return item

@router.delete("/{item_id}", status_code=status.HTTP_200_OK)
def soft_delete_gallery_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_gallery"))
):
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id, GalleryItem.is_deleted == False).first()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")

    item.is_deleted = True
    item.deleted_at = datetime.datetime.utcnow()
    db.commit()

    log_action(
        db,
        action="SOFT_DELETE",
        target_type="gallery",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=item.id,
        details=f"Soft deleted gallery image '{item.title}'."
    )

    return {"message": "Gallery item soft deleted."}

# CATEGORIES ENDPOINTS
@router.get("/categories", response_model=List[GalleryCategoryResponse])
def get_gallery_categories(db: Session = Depends(get_db)):
    return db.query(GalleryCategory).order_by(GalleryCategory.name.asc()).all()

@router.post("/categories", response_model=GalleryCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_gallery_category(
    category_in: GalleryCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_gallery"))
):
    # Check if category already exists (case-insensitive)
    existing = db.query(GalleryCategory).filter(GalleryCategory.name.ilike(category_in.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    category = GalleryCategory(name=category_in.name.strip())
    db.add(category)
    db.commit()
    db.refresh(category)

    log_action(
        db,
        action="CREATE_GALLERY_CATEGORY",
        target_type="gallery_category",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=category.id,
        details=f"Admin created gallery category '{category.name}'."
    )
    return category

@router.delete("/categories/{cat_id}", status_code=status.HTTP_200_OK)
def delete_gallery_category(
    cat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_gallery"))
):
    category = db.query(GalleryCategory).filter(GalleryCategory.id == cat_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Prevent deleting if there are active (non-deleted) gallery items in this category
    item_count = db.query(GalleryItem).filter(
        GalleryItem.category.ilike(category.name),
        GalleryItem.is_deleted == False
    ).count()
    if item_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete category '{category.name}' because it contains {item_count} active gallery item(s)."
        )

    # Perform hard delete of the category
    db.delete(category)
    db.commit()

    log_action(
        db,
        action="DELETE_GALLERY_CATEGORY",
        target_type="gallery_category",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=cat_id,
        details=f"Admin deleted gallery category '{category.name}'."
    )
    return {"message": f"Successfully deleted category '{category.name}'."}
