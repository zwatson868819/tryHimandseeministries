-- SUBSCRIBERS MIGRATION — Run this ONCE in your Cloudflare D1 Console
-- Adds the subscribers table for Notes from the Secret Place email signups.

CREATE TABLE IF NOT EXISTS subscribers (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  name       TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
