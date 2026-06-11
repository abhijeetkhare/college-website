from sqlalchemy.orm import Session
from app.models.models import AuditLog
import logging

logger = logging.getLogger(__name__)

def log_action(
    db: Session,
    action: str,
    target_type: str,
    user_id: int = None,
    user_email: str = "guest@theroundtablekmc.in",
    target_id: int = None,
    details: str = None
) -> AuditLog:
    try:
        db_log = AuditLog(
            user_id=user_id,
            user_email=user_email,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to record audit log: {str(e)}")
        # We don't fail the primary request if audit logging fails
        return None
