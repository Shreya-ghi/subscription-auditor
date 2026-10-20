from sqlalchemy import Column, Integer, String, Float, Date
from app.database import Base


class Subscription(Base):
    """
    SQLAlchemy model representing a recurring subscription or expense.
    """
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    billing_cycle = Column(String, nullable=False)
    next_renewal = Column(Date, nullable=False)
