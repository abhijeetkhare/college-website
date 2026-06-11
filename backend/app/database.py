from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Attempt to connect to Supabase PostgreSQL, fallback to local SQLite if it fails
try:
    # Try creating direct/pooled PostgreSQL connection
    engine = create_engine(
        settings.DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        connect_args={"connect_timeout": 5}  # Short timeout for fallback checking
    )
    # Test immediate connection
    with engine.connect() as conn:
        logger.info("Successfully connected to Supabase PostgreSQL database.")
except Exception as e:
    logger.warning(f"Supabase connection failed ({str(e)}). Falling back to local SQLite database.")
    # SQLite fallback
    engine = create_engine(
        "sqlite:///./college_society.db",
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
