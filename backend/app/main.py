import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import database and models so SQLAlchemy registers tables before create_all
from app.database import Base, engine
from app import models
from app.routes.subscriptions import router as subscriptions_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.
    Runs on startup to ensure SQLite tables are created before serving requests.
    """
    # Create all registered tables if they do not already exist
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Smart Subscription & Recurring Expense Auditor API",
    version="1.0.0",
    description="API for tracking recurring subscriptions, expenses, and renewal auditing.",
    lifespan=lifespan
)

# Allowed frontend origins: default local development URLs
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Read optional comma-separated origins from ALLOWED_ORIGINS environment variable
env_origins = os.getenv("ALLOWED_ORIGINS", "")
custom_origins = [
    origin.strip()
    for origin in env_origins.split(",")
    if origin.strip() and origin.strip() != "*"
]

# Combine and deduplicate origins without wildcards
origins = list(dict.fromkeys(default_origins + custom_origins))

# Configure CORS middleware to enable communication with the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Subscription CRUD router
app.include_router(subscriptions_router)


@app.get("/")
def read_root():
    """
    Root endpoint confirming the API backend is running.
    """
    return {
        "message": "Smart Subscription & Recurring Expense Auditor API is running",
        "docs_url": "/docs"
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint for monitoring API service availability.
    """
    return {"status": "healthy"}
