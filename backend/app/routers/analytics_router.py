from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Journal, Event, GalleryItem, NewsResource
from app.schemas.schemas import DashboardAnalytics
from app.auth.auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Dashboard Analytics"])

@router.get("", response_model=DashboardAnalytics)
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Any logged in user/admin can see analytics
):
    # Total Users
    total_users = db.query(User).count()
    
    # Total non-deleted journals
    total_journals = db.query(Journal).filter(Journal.is_deleted == False).count()
    pending_journals = db.query(Journal).filter(Journal.status == "Pending", Journal.is_deleted == False).count()
    
    # Total non-deleted events
    total_events = db.query(Event).filter(Event.is_deleted == False).count()
    
    # Total non-deleted gallery
    total_gallery = db.query(GalleryItem).filter(GalleryItem.is_deleted == False).count()
    
    # Total non-deleted resources
    total_news_resources = db.query(NewsResource).filter(NewsResource.is_deleted == False).count()
    
    # Total Archived items across all models
    archived_journals = db.query(Journal).filter(Journal.is_archived == True, Journal.is_deleted == False).count()
    archived_events = db.query(Event).filter(Event.is_archived == True, Event.is_deleted == False).count()
    archived_gallery = db.query(GalleryItem).filter(GalleryItem.is_archived == True, GalleryItem.is_deleted == False).count()
    archived_resources = db.query(NewsResource).filter(NewsResource.is_archived == True, NewsResource.is_deleted == False).count()
    total_archived = archived_journals + archived_events + archived_gallery + archived_resources

    # Total Recycled items
    recycled_journals = db.query(Journal).filter(Journal.is_deleted == True).count()
    recycled_events = db.query(Event).filter(Event.is_deleted == True).count()
    recycled_gallery = db.query(GalleryItem).filter(GalleryItem.is_deleted == True).count()
    recycled_resources = db.query(NewsResource).filter(NewsResource.is_deleted == True).count()
    total_recycled = recycled_journals + recycled_events + recycled_gallery + recycled_resources

    return DashboardAnalytics(
        total_users=total_users,
        total_journals=total_journals,
        pending_journals=pending_journals,
        total_events=total_events,
        total_gallery=total_gallery,
        total_news_resources=total_news_resources,
        total_archived=total_archived,
        total_recycled=total_recycled
    )
