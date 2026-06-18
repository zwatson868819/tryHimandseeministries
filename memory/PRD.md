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

## Notes
- All "customer-assets.emergentagent.com" image URLs replaced with local `/images/` paths
- Stripe LIVE keys in use
- Resend domain verification still pending — emails will activate when user sets `RESEND_API_KEY` + `RESEND_FROM_EMAIL` secrets
- Emergent deployment should be deleted to stop credit drain (only after final verification on Cloudflare)
