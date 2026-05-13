# tryHimandsee Ministries — PRD

## Original Problem Statement
Build a website for a nonprofit business called "tryHimandsee ministries" that encourages people to follow Christ and seek encounters with Him. It acts as an outreach initiative that caters to the poor and underserved communities of Richmond and Henrico by offering food, clothing, and hygiene kits.

## Core Requirements
- Custom-branded full-stack web app (React + FastAPI + MongoDB)
- Stripe payment integration for donations (LIVE mode), one-time + monthly recurring
- JWT-secured Admin Dashboard for managing News and Encounter Lessons
- Clean removal of all platform (Emergent) branding from the user-facing site

## Implemented
- Public pages: Home, About, Ministries, Encounters, Get Involved, Contact, Donate, Prayer Requests, News, News Detail
- Admin pages: Login, Dashboard, News Management, Encounters Management
- Stripe Checkout (LIVE) — one-time donations via emergentintegrations wrapper
- Stripe Checkout (LIVE) — **monthly recurring subscriptions** via official `stripe` SDK with inline `price_data` + `mode='subscription'` (2026-02-13)
- JWT + bcrypt admin auth (credentials in test_credentials.md)
- Footer "Staff Login" discreet link
- Removed Emergent debug-monitor + posthog analytics scripts from `public/index.html` (2026-02-13)
- Fixed duplicate `getLessons`/`getLesson`/`createLesson` declarations in `src/services/api.js` (2026-02-13)

## Backlog (P2)
- SMS/Twilio push notifications for admin login alerts
- Refactor `/app/backend/routes.py` (>1200 lines) into modular routers
- Admin view of active subscriptions (cancel/refund) if desired

## Notes
- `customer-assets.emergentagent.com` URLs are the church's own uploaded logos (asset CDN), NOT Emergent branding.
- Stripe LIVE API key in STRIPE_API_KEY env var. Do NOT swap with test keys.
- Monthly subscription endpoint: same `/api/payments/checkout` with `donation_type: "monthly"`.
