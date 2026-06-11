from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.database import get_db
from app.models.models import AuditLog, User
from app.schemas.schemas import AuditLogResponse
from app.auth.auth import require_super_admin
from app.utils.logging_service import log_action
import datetime

router = APIRouter(prefix="/api/logs", tags=["Audit Logging"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    search: Optional[str] = None,
    action: Optional[str] = None,
    target_type: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    query = db.query(AuditLog)

    if search:
        query = query.filter(
            or_(
                AuditLog.user_email.ilike(f"%{search}%"),
                AuditLog.details.ilike(f"%{search}%")
            )
        )
    if action:
        query = query.filter(AuditLog.action == action)
    if target_type:
        query = query.filter(AuditLog.target_type == target_type)

    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).offset(offset).all()
    return logs

@router.delete("/{log_id}", status_code=status.HTTP_200_OK)
def delete_single_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    log_item = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    if not log_item:
        raise HTTPException(status_code=404, detail="Log entry not found")

    # Important: Record that a log was deleted. This permanent meta-log should NOT be delete-able or at least recorded.
    details = f"Super Admin {current_user.email} permanently deleted log ID {log_item.id} (Action: {log_item.action})."
    
    db.delete(log_item)
    db.commit()

    log_action(
        db,
        action="DELETE_LOG",
        target_type="log",
        user_id=current_user.id,
        user_email=current_user.email,
        details=details
    )

    return {"message": "Log entry successfully deleted."}

@router.post("/purge", status_code=status.HTTP_200_OK)
def purge_old_logs(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    if days < 7:
        raise HTTPException(status_code=400, detail="Cannot purge logs newer than 7 days.")

    threshold = datetime.datetime.utcnow() - datetime.timedelta(days=days)
    deleted_count = db.query(AuditLog).filter(AuditLog.created_at < threshold).delete()
    db.commit()

    log_action(
        db,
        action="PURGE_LOGS",
        target_type="log",
        user_id=current_user.id,
        user_email=current_user.email,
        details=f"Super Admin purged all audit logs older than {days} days. Total purged: {deleted_count}."
    )

    return {"message": f"Successfully purged {deleted_count} logs older than {days} days."}
