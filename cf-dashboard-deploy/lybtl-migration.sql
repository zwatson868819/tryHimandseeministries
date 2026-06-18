-- "Loving You Back To Life" CRM migration for Cloudflare D1
-- Run in: Cloudflare Dashboard → D1 → tryhimandsee-db → Console
-- Safe to re-run (uses IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS loving_you_back_contacts (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  address      TEXT,
  birthday     TEXT,
  how_we_met   TEXT,
  family_notes TEXT,
  photo_url    TEXT,
  tags         TEXT NOT NULL DEFAULT '[]',
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lybtl_name ON loving_you_back_contacts(name);
CREATE INDEX IF NOT EXISTS idx_lybtl_birthday ON loving_you_back_contacts(birthday);

CREATE TABLE IF NOT EXISTS next_step_journal (
  id                 TEXT PRIMARY KEY,
  contact_id         TEXT NOT NULL,
  note               TEXT NOT NULL,
  follow_up_date     TEXT,
  follow_up_reason   TEXT,
  status             TEXT NOT NULL DEFAULT 'active',
  created_at         TEXT NOT NULL,
  FOREIGN KEY (contact_id) REFERENCES loving_you_back_contacts(id)
);

CREATE INDEX IF NOT EXISTS idx_journal_contact ON next_step_journal(contact_id, created_at);
CREATE INDEX IF NOT EXISTS idx_journal_followup ON next_step_journal(status, follow_up_date);
