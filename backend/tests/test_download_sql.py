"""Tests for the SQL migration download endpoints added to fix D1 paste truncation."""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].splitlines()[0].strip()
BASE_URL = BASE_URL.rstrip("/")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    return s


class TestResourcesMigrationDownload:
    """GET /api/download/resources-migration-sql"""

    def test_status_and_content_type(self, api):
        r = api.get(f"{BASE_URL}/api/download/resources-migration-sql", timeout=30)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        ctype = r.headers.get("content-type", "")
        assert "text/plain" in ctype, f"Expected text/plain, got '{ctype}'"

    def test_body_starts_with_header(self, api):
        r = api.get(f"{BASE_URL}/api/download/resources-migration-sql", timeout=30)
        body = r.text
        first_line = body.splitlines()[0] if body else ""
        assert first_line.startswith("-- tryHimandsee Ministries"), (
            f"Header mismatch. First line: {first_line!r}"
        )
        assert "Resource Directory" in first_line

    def test_insert_count_and_not_truncated(self, api):
        r = api.get(f"{BASE_URL}/api/download/resources-migration-sql", timeout=30)
        body = r.text

        # Count INSERT statements (48 seed rows expected)
        insert_count = len(re.findall(r"^INSERT\b", body, flags=re.MULTILINE))
        assert insert_count == 48, f"Expected 48 INSERT rows, found {insert_count}"

        # CREATE TABLE + CREATE INDEX presence
        assert re.search(r"CREATE TABLE\s+IF NOT EXISTS\s+resources", body, re.IGNORECASE), \
            "Missing CREATE TABLE resources"
        assert re.search(r"CREATE INDEX", body, re.IGNORECASE), "Missing CREATE INDEX"

        # Not truncated - last seed row must be present
        assert "NAMI Central Virginia" in body, "File appears truncated — 'NAMI Central Virginia' missing"

        # Total line count sanity
        lines = body.splitlines()
        assert len(lines) >= 70, f"Expected ~71 lines, got {len(lines)}"

    def test_last_insert_terminated(self, api):
        """The last INSERT must end with ');' — proves no mid-statement truncation."""
        r = api.get(f"{BASE_URL}/api/download/resources-migration-sql", timeout=30)
        body = r.text.rstrip()
        assert body.endswith(");"), f"Body does not end with ');' — possibly truncated. Tail: {body[-120:]!r}"


class TestNotaryMigrationDownload:
    """GET /api/download/notary-migration-sql"""

    def test_status_and_content(self, api):
        r = api.get(f"{BASE_URL}/api/download/notary-migration-sql", timeout=30)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        ctype = r.headers.get("content-type", "")
        assert "text/plain" in ctype, f"Expected text/plain, got '{ctype}'"
        body = r.text
        assert "CREATE TABLE IF NOT EXISTS notary_requests" in body, \
            "Missing 'CREATE TABLE IF NOT EXISTS notary_requests' in notary migration"


class TestCandlesMigrationRegression:
    """Regression: pre-existing GET /api/download/candles-migration-sql still works."""

    def test_status_ok(self, api):
        r = api.get(f"{BASE_URL}/api/download/candles-migration-sql", timeout=30)
        assert r.status_code == 200, f"Regression: expected 200, got {r.status_code}"
        assert len(r.text) > 0, "Regression: empty body"
