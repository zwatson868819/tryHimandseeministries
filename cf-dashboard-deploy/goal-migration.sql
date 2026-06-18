-- GOAL THERMOMETER MIGRATION — Run this ONCE in your Cloudflare D1 Console
-- Adds a simple settings table for storing the monthly donation goal.

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
