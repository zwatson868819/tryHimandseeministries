-- Candle Wall feature.
-- Run in Cloudflare Dashboard → D1 → tryhimandsee-db → Console.
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS candles (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL DEFAULT 'Anonymous',
  intention   TEXT,
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_candles_created ON candles(created_at DESC);
