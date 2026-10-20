from datetime import date
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict, field_validator

# Allowed billing cycle options
VALID_BILLING_CYCLES = {"Monthly", "Quarterly", "Yearly"}


class SubscriptionBase(BaseModel):
    """
    Base Pydantic schema with shared subscription attributes and validation.
    """
    name: str = Field(..., description="Name of the subscription (e.g. Netflix, GitHub Pro)")
    category: str = Field(..., description="Category (e.g. Streaming, Productivity, Cloud)")
    amount: float = Field(..., gt=0, description="Recurring cost, must be greater than zero")
    billing_cycle: str = Field(..., description="Billing cycle: Monthly, Quarterly, or Yearly")
    next_renewal: date = Field(..., description="Next renewal date in YYYY-MM-DD format")

    @field_validator("name", "category")
    @classmethod
    def validate_not_empty(cls, value: str, info) -> str:
        """Ensure string fields are not empty or only whitespace."""
        trimmed = value.strip()
        if not trimmed:
            raise ValueError(f"{info.field_name} must not be empty")
        return trimmed

    @field_validator("billing_cycle")
    @classmethod
    def validate_billing_cycle(cls, value: str) -> str:
        """Ensure billing cycle is one of Monthly, Quarterly, or Yearly (case-insensitive input normalized)."""
        formatted = value.strip().capitalize()
        if formatted not in VALID_BILLING_CYCLES:
            raise ValueError("Billing cycle must be Monthly, Quarterly, or Yearly")
        return formatted


class SubscriptionCreate(SubscriptionBase):
    """Schema for creating a new subscription via POST."""
    pass


class SubscriptionUpdate(SubscriptionBase):
    """Schema for updating an existing subscription via PUT."""
    pass


class SubscriptionResponse(SubscriptionBase):
    """Schema for returning subscription data with database-generated ID."""
    id: int

    # Allows Pydantic to read data directly from SQLAlchemy ORM models
    model_config = ConfigDict(from_attributes=True)
