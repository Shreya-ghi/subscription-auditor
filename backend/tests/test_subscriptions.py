import pytest


def test_list_subscriptions_empty(client):
    """
    Test that GET /subscriptions/ returns an empty list when no records exist.
    """
    response = client.get("/subscriptions/")
    assert response.status_code == 200
    assert response.json() == []


def test_create_valid_subscription(client):
    """
    Test that POST /subscriptions/ creates a new subscription and returns 201 Created.
    """
    payload = {
        "name": "Netflix Premium",
        "category": "Streaming & Media",
        "amount": 22.99,
        "billing_cycle": "Monthly",
        "next_renewal": "2026-11-15",
    }
    response = client.post("/subscriptions/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Netflix Premium"
    assert data["category"] == "Streaming & Media"
    assert data["amount"] == 22.99
    assert data["billing_cycle"] == "Monthly"
    assert data["next_renewal"] == "2026-11-15"
    assert "id" in data
    assert isinstance(data["id"], int)


def test_list_subscriptions_with_records(client):
    """
    Test that GET /subscriptions/ returns all saved records.
    """
    # Create two subscriptions
    sub1 = {
        "name": "Spotify",
        "category": "Music & Audio",
        "amount": 10.99,
        "billing_cycle": "Monthly",
        "next_renewal": "2026-11-20",
    }
    sub2 = {
        "name": "GitHub Copilot",
        "category": "Developer Tools",
        "amount": 100.00,
        "billing_cycle": "Yearly",
        "next_renewal": "2027-01-01",
    }
    client.post("/subscriptions/", json=sub1)
    client.post("/subscriptions/", json=sub2)

    response = client.get("/subscriptions/")
    assert response.status_code == 200
    records = response.json()
    assert len(records) == 2
    names = [r["name"] for r in records]
    assert "Spotify" in names
    assert "GitHub Copilot" in names


def test_get_existing_subscription(client):
    """
    Test that GET /subscriptions/{id} returns the specific subscription record.
    """
    create_res = client.post(
        "/subscriptions/",
        json={
            "name": "Figma Pro",
            "category": "Productivity",
            "amount": 15.00,
            "billing_cycle": "Monthly",
            "next_renewal": "2026-12-05",
        },
    )
    assert create_res.status_code == 201
    created_id = create_res.json()["id"]

    response = client.get(f"/subscriptions/{created_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == created_id
    assert data["name"] == "Figma Pro"
    assert data["amount"] == 15.00


def test_update_subscription(client):
    """
    Test that PUT /subscriptions/{id} updates the saved subscription values.
    """
    create_res = client.post(
        "/subscriptions/",
        json={
            "name": "ChatGPT Plus",
            "category": "AI Tools",
            "amount": 20.00,
            "billing_cycle": "Monthly",
            "next_renewal": "2026-11-01",
        },
    )
    created_id = create_res.json()["id"]

    # Update amount and renewal date
    update_payload = {
        "name": "ChatGPT Team",
        "category": "AI Tools",
        "amount": 30.00,
        "billing_cycle": "Monthly",
        "next_renewal": "2026-12-01",
    }
    update_res = client.put(f"/subscriptions/{created_id}", json=update_payload)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["name"] == "ChatGPT Team"
    assert updated_data["amount"] == 30.00
    assert updated_data["next_renewal"] == "2026-12-01"

    # Verify via GET that changes persisted in database
    get_res = client.get(f"/subscriptions/{created_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "ChatGPT Team"
    assert get_res.json()["amount"] == 30.00


def test_delete_subscription(client):
    """
    Test that DELETE /subscriptions/{id} removes the subscription and returns 204.
    """
    create_res = client.post(
        "/subscriptions/",
        json={
            "name": "Hulu",
            "category": "Streaming & Media",
            "amount": 7.99,
            "billing_cycle": "Monthly",
            "next_renewal": "2026-11-10",
        },
    )
    created_id = create_res.json()["id"]

    # Delete
    del_res = client.delete(f"/subscriptions/{created_id}")
    assert del_res.status_code == 204

    # Verify subsequent GET returns 404
    get_res = client.get(f"/subscriptions/{created_id}")
    assert get_res.status_code == 404


def test_get_nonexistent_subscription_returns_404(client):
    """
    Test that requesting a non-existent subscription ID returns 404 Not Found.
    """
    response = client.get("/subscriptions/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_update_nonexistent_subscription_returns_404(client):
    """
    Test that updating a non-existent subscription ID returns 404 Not Found.
    """
    payload = {
        "name": "Nonexistent",
        "category": "Other",
        "amount": 10.00,
        "billing_cycle": "Monthly",
        "next_renewal": "2026-11-01",
    }
    response = client.put("/subscriptions/99999", json=payload)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_delete_nonexistent_subscription_returns_404(client):
    """
    Test that deleting a non-existent subscription ID returns 404 Not Found.
    """
    response = client.delete("/subscriptions/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_reject_empty_name(client):
    """
    Test that empty or whitespace-only name is rejected with 422 Unprocessable Entity.
    """
    payload = {
        "name": "   ",
        "category": "Productivity",
        "amount": 10.00,
        "billing_cycle": "Monthly",
        "next_renewal": "2026-11-01",
    }
    response = client.post("/subscriptions/", json=payload)
    assert response.status_code == 422


def test_reject_empty_category(client):
    """
    Test that empty or whitespace-only category is rejected with 422 Unprocessable Entity.
    """
    payload = {
        "name": "Notion",
        "category": "",
        "amount": 10.00,
        "billing_cycle": "Monthly",
        "next_renewal": "2026-11-01",
    }
    response = client.post("/subscriptions/", json=payload)
    assert response.status_code == 422


def test_reject_invalid_billing_cycle(client):
    """
    Test that billing cycle not in (Monthly, Quarterly, Yearly) is rejected with 422.
    """
    payload = {
        "name": "Weekly Meal Kit",
        "category": "Other",
        "amount": 50.00,
        "billing_cycle": "Weekly",
        "next_renewal": "2026-11-01",
    }
    response = client.post("/subscriptions/", json=payload)
    assert response.status_code == 422


def test_reject_invalid_date(client):
    """
    Test that an invalid date format is rejected with 422 Unprocessable Entity.
    """
    payload = {
        "name": "Adobe Creative Cloud",
        "category": "Design",
        "amount": 54.99,
        "billing_cycle": "Monthly",
        "next_renewal": "not-a-valid-date",
    }
    response = client.post("/subscriptions/", json=payload)
    assert response.status_code == 422


def test_reject_zero_amount(client):
    """
    Test that an amount of zero is rejected with 422 Unprocessable Entity.
    """
    payload = {
        "name": "Free Tier Service",
        "category": "Cloud",
        "amount": 0.0,
        "billing_cycle": "Monthly",
        "next_renewal": "2026-11-01",
    }
    response = client.post("/subscriptions/", json=payload)
    assert response.status_code == 422


def test_reject_negative_amount(client):
    """
    Test that a negative amount is rejected with 422 Unprocessable Entity.
    """
    payload = {
        "name": "Invalid Service",
        "category": "Cloud",
        "amount": -15.50,
        "billing_cycle": "Monthly",
        "next_renewal": "2026-11-01",
    }
    response = client.post("/subscriptions/", json=payload)
    assert response.status_code == 422


def test_billing_cycle_case_insensitivity(client):
    """
    Test that lowercase 'monthly' is accepted and normalized to 'Monthly'.
    """
    payload = {
        "name": "AWS Hosting",
        "category": "Cloud & Hosting",
        "amount": 45.00,
        "billing_cycle": "monthly",
        "next_renewal": "2026-11-30",
    }
    response = client.post("/subscriptions/", json=payload)
    assert response.status_code == 201
    assert response.json()["billing_cycle"] == "Monthly"
