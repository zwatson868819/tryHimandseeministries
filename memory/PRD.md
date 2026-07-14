# tryHimandsee Ministries — PRD

## Original Problem Statement
Nonprofit website for tryHimandsee Ministries — outreach to the poor and underserved of Richmond and Henrico (food, clothing, hygiene). Custom branding, Stripe donations, Admin Dashboard, no platform branding.

## Architecture — Fully on Cloudflare ($0/month)
- **Frontend**: React → Cloudflare Pages (`tryhimandsee.pages.dev` + custom domain `tryhimandseeministries.org`)
- **Backend**: Hono TypeScript Worker → Cloudflare Workers (`tryhimandsee-backend.tryhimandsee3-7.workers.dev`)
- **Database**: Cloudflare D1 (SQLite) — `tryhimandsee-db`
- **File storage**: Cloudflare R2 — `tryhimandsee-media`
- **Email**: Resend (free tier) — auto-emails subscribers on new blog posts

## Features Implemented
### Public site
- Home with hero (logo background), Mission, Services preview, Testimonies carousel, Donation Goal thermometer, Blog subscribe call-out
- Ministries page: **The PEW Pantry**, **Garments of Grace**, **Kingdom Care Hygiene Kits** (each with custom branding + locally-hosted images)
- Encounters series (lessons + public comments)
- **Notes from the Secret Place** blog + subscribe form + email auto-send on publish
- News, Get Involved, Contact, Prayer Requests, Donate (Stripe one-time + monthly recurring)
- Share Your Testimony form on Contact page (with admin moderation flow)

### Admin
- JWT + PBKDF2 auth (`zwatson` — see test_credentials.md)
- Manage News, Encounters, Blog (Notes), Testimonies, Subscribers
- Donation Goal editor (monthly target)
- View Donations, Volunteers, Contacts, Prayer Requests
- CSV export for donations

## Recent Updates (2026-06-18)
- All images served locally from `/images/` (no external CDN dependency, no SSL errors)
- New ministry section names + descriptions (PEW Pantry, Garments of Grace, Kingdom Care)
- Personal phone number removed from footer + contact page
- Custom Kingdom Care image uploaded by user (luxury hygiene flat-lay)
- New Get Involved hero (community volunteers)
- New Mission section image (prayer/stained glass)
- **"Loving You Back To Life" CRM**: outreach contact book with photo, phone, address, birthday, family notes, custom tags (PEW Pantry/Garments of Grace/etc.), "How we met" field, and a per-contact **Next Step Journal** for follow-ups. Upcoming follow-ups + birthdays (14 days) summary on the index. New D1 tables `loving_you_back_contacts` + `next_step_journal`. Wired into `/admin/lybtl` and `/admin/lybtl/:id` with a gradient nav button on the Admin Dashboard. **LIVE & VERIFIED — contacts can be added** ✅
- **CI/CD via GitHub Actions** (`.github/workflows/cloudflare-pages.yml`): every push to `main` auto-deploys both the Worker (compiled from `cloudflare-backend/src/index.ts`) and the Pages frontend (built with the correct Worker URL baked in inline). Requires GitHub Secrets `CLOUDFLARE_API_TOKEN` (Pages:Edit + Workers Scripts:Edit) and `CLOUDFLARE_ACCOUNT_ID`. No more manual zip uploads or "read-only editor" issues.
- Code-review safe fixes: console.error gated behind NODE_ENV in `api.js`; array-index keys replaced with stable IDs/URLs in `Home`/`NewsDetail`/`BlogDetail`.
- **Site enhancement bundle (2026-06-18 PM):**
  - Animated **Miracle Counter** on the homepage (lives touched / kits given / runs completed / donations received) with IntersectionObserver-triggered easeOutCubic animation. Hidden if all counters are 0. Source: D1 settings + live donation count via new public `/api/stats/impact`.
  - **Confetti burst** on completed Stripe donation (canvas-confetti, gold palette).
  - **Live impact preview** on Donate page: as user picks an amount, shows what their dollars provide (kits, weeks of groceries, miracle blessings, gas tanks).
  - **Verse of the Day** card in the Footer — 31 curated KJV/ESV verses keyed by day of month.
  - **Working Prayer Wall "I prayed" button** — increments a per-request counter (new `pray_count` column), persists in localStorage so each visitor only counts once, optimistic UI.
  - **PWA installable** — `manifest.json` + apple-touch-icon + theme color (amber/slate). Open Graph / Twitter card meta tags added to `index.html` for shareable links.
  - **Admin "Today at a Glance" card** at the top of `/admin/dashboard` with last-24h activity (new donations + amount, new prayer requests, new CRM contacts, new subscribers, today's follow-ups). Pending-testimonies alert with quick "Review →" link.
  - **Admin Impact Counter editor** — the admin can type in lives_touched / kits_given / miracle_runs and the homepage ticker updates immediately.
  - New endpoints: `POST /api/prayer-requests/:id/pray`, `GET /api/stats/impact`, `PUT /api/admin/stats/impact`, `GET /api/admin/today-summary`.
  - New SQL migration `site-enhancements-migration.sql` (adds `pray_count` column + seeds 0-value impact settings).
- **Memorable & fun pack (2026-06-18 evening):**
  - **Hero flame breathing animation** + 14 drifting golden particles for soul on the homepage hero
  - **Sparkle cursor trail** (desktop only, respects `prefers-reduced-motion`) — gold dust follows the pointer
  - **Light a Candle wall** at `/light-a-candle` — anonymous prayer candles with name + optional 200-char intention, flickering candle animation, persistent in new D1 `candles` table. Total counter at top, recent-200 wall below. Admin can delete.
  - **Live prayer count** badge on the Prayer Wall ("X prayers offered on this wall") with pulsing live dot, refreshes every 30s
  - **Wheel of Blessing** on the Donate page — 12-slice spinning wheel with emoji blessings (free encouragement prompts + impact equivalents), 4-second spin with confetti pop on result
  - **Konami code easter egg** — type ↑↑↓↓←→←→BA anywhere on the site for a 4-second confetti rain + "You found a secret blessing! God loves you 🕊️" toast
  - **Random Verse floating button** — gold orb in bottom-right of every page, opens modal with random Scripture, "Another verse" reshuffles, "Share" generates a quote card
  - **Find the Dove hunt** — 5 hidden white-dove SVGs across Home, About, Ministries, Donate, Prayer Wall; clicks tracked in localStorage; toast on each find; confetti + Psalm 37:4 when all 5 found; progress badge in footer
  - New endpoints: `POST /api/candles`, `GET /api/candles`, `DELETE /api/admin/candles/:id`, `GET /api/stats/prayer-count`, `DELETE /api/admin/prayer-requests/:id`
  - New SQL migration `candles-migration.sql` (creates `candles` table + index)
- **Theme + Audio polish (2026-06-18 late evening):**
  - **Warm Light theme** — toggleable via sun/moon button in the header. Adds `.warm-mode` class to `<html>`, CSS swaps slate backgrounds to cream/amber palette. Persists in localStorage. Default is dark.
  - **Worship music toggle** — floating speaker button (bottom-left), reads `/audio/worship.mp3`, plays on loop at 25% volume. Shows "Tap for soft worship music" tooltip on first visit. Gracefully tells user "coming soon" if audio file not uploaded yet. README at `/app/frontend/public/audio/README.md` explains where to drop the file.

## 2026-02-XX — Sacred Pause polish
- Removed Web Audio chime + bell toggle from `BreathingPrayer.jsx` (user did not like the chime).
- Restructured overlay so the "A Sacred Pause" title sits clearly at the top of the screen (was getting clipped under the previous centered layout). Phrase block now reserves min-height to prevent layout shift between phases.
- Verified end-to-end via testing agent (iteration_1.json — 100% frontend pass).

## 2026-02-XX — Sacred Pause removed
- Per user request, the Sacred Pause feature was fully removed. Deleted `/app/frontend/src/components/BreathingPrayer.jsx` and removed the `BreathingPrayerTrigger` import + usage from `Header.jsx`. Verified header has no Sacred Pause button.

## 2026-02-XX — Preview 404s fixed
- Added 3 compatibility stub endpoints to legacy FastAPI `server.py` so the dev preview environment no longer 404s for `/api/testimonies`, `/api/donations/progress`, `/api/stats/impact`. They return the same JSON shape as the Cloudflare Worker (empty array / zeros). Production Cloudflare Worker already had real implementations of these.
- Verified via testing_agent (iteration_2.json — 100% backend pytest + 100% frontend).

## 2026-02-XX — Free Notary Services
- New public page at `/notary` — hero + info tiles + request form (Name*, Phone*, Email, Type of paperwork, Preferred date/time, Message).
- New nav link "Free Notary Services" in the header (desktop + mobile).
- Cloudflare Worker: `POST /api/notary-requests` persists to a new D1 table `notary_requests` and emails the admin via Resend. `GET /api/admin/notary-requests` + `DELETE /api/admin/notary-requests/:id` are admin-only.
- Legacy FastAPI has echo/empty stubs so preview form flow works.
- Admin Dashboard: new "Notary" tab lists all requests with click-to-call phone links, click-to-email addresses, and per-row delete.
- D1 migration file: `/app/cf-dashboard-deploy/notary-migration.sql` — **user must run this once in the Cloudflare D1 console** after the next GitHub push.
- Verified via testing_agent (iteration_3.json — 100% backend 6/6 pytest, 100% frontend).

## 2026-02-XX — Resource Directory
- New header dropdown "Resource Directory" with 5 categories: Housing/Rental, Food, Clothing, Social Services, Mental/Behavioral Health.
- Public pages at `/resources/:category` with quick-switch pills and rich cards (address→Google Maps, phone→tel:, website, hours, notes).
- Curated seed of **48 real Richmond & Henrico orgs**: 10 housing, 12 food, 9 clothing, 9 social services, 8 mental health. Sources include Feed More, CARITAS, Homeward, RBHA, HAMHDS, Interfaith Henrico, CVLAS, 988, and more.
- Header refactored to support multiple dropdowns (activeDropdown state). Nav item font size reduced to `text-[13px]` and "Free Notary Services" relabeled "Free Notary" — all tabs fit at 1440px without overflow.
- Admin Dashboard: new "Resources" tab with per-category filter, "+ Add Resource" button, edit modal (10 fields), delete, and per-row Visible/Hidden toggle.
- Cloudflare Worker endpoints: `GET /api/resources?category=X`, `GET/POST/PUT/DELETE /api/admin/resources`.
- Preview FastAPI: in-memory CRUD backed by `resources_seed.py` — deterministic uuid5 IDs.
- D1 migration: `/app/cf-dashboard-deploy/resources-migration.sql` (schema + full seed).
- Verified via testing_agent (iteration_4.json — 100% backend 11/11 pytest, 100% frontend).

## 2026-02-XX — SQL Migration Download Endpoints
- Added `/api/download/notary-migration-sql` and `/api/download/resources-migration-sql` to legacy FastAPI so user can grab intact migration files from browser (avoids copy-paste truncation issues).
- Verified via testing_agent (iteration_5.json — 100% backend).

## 2026-02-XX — AdminDashboard Refactor
- Split 1,225-line monolith into 1 shell + 12 focused sub-components under `/app/frontend/src/pages/admin/`.
- New file structure: AdminHeader, TodayCard, ImpactEditor, GoalEditor, StatsCards, TabBar, DonationsTab, VolunteersTab, ContactsTab, PrayersTab, NotaryTab, ResourcesTab, ResourceModal + utils.js.
- Zero behavior changes — every data-testid preserved. AdminDashboard.jsx shrank from 1225 → 429 lines. Average sub-component ~90 lines.
- Verified via testing_agent (iteration_6.json — 100% refactor scope, all interactive flows work end-to-end).

## 2026-02-XX — URL-based Admin Tab Routing + Abuse/DV Category
- Admin Dashboard: added `?tab=` URL param syncing via `useSearchParams`. Refreshes and shared links open the correct tab. Browser back/forward navigate between tabs. Invalid tab keys silently fall back to donations.
- Resource Directory: added 6th category **"Abuse / Domestic Violence"** with 10 real Richmond/Henrico orgs (Greater Richmond Regional Hotline / YWCA, Safe Harbor 24/7 + admin, Henrico Police DV Victim Services, Richmond Police FSVU, Virginia Statewide Hotline, National DV Hotline, CVLAS Protective Orders, Richmond SPCA Safer Together / SAAF).
- New icon: ShieldAlert (fuchsia→rose gradient) — visually distinct for the sensitive category.
- Updated header dropdown (now 6 items), preview seed (now 58 total), SQL migration (81 lines), and new delta SQL file (`resources-dv-delta.sql` — 10 idempotent INSERTs the user can run against existing D1).
- New download endpoint `/api/download/resources-dv-delta-sql`.
- Verified via testing_agent (iteration_7.json — 100% backend 20/20 pytest, 100% frontend across 13 scenarios).

## 2026-02-XX — Shareable Per-Org Anchor Links
- Every resource card now has a stable slug id (kebab-case of the org name) and a copy-link icon button (top-right of the card).
- Clicking the button copies `${origin}/resources/${category}#${slug}` to the clipboard, shows a toast, and briefly flips the icon to a green check.
- Direct visits to a hash link auto-scroll the target card into view and apply a highlighted amber ring for ~3.5s.
- Invalid or absent hashes render normally with no errors.
- Verified via testing_agent (iteration_8.json — 100% frontend 6/6 scenarios).

## Notes
- All "customer-assets.emergentagent.com" image URLs replaced with local `/images/` paths
- Stripe LIVE keys in use
- Resend domain verification still pending — emails will activate when user sets `RESEND_API_KEY` + `RESEND_FROM_EMAIL` secrets
- Emergent deployment should be deleted to stop credit drain (only after final verification on Cloudflare)
