"""
Backend tests for the Resource Directory feature.
Endpoints:
  Public: GET /api/resources[?category=...]
  Admin:  GET/POST /api/admin/resources
          PUT/DELETE /api/admin/resources/{id}
Preview backend uses in-memory dict seeded from resources_seed.py (48 items).
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://himandsee-faith.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

EXPECTED_COUNTS = {
    "housing": 10,
    "food": 12,
    "clothing": 9,
    "social-services": 9,
    "mental-health": 8,
    "domestic-violence": 10,
}
EXPECTED_TOTAL = sum(EXPECTED_COUNTS.values())  # 58


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# -------------------- PUBLIC ENDPOINTS --------------------

class TestPublicResources:
    def test_get_all_resources_returns_seed(self, session):
        r = session.get(f"{API}/resources", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == EXPECTED_TOTAL, f"expected {EXPECTED_TOTAL}, got {len(data)}"
        # Basic shape validation on first item
        first = data[0]
        for key in ("id", "category", "name"):
            assert key in first, f"missing key {key} in resource"

    @pytest.mark.parametrize("cat,expected", list(EXPECTED_COUNTS.items()))
    def test_filter_by_category(self, session, cat, expected):
        r = session.get(f"{API}/resources", params={"category": cat}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == expected, f"{cat}: expected {expected}, got {len(data)}"
        assert all(item["category"] == cat for item in data)

    def test_unknown_category_returns_empty(self, session):
        r = session.get(f"{API}/resources", params={"category": "bogus"}, timeout=15)
        assert r.status_code == 200
        assert r.json() == []


# -------------------- ADMIN ENDPOINTS --------------------

class TestAdminResourcesCRUD:
    """
    Note: admin endpoints on preview don't require auth (in-memory stub);
    production Cloudflare Worker enforces JWT.
    """

    def test_admin_list_returns_all_including_inactive(self, session):
        r = session.get(f"{API}/admin/resources", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # Should include seed items
        assert len(data) >= EXPECTED_TOTAL

    def test_create_missing_name_returns_400(self, session):
        r = session.post(f"{API}/admin/resources", json={"category": "food"}, timeout=15)
        assert r.status_code == 400
        body = r.json()
        detail = body.get("detail") or body.get("message") or ""
        assert "Category and name are required" in detail

    def test_create_missing_category_returns_400(self, session):
        r = session.post(f"{API}/admin/resources", json={"name": "TEST_only_name"}, timeout=15)
        assert r.status_code == 400

    def test_full_crud_cycle(self, session):
        # CREATE
        payload = {
            "category": "food",
            "name": "TEST_Playwright_Org",
            "description": "created by pytest",
            "phone": "(804) 000-1234",
        }
        r = session.post(f"{API}/admin/resources", json=payload, timeout=15)
        assert r.status_code in (200, 201), r.text
        created = r.json()
        assert "id" in created and created["id"]
        assert created["name"] == payload["name"]
        assert created["category"] == "food"
        rid = created["id"]

        # VERIFY appears in admin list AND public food list
        list_r = session.get(f"{API}/admin/resources", timeout=15)
        assert any(x["id"] == rid for x in list_r.json())
        pub_r = session.get(f"{API}/resources", params={"category": "food"}, timeout=15)
        assert any(x["id"] == rid for x in pub_r.json())

        # UPDATE
        upd_payload = {"name": "TEST_Playwright_Org_Renamed", "description": "updated"}
        r2 = session.put(f"{API}/admin/resources/{rid}", json=upd_payload, timeout=15)
        assert r2.status_code == 200, r2.text
        updated = r2.json()
        assert updated["name"] == "TEST_Playwright_Org_Renamed"
        assert updated["description"] == "updated"

        # TOGGLE INACTIVE - should disappear from public list
        r3 = session.put(f"{API}/admin/resources/{rid}", json={"is_active": False}, timeout=15)
        assert r3.status_code == 200
        pub_r2 = session.get(f"{API}/resources", params={"category": "food"}, timeout=15)
        assert not any(x["id"] == rid for x in pub_r2.json()), "inactive item should be hidden from public"
        # But still in admin list
        adm_r = session.get(f"{API}/admin/resources", timeout=15)
        assert any(x["id"] == rid for x in adm_r.json())

        # DELETE
        r4 = session.delete(f"{API}/admin/resources/{rid}", timeout=15)
        assert r4.status_code in (200, 204)
        adm_r2 = session.get(f"{API}/admin/resources", timeout=15)
        assert not any(x["id"] == rid for x in adm_r2.json()), "resource should be deleted"
