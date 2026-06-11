from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import Journal, Event, GalleryItem, NewsResource, ArchiveSetting
from app.services.cloudinary_service import delete_media
from app.utils.logging_service import log_action
import logging

logger = logging.getLogger(__name__)

def archive_stale_content():
    """
    Auto archives journals, events, gallery, and news resources according to active duration settings.
    Runs periodically as a background task.
    """
    db: Session = SessionLocal()
    try:
        now = datetime.utcnow()
        # Fetch all archive settings
        settings_list = db.query(ArchiveSetting).all()
        settings_dict = {s.category: s.duration_days for s in settings_list}

        # 1. Archive Journals
        journal_days = settings_dict.get("journals", 180)  # Default 6 months
        if journal_days > 0:
            threshold = now - timedelta(days=journal_days)
            stale_journals = db.query(Journal).filter(
                Journal.is_archived == False,
                Journal.is_deleted == False,
                Journal.created_at < threshold,
                Journal.status == "Approved"  # Only archive approved ones
            ).all()
            for j in stale_journals:
                j.is_archived = True
                log_action(
                    db,
                    action="AUTO_ARCHIVE",
                    target_type="journal",
                    target_id=j.id,
                    details=f"Journal '{j.title}' auto-archived after {journal_days} days."
                )

        # 2. Archive Events (Archive after event completion OR age duration)
        event_days = settings_dict.get("events", 30)  # Default 30 days
        stale_events = db.query(Event).filter(
            Event.is_archived == False,
            Event.is_deleted == False,
            (Event.date < now) | (Event.created_at < (now - timedelta(days=event_days)))
        ).all()
        for e in stale_events:
            e.is_archived = True
            log_action(
                db,
                action="AUTO_ARCHIVE",
                target_type="event",
                target_id=e.id,
                details=f"Event '{e.title}' auto-archived after passing event date or age threshold."
            )

        # 3. Archive Gallery Items
        gallery_days = settings_dict.get("gallery", 365)  # Default 1 year
        if gallery_days > 0:
            threshold = now - timedelta(days=gallery_days)
            stale_gallery = db.query(GalleryItem).filter(
                GalleryItem.is_archived == False,
                GalleryItem.is_deleted == False,
                GalleryItem.created_at < threshold
            ).all()
            for g in stale_gallery:
                g.is_archived = True
                log_action(
                    db,
                    action="AUTO_ARCHIVE",
                    target_type="gallery",
                    target_id=g.id,
                    details=f"Gallery item '{g.title}' auto-archived after {gallery_days} days."
                )

        # 4. Archive News & Resources
        news_days = settings_dict.get("news", 180)  # Default 6 months
        if news_days > 0:
            threshold = now - timedelta(days=news_days)
            stale_news = db.query(NewsResource).filter(
                NewsResource.is_archived == False,
                NewsResource.is_deleted == False,
                NewsResource.created_at < threshold
            ).all()
            for n in stale_news:
                n.is_archived = True
                log_action(
                    db,
                    action="AUTO_ARCHIVE",
                    target_type="resource",
                    target_id=n.id,
                    details=f"News/Resource '{n.title}' auto-archived after {news_days} days."
                )

        db.commit()
        logger.info("Successfully executed auto-archive routines.")
    except Exception as ex:
        db.rollback()
        logger.error(f"Error during auto-archive routines: {str(ex)}")
    finally:
        db.close()


def purge_recycle_bin():
    """
    Permanently deletes soft-deleted records from Supabase and purges their Cloudinary media
    if soft-deleted more than 15 days ago.
    """
    db: Session = SessionLocal()
    try:
        now = datetime.utcnow()
        threshold = now - timedelta(days=15)

        # 1. Purge Journals
        deleted_journals = db.query(Journal).filter(
            Journal.is_deleted == True,
            Journal.deleted_at < threshold
        ).all()
        for j in deleted_journals:
            delete_media(j.content_url)
            db.delete(j)
            logger.info(f"Purged expired Journal {j.id} from database.")

        # 2. Purge Events
        deleted_events = db.query(Event).filter(
            Event.is_deleted == True,
            Event.deleted_at < threshold
        ).all()
        for e in deleted_events:
            delete_media(e.banner_url)
            db.delete(e)
            logger.info(f"Purged expired Event {e.id} from database.")

        # 3. Purge Gallery
        deleted_gallery = db.query(GalleryItem).filter(
            GalleryItem.is_deleted == True,
            GalleryItem.deleted_at < threshold
        ).all()
        for g in deleted_gallery:
            delete_media(g.image_url)
            db.delete(g)
            logger.info(f"Purged expired Gallery item {g.id} from database.")

        # 4. Purge News & Resources
        deleted_news = db.query(NewsResource).filter(
            NewsResource.is_deleted == True,
            NewsResource.deleted_at < threshold
        ).all()
        for n in deleted_news:
            if n.file_url:
                delete_media(n.file_url)
            db.delete(n)
            logger.info(f"Purged expired News/Resource {n.id} from database.")

        db.commit()
        logger.info("Successfully executed recycle bin purge routines.")
    except Exception as ex:
        db.rollback()
        logger.error(f"Error during recycle bin purge routines: {str(ex)}")
    finally:
        db.close()
