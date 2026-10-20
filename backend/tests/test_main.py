def test_root_endpoint(client):
    """
    Test that GET / returns HTTP 200 and confirmation message.
    """
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "running" in data["message"].lower()
    assert data["docs_url"] == "/docs"


def test_health_endpoint(client):
    """
    Test that GET /health returns HTTP 200 and healthy status.
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
