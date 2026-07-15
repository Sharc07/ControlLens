import os
os.environ["DATABASE_URL"] = "sqlite:///./test_controllens.db"
from fastapi.testclient import TestClient
from app.main import app

def test_health():
    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
