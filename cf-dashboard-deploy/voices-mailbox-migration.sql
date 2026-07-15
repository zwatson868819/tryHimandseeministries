-- tryHimandsee ministries - Voices from the Street + Miracle Mailbox
-- Run this once in the Cloudflare D1 console for the tryhimandsee-db database.

CREATE TABLE IF NOT EXISTS voices (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  audio_key TEXT NOT NULL,
  audio_url TEXT,
  mime_type TEXT,
  duration_sec INTEGER,
  transcript TEXT,
  category TEXT,
  ref_source TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  approved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_voices_status_created ON voices (status, created_at DESC);

CREATE TABLE IF NOT EXISTS mailbox_codes (
  code TEXT PRIMARY KEY,
  welcome_text TEXT,
  scripture_ref TEXT,
  featured_voice_id TEXT,
  distributed_at TEXT,
  distributed_by TEXT,
  notes TEXT,
  visit_count INTEGER NOT NULL DEFAULT 0,
  first_opened_at TEXT,
  last_visited_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mailbox_created ON mailbox_codes (created_at DESC);
