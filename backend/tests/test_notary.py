"""Tests for the Free Notary Services stub endpoints in preview FastAPI backend.

- POST /api/notary-requests   (stub echoes payload; validates name+phone required)
- GET  /api/admin/notary-requests  (stub returns [])
"""
import os
import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL", "https://himandsee-faith.preview.emergentagent.com"
).rstrip("/")


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- POST /api/notary-requests ---
class TestNotarySubmit:
    def test_valid_submission_returns_echo_with_id_and_status(self, client):
        payload = {
            "name": "TEST_John Doe",
            "phone": "8045550123",
            "email": "test_john@example.com",
            "document_type": "Affidavit",
            "preferred_time": "Sat morning",
            "message": "1 page, please confirm.",
        }
        r = client.post(f"{BASE_URL}/api/notary-requests", json=payload, timeout=15)
        assert r.status_code in (200, 201), r.text
        data = r.json()
        # id + status returned by the stub
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert data.get("status") == "new"
        # echo of payload fields
        assert data["name"] == payload["name"]
        assert data["phone"] == payload["phone"]
        assert data["email"] == payload["email"]
        assert data["document_type"] == payload["document_type"]
        assert data["preferred_time"] == payload["preferred_time"]
        assert data["message"] == payload["message"]
        assert "created_at" in data and isinstance(data["created_at"], str)

    def test_minimum_required_fields(self, client):
        payload = {"name": "TEST_Jane", "phone": "8045551111"}
        r = client.post(f"{BASE_URL}/api/notary-requests", json=payload, timeout=15)
        assert r.status_code in (200, 201), r.text
        data = r.json()
        assert data["name"] == "TEST_Jane"
        assert data["phone"] == "8045551111"
        assert data.get("status") == "new"

    def test_missing_phone_returns_400(self, client):
        payload = {"name": "TEST_NoPhone", "email": "np@example.com"}
        r = client.post(f"{BASE_URL}/api/notary-requests", json=payload, timeout=15)
        assert r.status_code == 400, r.text
        data = r.json()
        assert data.get("detail") == "Name and phone are required"

    def test_missing_name_returns_400(self, client):
        payload = {"phone": "8045550000"}
        r = client.post(f"{BASE_URL}/api/notary-requests", json=payload, timeout=15)
        assert r.status_code == 400, r.text
        data = r.json()
        assert data.get("detail") == "Name and phone are required"

    def test_empty_body_returns_400(self, client):
        r = client.post(f"{BASE_URL}/api/notary-requests", json={}, timeout=15)
        assert r.status_code == 400, r.text
        assert r.json().get("detail") == "Name and phone are required"


# --- GET /api/admin/notary-requests ---
class TestNotaryAdminList:
    def test_returns_200_with_empty_array(self, client):
        r = client.get(f"{BASE_URL}/api/admin/notary-requests", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        # Preview stub returns []
        assert data == []
