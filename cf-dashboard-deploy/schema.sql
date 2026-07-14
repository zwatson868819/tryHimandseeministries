-- tryHimandsee Ministries - Cloudflare D1 schema
-- Run with: wrangler d1 execute tryhimandsee-db --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS admins (
  id            TEXT PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contacts (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT,
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS volunteers (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  interests    TEXT,
  availability TEXT,
  message      TEXT,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prayer_requests (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT,
  request    TEXT NOT NULL,
  is_public  INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS donations (
  id             TEXT PRIMARY KEY,
  amount         REAL NOT NULL,
  donation_type  TEXT NOT NULL,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  message        TEXT,
  status         TEXT NOT NULL,
  transaction_id TEXT,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id             TEXT PRIMARY KEY,
  session_id     TEXT NOT NULL UNIQUE,
  amount         REAL NOT NULL,
  currency       TEXT NOT NULL DEFAULT 'usd',
  donation_type  TEXT NOT NULL,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  message        TEXT,
  payment_status TEXT NOT NULL,
  status         TEXT NOT NULL,
  metadata       TEXT,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS news (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  excerpt     TEXT,
  image_urls  TEXT NOT NULL DEFAULT '[]',
  video_urls  TEXT NOT NULL DEFAULT '[]',
  published   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lessons (
  id                   TEXT PRIMARY KEY,
  title                TEXT NOT NULL,
  content              TEXT NOT NULL,
  scripture_reference  TEXT,
  image_urls           TEXT NOT NULL DEFAULT '[]',
  video_urls           TEXT NOT NULL DEFAULT '[]',
  published            INTEGER NOT NULL DEFAULT 1,
  created_at           TEXT NOT NULL,
  updated_at           TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS comments (
  id         TEXT PRIMARY KEY,
  lesson_id  TEXT NOT NULL,
  author     TEXT NOT NULL,
  text       TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

CREATE INDEX IF NOT EXISTS idx_comments_lesson ON comments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published, created_at);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(published, created_at);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_payment_session ON payment_transactions(session_id);

CREATE TABLE IF NOT EXISTS blog_posts (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  excerpt     TEXT,
  author      TEXT,
  image_urls  TEXT NOT NULL DEFAULT '[]',
  video_urls  TEXT NOT NULL DEFAULT '[]',
  published   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published, created_at);

CREATE TABLE IF NOT EXISTS subscribers (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  name       TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

CREATE TABLE IF NOT EXISTS testimonies (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT,
  location   TEXT,
  testimony  TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  approved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_testimonies_status ON testimonies(status, created_at);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

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
