from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Absolute path to the backend directory (parent of app/)
BASE_DIR = Path(__file__).resolve().parent.parent

# Database file inside backend/
DB_FILE = BASE_DIR / "subscriptions.db"

# SQLite connection URL using forward slashes for cross-platform compatibility
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_FILE.as_posix()}"

# Create SQLite engine with check_same_thread=False (required for SQLite in multi-threaded environments like FastAPI)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Session factory for generating database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base class for models
Base = declarative_base()


def get_db():
    """
    Database session dependency generator for FastAPI endpoints.
    Ensures that each request gets its own session and cleans up when finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
