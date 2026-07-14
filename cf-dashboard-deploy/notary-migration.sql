-- Notary Requests table
-- Run this once in the Cloudflare D1 console for the `tryhimandsee-db` database.

CREATE TABLE IF NOT EXISTS notary_requests (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL,
  email        TEXT,
  document_type TEXT,
  preferred_time TEXT,
  message      TEXT,
  status       TEXT NOT NULL DEFAULT 'new',
  created_at   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notary_requests_created_at
  ON notary_requests (created_at DESC);
