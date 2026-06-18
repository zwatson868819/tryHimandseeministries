-- Site enhancements migration (Prayer Wall counters + Impact stats).
-- Run in: Cloudflare Dashboard → D1 → tryhimandsee-db → Console.
-- Safe to re-run.

-- 1. Add pray_count to prayer_requests so the "I prayed for this" button
--    on the public Prayer Wall can persist a counter.
ALTER TABLE prayer_requests ADD COLUMN pray_count INTEGER DEFAULT 0;

-- 2. Seed initial impact counters used by the homepage "Miracle Counter" ticker.
--    The admin can edit these from the Admin Dashboard.
INSERT OR IGNORE INTO settings (key, value) VALUES ('impact_lives_touched', '0');
INSERT OR IGNORE INTO settings (key, value) VALUES ('impact_kits_given', '0');
INSERT OR IGNORE INTO settings (key, value) VALUES ('impact_miracle_runs', '0');
