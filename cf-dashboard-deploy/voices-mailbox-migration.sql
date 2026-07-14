-- tryHimandsee Ministries — Voices from the Street + Miracle Mailbox
-- Run this once in the Cloudflare D1 console for the tryhimandsee-db database.

CREATE TABLE IF NOT EXISTS voices (
  id           TEXT PRIMARY KEY,
  first_name   TEXT NOT NULL,
  audio_key    TEXT NOT NULL,        -- R2 object key
  audio_url    TEXT,                 -- Public playback URL
  mime_type    TEXT,
  duration_sec INTEGER,
  transcript   TEXT,                 -- Whisper transcript
  category     TEXT,                 -- 'praise' | 'prayer' | 'thanks' | 'testimony'
  ref_source   TEXT,                 -- QR code campaign ref (e.g. "miracle-run-2026-02-14")
  status       TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  created_at   TEXT NOT NULL,
  approved_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_voices_status_created
  ON voices (status, created_at DESC);

CREATE TABLE IF NOT EXISTS mailbox_codes (
  code            TEXT PRIMARY KEY,       -- Short unique code (e.g. "MM-A7K3")
  welcome_text    TEXT,                   -- Optional per-code welcome
  scripture_ref   TEXT,                   -- Optional per-code scripture (e.g. "Isaiah 41:10")
  featured_voice_id TEXT,                 -- Optional linked voice testimony
  distributed_at  TEXT,                   -- When the card went out
  distributed_by  TEXT,                   -- Volunteer name / event label
  notes           TEXT,
  visit_count     INTEGER NOT NULL DEFAULT 0,
  first_opened_at TEXT,
  last_visited_at TEXT,
  created_at      TEXT NOT NULL,
  FOREIGN KEY (featured_voice_id) REFERENCES voices(id)
);

CREATE INDEX IF NOT EXISTS idx_mailbox_created ON mailbox_codes (created_at DESC);
