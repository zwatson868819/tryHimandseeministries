-- BLOG MIGRATION - Run this ONCE in your Cloudflare D1 Console
-- (only adds the new blog_posts table; existing data is untouched)

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
