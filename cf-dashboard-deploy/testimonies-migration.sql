-- TESTIMONIES MIGRATION — Run this ONCE in your Cloudflare D1 Console
-- Adds the testimonies table for visitor-submitted stories.

CREATE TABLE IF NOT EXISTS testimonies (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT,
  location    TEXT,
  testimony   TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TEXT NOT NULL,
  approved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_testimonies_status ON testimonies(status, created_at);
