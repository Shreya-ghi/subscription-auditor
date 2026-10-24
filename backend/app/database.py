import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Absolute path to the backend directory (parent of app/)
BASE_DIR = Path(__file__).resolve().parent.parent

# Load local environment variables from backend/.env if present
load_dotenv(BASE_DIR / ".env")

# Default local database file inside backend/
DB_FILE = BASE_DIR / "subscriptions.db"

# Database connection URL from DATABASE_URL environment variable, or fallback to local SQLite
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{DB_FILE.as_posix()}"
)

# Normalize PostgreSQL URLs for SQLAlchemy 2+ and psycopg2 driver compatibility
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif SQLALCHEMY_DATABASE_URL.startswith("postgresql://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

# Only SQLite requires check_same_thread=False in multi-threaded environments like FastAPI
engine_kwargs = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

# Create engine with appropriate connection arguments
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    **engine_kwargs
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
