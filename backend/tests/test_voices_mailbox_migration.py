"""Tests for the voices-mailbox migration SQL download endpoint.

Validates:
1. The endpoint returns clean SQL free of inline column comments that broke D1.
2. The SQL is D1-compatible (SQLite executescript parses cleanly).
3. Regression: other migration download endpoints still work.
"""
import os
import re
import sqlite3

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
VOICES_URL = f"{BASE_URL}/api/download/voices-mailbox-migration-sql"


@pytest.fixture(scope="module")
def voices_sql():
    resp = requests.get(VOICES_URL, timeout=30)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    return resp


# --- Voices/Mailbox migration content tests ------------------------------------


class TestVoicesMailboxMigration:
    def test_status_and_content_type(self, voices_sql):
        assert voices_sql.status_code == 200
        ct = voices_sql.headers.get("content-type", "").lower()
        assert "text/plain" in ct, f"Unexpected content-type: {ct}"

    def test_header_uses_regular_hyphen(self, voices_sql):
        body = voices_sql.text
        # Body must begin with the expected header
        assert body.startswith(
            "-- tryHimandsee Ministries - Voices from the Street + Miracle Mailbox"
        ), f"Header mismatch. First line: {body.splitlines()[0]!r}"
        # No em-dash anywhere
        assert "\u2014" not in body, "Found em-dash (U+2014) in SQL body"

    def test_no_inline_column_comments(self, voices_sql):
        body = voices_sql.text
        # Find the CREATE TABLE regions and check inside them for inline --
        # Any line ending with 'something, -- comment' or 'TEXT NOT NULL, -- ...' is illegal.
        lines = body.splitlines()
        inside_table = False
        offenders = []
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if stripped.upper().startswith("CREATE TABLE"):
                inside_table = True
                continue
            if inside_table:
                if stripped.startswith(");") or stripped == ");" or stripped.endswith(");"):
                    inside_table = False
                    continue
                # Column line: if it contains ' -- ' or ends with '-- ...' it's an inline comment
                # Allow full-line comments starting with -- (none expected inside table anyway)
                if "--" in stripped and not stripped.startswith("--"):
                    offenders.append((i, line))
        assert not offenders, f"Found inline column comments: {offenders}"

    def test_expected_statement_counts(self, voices_sql):
        body = voices_sql.text
        create_tables = re.findall(
            r"CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(\w+)", body, re.IGNORECASE
        )
        create_indices = re.findall(
            r"CREATE\s+INDEX(?:\s+IF\s+NOT\s+EXISTS)?\s+(\w+)", body, re.IGNORECASE
        )
        assert set(create_tables) == {"voices", "mailbox_codes"}, (
            f"Unexpected tables: {create_tables}"
        )
        assert set(create_indices) == {
            "idx_voices_status_created",
            "idx_mailbox_created",
        }, f"Unexpected indices: {create_indices}"
        # Each statement must end with a semicolon somewhere
        # Count semicolons should be at least 4 (2 tables + 2 indices)
        assert body.count(";") >= 4, f"Too few ';' terminators: {body.count(';')}"

    def test_no_foreign_key_clause(self, voices_sql):
        body_upper = voices_sql.text.upper()
        assert "FOREIGN KEY" not in body_upper, "FOREIGN KEY clause should be removed for D1"

    def test_sqlite_executescript_parses_cleanly(self, voices_sql):
        """Mirrors D1 execution path since D1 uses SQLite semantics."""
        sql = voices_sql.text
        conn = sqlite3.connect(":memory:")
        try:
            conn.executescript(sql)
            # Verify tables exist
            cur = conn.cursor()
            cur.execute(
                "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
            )
            tables = [row[0] for row in cur.fetchall()]
            assert "voices" in tables, f"voices table missing. Got: {tables}"
            assert "mailbox_codes" in tables, f"mailbox_codes table missing. Got: {tables}"

            # Verify indices exist
            cur.execute(
                "SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name"
            )
            indices = [row[0] for row in cur.fetchall()]
            assert "idx_voices_status_created" in indices, f"voices index missing. Got: {indices}"
            assert "idx_mailbox_created" in indices, f"mailbox index missing. Got: {indices}"

            # Sample INSERT into voices
            cur.execute(
                """INSERT INTO voices
                   (id, first_name, audio_key, audio_url, mime_type, duration_sec,
                    transcript, category, ref_source, status, created_at, approved_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    "v1", "TEST_John", "voices/v1.webm", "https://example.com/v1.webm",
                    "audio/webm", 30, "Praise the Lord", "testimony", "street",
                    "pending", "2026-01-01T00:00:00Z", None,
                ),
            )
            # Sample INSERT into mailbox_codes
            cur.execute(
                """INSERT INTO mailbox_codes
                   (code, welcome_text, scripture_ref, featured_voice_id,
                    distributed_at, distributed_by, notes, visit_count,
                    first_opened_at, last_visited_at, created_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    "TEST_ABC123", "Welcome!", "John 3:16", "v1",
                    "2026-01-01T00:00:00Z", "admin", "handed out",
                    0, None, None, "2026-01-01T00:00:00Z",
                ),
            )
            conn.commit()

            # Verify persisted
            cur.execute("SELECT id, first_name FROM voices WHERE id='v1'")
            row = cur.fetchone()
            assert row == ("v1", "TEST_John")
            cur.execute("SELECT code, welcome_text FROM mailbox_codes WHERE code='TEST_ABC123'")
            row = cur.fetchone()
            assert row == ("TEST_ABC123", "Welcome!")
        finally:
            conn.close()


# --- Regression: other download endpoints still return 200 --------------------


REGRESSION_ENDPOINTS = [
    "/api/download/resources-migration-sql",
    "/api/download/notary-migration-sql",
    "/api/download/candles-migration-sql",
    "/api/download/resources-dv-delta-sql",
]


@pytest.mark.parametrize("path", REGRESSION_ENDPOINTS)
def test_regression_other_migration_downloads(path):
    resp = requests.get(f"{BASE_URL}{path}", timeout=30)
    assert resp.status_code == 200, f"{path} -> {resp.status_code}"
    assert len(resp.text) > 0, f"{path} returned empty body"
