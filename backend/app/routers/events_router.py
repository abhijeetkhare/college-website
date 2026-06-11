from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import Event, User
from app.schemas.schemas import EventResponse
from app.auth.auth import get_current_user, PermissionChecker
from app.services.cloudinary_service import upload_media
from app.utils.logging_service import log_action
import datetime

router = APIRouter(prefix="/api/events", tags=["Events Management"])

@router.get("", response_model=List[EventResponse])
def get_public_events(
    is_mun: Optional[bool] = None,
    include_past: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(Event).filter(
        Event.is_deleted == False,
        Event.is_archived == False
    )

    if is_mun is not None:
        query = query.filter(Event.is_mun == is_mun)
    
    if not include_past:
        query = query.filter(Event.date >= datetime.datetime.utcnow())

    events = query.order_by(Event.date.asc()).all()
    return events

@router.get("/detail/{event_id}", response_model=EventResponse)
def get_event_detail(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.is_deleted == False
    ).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    title: str = Form(...),
    description: str = Form(...),
    date_str: str = Form(...),  # Expect ISO string like YYYY-MM-DDTHH:MM
    location: str = Form(...),
    registration_url: Optional[str] = Form(None),
    is_mun: bool = Form(False),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_events"))
):
    try:
        event_date = datetime.datetime.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM)")

    try:
        file_bytes = await file.read()
        banner_url = upload_media(file_bytes, file.filename, folder="events")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload event banner: {str(e)}")

    db_event = Event(
        title=title,
        description=description,
        date=event_date,
        location=location,
        banner_url=banner_url,
        registration_url=registration_url,
        is_mun=is_mun
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    log_action(
        db,
        action="CREATE_EVENT",
        target_type="event",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=db_event.id,
        details=f"Admin created event '{title}' (MUN={is_mun})."
    )

    return db_event

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    date_str: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    registration_url: Optional[str] = Form(None),
    is_mun: Optional[bool] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_events"))
):
    event = db.query(Event).filter(Event.id == event_id, Event.is_deleted == False).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if title is not None:
        event.title = title
    if description is not None:
        event.description = description
    if date_str is not None:
        try:
            event.date = datetime.datetime.fromisoformat(date_str)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM)")
    if location is not None:
        event.location = location
    if registration_url is not None:
        event.registration_url = registration_url if registration_url else None
    if is_mun is not None:
        event.is_mun = is_mun

    if file is not None:
        try:
            file_bytes = await file.read()
            banner_url = upload_media(file_bytes, file.filename, folder="events")
            event.banner_url = banner_url
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload new banner: {str(e)}")

    db.commit()
    db.refresh(event)

    log_action(
        db,
        action="UPDATE_EVENT",
        target_type="event",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=event.id,
        details=f"Admin updated event '{event.title}' details."
    )

    return event

@router.delete("/{event_id}", status_code=status.HTTP_200_OK)
def soft_delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker("manage_events"))
):
    event = db.query(Event).filter(Event.id == event_id, Event.is_deleted == False).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event.is_deleted = True
    event.deleted_at = datetime.datetime.utcnow()
    db.commit()

    log_action(
        db,
        action="SOFT_DELETE",
        target_type="event",
        user_id=current_user.id,
        user_email=current_user.email,
        target_id=event.id,
        details=f"Soft deleted event '{event.title}', moved to Recycle Bin."
    )

    return {"message": "Event soft deleted."}
