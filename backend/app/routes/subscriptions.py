from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app import schemas

router = APIRouter(
    prefix="/subscriptions",
    tags=["Subscriptions"]
)


@router.post(
    "/",
    response_model=schemas.SubscriptionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a subscription"
)
def create_subscription(
    subscription_in: schemas.SubscriptionCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new subscription record in the database.
    Returns HTTP 201 Created with the saved record.
    """
    subscription = models.Subscription(
        name=subscription_in.name,
        category=subscription_in.category,
        amount=subscription_in.amount,
        billing_cycle=subscription_in.billing_cycle,
        next_renewal=subscription_in.next_renewal
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


@router.get(
    "/",
    response_model=List[schemas.SubscriptionResponse],
    status_code=status.HTTP_200_OK,
    summary="List all subscriptions"
)
def list_subscriptions(
    db: Session = Depends(get_db)
):
    """
    Retrieve all subscriptions stored in the database.
    """
    subscriptions = db.query(models.Subscription).all()
    return subscriptions


@router.get(
    "/{subscription_id}",
    response_model=schemas.SubscriptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a subscription by ID"
)
def get_subscription(
    subscription_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific subscription by its ID.
    Returns HTTP 404 if the subscription does not exist.
    """
    subscription = (
        db.query(models.Subscription)
        .filter(models.Subscription.id == subscription_id)
        .first()
    )
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription with ID {subscription_id} not found"
        )
    return subscription


@router.put(
    "/{subscription_id}",
    response_model=schemas.SubscriptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a subscription"
)
def update_subscription(
    subscription_id: int,
    subscription_in: schemas.SubscriptionUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing subscription's fields.
    Returns HTTP 404 if the subscription does not exist.
    """
    subscription = (
        db.query(models.Subscription)
        .filter(models.Subscription.id == subscription_id)
        .first()
    )
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription with ID {subscription_id} not found"
        )

    subscription.name = subscription_in.name
    subscription.category = subscription_in.category
    subscription.amount = subscription_in.amount
    subscription.billing_cycle = subscription_in.billing_cycle
    subscription.next_renewal = subscription_in.next_renewal

    db.commit()
    db.refresh(subscription)
    return subscription


@router.delete(
    "/{subscription_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a subscription"
)
def delete_subscription(
    subscription_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a subscription by its ID.
    Returns HTTP 204 No Content on success, or HTTP 404 if not found.
    """
    subscription = (
        db.query(models.Subscription)
        .filter(models.Subscription.id == subscription_id)
        .first()
    )
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription with ID {subscription_id} not found"
        )

    db.delete(subscription)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
