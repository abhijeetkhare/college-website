import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager

from app.database import engine, Base, SessionLocal
from app.config import settings
from app.auth.auth import get_password_hash
from app.models.models import Role, User, ArchiveSetting, GalleryCategory
from app.services.scheduler_service import archive_stale_content, purge_recycle_bin

# Import Routers
from app.routers import (
    auth_router,
    users_router,
    journals_router,
    events_router,
    gallery_router,
    resources_router,
    logs_router,
    analytics_router,
    admin_router
)

# Startup Database Seeding logic
def seed_database():
    db = SessionLocal()
    try:
        # Create Tables
        Base.metadata.create_all(bind=engine)

        # Seed Default Roles
        default_roles = [
            {
                "name": "Super Admin",
                "permissions": {
                    "manage_journals": True,
                    "manage_events": True,
                    "manage_gallery": True,
                    "manage_users": True,
                    "view_logs": True,
                    "delete_logs": True
                }
            },
            {
                "name": "Content Admin",
                "permissions": {
                    "manage_journals": True,
                    "manage_events": True,
                    "manage_gallery": False,
                    "manage_users": False,
                    "view_logs": False,
                    "delete_logs": False
                }
            },
            {
                "name": "Gallery Admin",
                "permissions": {
                    "manage_journals": False,
                    "manage_events": False,
                    "manage_gallery": True,
                    "manage_users": False,
                    "view_logs": False,
                    "delete_logs": False
                }
            },
            {
                "name": "Moderator",
                "permissions": {
                    "manage_journals": True,
                    "manage_events": False,
                    "manage_gallery": False,
                    "manage_users": False,
                    "view_logs": False,
                    "delete_logs": False
                }
            },
            {
                "name": "User",
                "permissions": {
                    "manage_journals": False,
                    "manage_events": False,
                    "manage_gallery": False,
                    "manage_users": False,
                    "view_logs": False,
                    "delete_logs": False
                }
            }
        ]

        for r_data in default_roles:
            role = db.query(Role).filter(Role.name == r_data["name"]).first()
            if not role:
                role = Role(name=r_data["name"], permissions=r_data["permissions"])
                db.add(role)
        db.commit()

        # Seed Default Super Admin
        super_admin_role = db.query(Role).filter(Role.name == "Super Admin").first()
        admin_user = db.query(User).filter(User.role_id == super_admin_role.id).first()
        if not admin_user:
            hashed_pw = get_password_hash(settings.ADMIN_INITIAL_PASSWORD)
            admin_user = User(
                email=settings.ADMIN_INITIAL_EMAIL,
                hashed_password=hashed_pw,
                full_name="Super Administrator",
                role_id=super_admin_role.id
            )
            db.add(admin_user)
            db.commit()
            print(f"Bootstrapped default Super Admin: {settings.ADMIN_INITIAL_EMAIL}")

        # Seed Default Archive Settings
        default_archive_settings = [
            {"category": "journals", "duration_days": 180},
            {"category": "events", "duration_days": 30},
            {"category": "gallery", "duration_days": 365},
            {"category": "news", "duration_days": 180}
        ]

        for s_data in default_archive_settings:
            setting = db.query(ArchiveSetting).filter(ArchiveSetting.category == s_data["category"]).first()
            if not setting:
                setting = ArchiveSetting(category=s_data["category"], duration_days=s_data["duration_days"])
                db.add(setting)
        db.commit()

        # Seed Default Gallery Categories
        default_categories = ["General", "Debating", "Literary", "MUN"]
        for cat_name in default_categories:
            cat = db.query(GalleryCategory).filter(GalleryCategory.name == cat_name).first()
            if not cat:
                db.add(GalleryCategory(name=cat_name))
        db.commit()

    except Exception as e:
        print(f"Error during seeding: {str(e)}")
    finally:
        db.close()


# Background Scheduler Setup
scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Events
    seed_database()
    
    # Add Background Jobs
    scheduler.add_job(archive_stale_content, 'interval', hours=1, id='archive_job')
    scheduler.add_job(purge_recycle_bin, 'interval', hours=24, id='purge_job')
    scheduler.start()
    
    yield
    
    # Shutdown Events
    scheduler.shutdown()


app = FastAPI(
    title="The Round Table (Kirori Mal College) Portal APIs",
    description="Backend services supporting public reading, events registration, journals moderation, and recycle bin flows.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware Configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For deployment can adjust to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Aggregating Routers
app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(journals_router.router)
app.include_router(events_router.router)
app.include_router(gallery_router.router)
app.include_router(resources_router.router)
app.include_router(logs_router.router)
app.include_router(analytics_router.router)
app.include_router(admin_router.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to The Round Table (KMC, Delhi University) official portal APIs",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
