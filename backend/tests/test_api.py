import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, Base

# Force table creation for the test database context
Base.metadata.create_all(bind=engine)

# Use TestClient as a context manager to trigger FastAPI startup/lifespan events
client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Welcome" in response.json()["message"]

def test_public_journals():
    response = client.get("/api/journals")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_public_events():
    response = client.get("/api/events")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_public_gallery():
    response = client.get("/api/gallery")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_public_resources():
    response = client.get("/api/resources")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
