"""Tests for Cloudflare Worker compatibility stub endpoints added to FastAPI.

These endpoints exist only to prevent 404s in the dev preview environment;
real ministry data lives in Cloudflare D1 in production.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://himandsee-faith.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- /api/testimonies ---
class TestTestimoniesStub:
    def test_returns_200_with_empty_array(self, client):
        r = client.get(f"{BASE_URL}/api/testimonies", params={"limit": 20}, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert data == []

    def test_works_without_limit_param(self, client):
        r = client.get(f"{BASE_URL}/api/testimonies", timeout=15)
        assert r.status_code == 200
        assert r.json() == []


# --- /api/donations/progress ---
class TestDonationsProgressStub:
    def test_returns_200_with_expected_shape(self, client):
        r = client.get(f"{BASE_URL}/api/donations/progress", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        # Shape: {goal:number, raised:number, percent:number, month:string}
        assert set(["goal", "raised", "percent", "month"]).issubset(data.keys())
        assert isinstance(data["goal"], (int, float))
        assert isinstance(data["raised"], (int, float))
        assert isinstance(data["percent"], (int, float))
        assert isinstance(data["month"], str) and len(data["month"]) > 0
        # Stub defaults
        assert data["goal"] == 500
        assert data["raised"] == 0
        assert data["percent"] == 0


# --- /api/stats/impact ---
class TestImpactStatsStub:
    def test_returns_200_with_expected_shape(self, client):
        r = client.get(f"{BASE_URL}/api/stats/impact", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        expected_keys = {"lives_touched", "kits_given", "miracle_runs", "total_donations"}
        assert expected_keys.issubset(data.keys())
        for k in expected_keys:
            assert isinstance(data[k], (int, float))
            assert data[k] == 0  # stub default
