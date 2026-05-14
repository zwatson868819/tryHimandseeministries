-- tryHimandsee Ministries — Cloudflare D1 schema
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
