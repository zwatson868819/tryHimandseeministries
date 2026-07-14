"""
Backend tests for Voices from the Street + Miracle Mailbox preview endpoints.

These endpoints are in-memory preview stubs (no Whisper/R2/D1 in preview).
Production Cloudflare Worker handles Whisper transcription and R2 storage.
"""
import os
import re
import io
import pytest
import requests

# Read from frontend/.env explicitly to avoid depending on shell env
def _load_backend_url():
    if os.environ.get("REACT_APP_BACKEND_URL"):
        return os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    return line.split("=", 1)[1].strip().rstrip("/")
    raise RuntimeError("REACT_APP_BACKEND_URL not configured")

BASE_URL = _load_backend_url()

MM_CODE_RE = re.compile(r"^MM-[A-Z2-9]{5}$")
CONFUSING_CHARS = set("01OI")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    return s


# ------------- Mailbox: generate + fetch + 404 -------------
class TestMailboxGenerate:
    codes_created: list = []

    def test_generate_3_codes_ok(self, api):
        r = api.post(
            f"{BASE_URL}/api/admin/mailbox/generate",
            json={"count": 3, "distributed_by": "ci"},
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert "created" in body
        assert isinstance(body["created"], list)
        assert len(body["created"]) == 3
        codes = [c["code"] for c in body["created"]]
        for code in codes:
            assert MM_CODE_RE.match(code), f"Code {code} does not match MM-[A-Z2-9]{{5}}"
            # No confusing chars 0/O/1/I
            body_chars = set(code.replace("MM-", ""))
            assert not (body_chars & CONFUSING_CHARS), f"Code {code} contains confusing chars"
        TestMailboxGenerate.codes_created = codes

    def test_get_mailbox_increments_visit_count(self, api):
        assert TestMailboxGenerate.codes_created, "Prereq failed: no codes"
        code = TestMailboxGenerate.codes_created[0]

        r1 = api.get(f"{BASE_URL}/api/mailbox/{code}")
        assert r1.status_code == 200
        d1 = r1.json()
        assert d1["code"] == code
        assert d1["visit_count"] == 1

        r2 = api.get(f"{BASE_URL}/api/mailbox/{code}")
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["visit_count"] == 2

        r3 = api.get(f"{BASE_URL}/api/mailbox/{code}")
        assert r3.json()["visit_count"] == 3

    def test_get_mailbox_nonexistent_404(self, api):
        r = api.get(f"{BASE_URL}/api/mailbox/MM-FAKE")
        assert r.status_code == 404
        body = r.json()
        assert body.get("detail") == "Mailbox code not found"

    def test_admin_mailbox_list_contains_created(self, api):
        r = api.get(f"{BASE_URL}/api/admin/mailbox")
        assert r.status_code == 200
        codes_in_list = {row["code"] for row in r.json()}
        for c in TestMailboxGenerate.codes_created:
            assert c in codes_in_list

    def test_delete_mailbox_code(self, api):
        assert TestMailboxGenerate.codes_created
        code = TestMailboxGenerate.codes_created[-1]
        r = api.delete(f"{BASE_URL}/api/admin/mailbox/{code}")
        assert r.status_code == 200
        r_get = api.get(f"{BASE_URL}/api/mailbox/{code}")
        assert r_get.status_code == 404


# ------------- Voices public list -------------
class TestVoicesPublic:
    def test_voices_public_returns_list(self, api):
        r = api.get(f"{BASE_URL}/api/voices")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        for v in data:
            assert v.get("status") == "approved"

    def test_admin_voices_returns_list(self, api):
        r = api.get(f"{BASE_URL}/api/admin/voices")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ------------- Voice submission + admin update + approval propagation -------------
class TestVoiceLifecycle:
    voice_id: str = ""

    def test_submit_voice(self, api):
        # Fake webm audio bytes
        audio_bytes = b"\x1a\x45\xdf\xa3" + b"\x00" * 128  # minimal webm-ish header + padding
        files = {"audio": ("test.webm", io.BytesIO(audio_bytes), "audio/webm")}
        data = {
            "first_name": "TEST_Alice",
            "category": "testimony",
            "ref_source": "ci-test-2026-01",
            "duration_sec": "10",
        }
        r = api.post(f"{BASE_URL}/api/voices", files=files, data=data)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "id" in body
        assert body["status"] == "pending"
        TestVoiceLifecycle.voice_id = body["id"]

    def test_submit_voice_missing_first_name(self, api):
        audio_bytes = b"\x1a\x45\xdf\xa3" + b"\x00" * 32
        files = {"audio": ("t.webm", io.BytesIO(audio_bytes), "audio/webm")}
        r = api.post(
            f"{BASE_URL}/api/voices",
            files=files,
            data={"first_name": "  ", "category": "praise"},
        )
        assert r.status_code == 400

    def test_admin_approve_voice(self, api):
        assert TestVoiceLifecycle.voice_id
        r = api.put(
            f"{BASE_URL}/api/admin/voices/{TestVoiceLifecycle.voice_id}",
            json={"status": "approved", "transcript": "This is a test transcript"},
        )
        assert r.status_code == 200

        # Verify shows up in public list
        r_pub = api.get(f"{BASE_URL}/api/voices")
        approved_ids = [v["id"] for v in r_pub.json()]
        assert TestVoiceLifecycle.voice_id in approved_ids

    def test_admin_update_nonexistent_voice_404(self, api):
        r = api.put(
            f"{BASE_URL}/api/admin/voices/does-not-exist",
            json={"status": "approved"},
        )
        assert r.status_code == 404

    def test_admin_delete_voice(self, api):
        assert TestVoiceLifecycle.voice_id
        r = api.delete(f"{BASE_URL}/api/admin/voices/{TestVoiceLifecycle.voice_id}")
        assert r.status_code == 200
        # Confirm removed from public
        r_pub = api.get(f"{BASE_URL}/api/voices")
        assert TestVoiceLifecycle.voice_id not in [v["id"] for v in r_pub.json()]


# ------------- Migration SQL download -------------
class TestMigrationSql:
    def test_voices_mailbox_migration_sql_download(self, api):
        r = api.get(f"{BASE_URL}/api/download/voices-mailbox-migration-sql")
        assert r.status_code == 200
        text = r.text
        assert "CREATE TABLE IF NOT EXISTS voices" in text
        assert "CREATE TABLE IF NOT EXISTS mailbox_codes" in text


# ------------- Regression: existing endpoints still work -------------
class TestRegression:
    def test_root_api(self, api):
        r = api.get(f"{BASE_URL}/api/")
        # Root may return 200 (existing hello world) or similar
        assert r.status_code in (200, 404)

    def test_admin_login_still_ok(self, api):
        r = api.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "zwatson", "password": "Anandotowel@1988*"},
        )
        # Login should succeed
        assert r.status_code in (200, 201), r.text
