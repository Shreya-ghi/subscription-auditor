import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure backend root is on sys.path so 'app' imports work seamlessly
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app
from app.database import Base, get_db
from app import models


@pytest.fixture(scope="function")
def db_session(tmp_path):
    """
    Creates an isolated, temporary SQLite database for each test function.
    Guarantees that tests never read, modify, or delete the real application database.
    """
    # Create a unique database file in a temporary folder
    test_db_file = tmp_path / "test_subscriptions.db"
    test_db_url = f"sqlite:///{test_db_file.as_posix()}"

    # Use StaticPool to maintain a consistent connection in the test thread
    test_engine = create_engine(
        test_db_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Create tables in the temporary database
    Base.metadata.create_all(bind=test_engine)

    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine,
    )

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)
        test_engine.dispose()


@pytest.fixture(scope="function")
def client(db_session):
    """
    FastAPI TestClient fixture with dependency override for get_db.
    Ensures every route handler uses the isolated test database session.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
