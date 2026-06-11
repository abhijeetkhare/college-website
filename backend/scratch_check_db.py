import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.database import engine, SessionLocal, Base
from app.models.models import User, Role, ArchiveSetting, GalleryCategory
from app.auth.auth import get_password_hash

def check():
    print("Checking Database Connection...")
    print(f"Database URL: {engine.url}")
    
    # Ensure all tables are created first
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check tables
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"Existing Tables in DB: {tables}")
        
        if 'users' in tables:
            users_count = db.query(User).count()
            print(f"Total Users in DB: {users_count}")
            
            users = db.query(User).all()
            for u in users:
                print(f"User ID: {u.id}, Email: {u.email}, Role ID: {u.role_id}, Role Name: {u.role.name if u.role else 'None'}, Active: {u.is_active}")
                
            # If the admin user doesn't exist, seed it explicitly here
            admin_email = "admin@theroundtablekmc.in"
            admin = db.query(User).filter(User.email == admin_email).first()
            if not admin:
                print(f"Admin user {admin_email} NOT found in database. Let's seed it now!")
                # Ensure roles are seeded first
                super_admin_role = db.query(Role).filter(Role.name == "Super Admin").first()
                if not super_admin_role:
                    print("Seeding Super Admin role...")
                    super_admin_role = Role(
                        name="Super Admin",
                        permissions={
                            "manage_journals": True,
                            "manage_events": True,
                            "manage_gallery": True,
                            "manage_users": True,
                            "view_logs": True,
                            "delete_logs": True
                        }
                    )
                    db.add(super_admin_role)
                    db.commit()
                    db.refresh(super_admin_role)
                
                # Check for standard user roles
                for role_name in ["Content Admin", "Gallery Admin", "Moderator", "User"]:
                    role = db.query(Role).filter(Role.name == role_name).first()
                    if not role:
                        db.add(Role(name=role_name, permissions={}))
                db.commit()
                
                hashed_pw = get_password_hash("KMC_RoundTablePass2026!")
                new_admin = User(
                    email=admin_email,
                    hashed_password=hashed_pw,
                    full_name="Super Administrator",
                    role_id=super_admin_role.id
                )
                db.add(new_admin)
                db.commit()
                print("Seeded Super Admin user successfully.")
            else:
                print(f"Admin user {admin_email} exists. Resetting password just in case!")
                hashed_pw = get_password_hash("KMC_RoundTablePass2026!")
                admin.hashed_password = hashed_pw
                # Ensure it has the correct role
                super_admin_role = db.query(Role).filter(Role.name == "Super Admin").first()
                if super_admin_role:
                    admin.role_id = super_admin_role.id
                admin.is_active = True
                db.commit()
                print("Reset password for admin successfully.")
        else:
            print("Users table does not exist. Creating tables and seeding...")
            Base.metadata.create_all(bind=engine)
            print("Created all tables. Please run this script again to seed.")
            
    except Exception as e:
        print(f"Error checking database: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    check()
