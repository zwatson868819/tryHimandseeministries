# tryHimandsee Ministries — PRD

## Original Problem Statement
Build a website for a nonprofit business called "tryHimandsee ministries" that encourages people to follow Christ and seek encounters with Him. It acts as an outreach initiative that caters to the poor and underserved communities of Richmond and Henrico by offering food, clothing, and hygiene kits.

## Core Requirements
- Custom-branded full-stack web app (React + FastAPI + MongoDB)
- Stripe payment integration for donations (LIVE mode)
- JWT-secured Admin Dashboard for managing News and Encounter Lessons
- Clean removal of all platform (Emergent) branding from the user-facing site

## Implemented
- Public pages: Home, About, Ministries, Encounters, Get Involved, Contact, Donate, Prayer Requests, News, News Detail
- Admin pages: Login, Dashboard, News Management, Encounters Management
- Stripe checkout with LIVE keys
- JWT + bcrypt admin auth (credentials: `zwatson` / see test_credentials.md)
- Footer "Staff Login" discreet link
- Removed Emergent debug-monitor + posthog analytics scripts from `public/index.html` (2026-02-13)
- Removed Emergent visual-edit script block from index.html (2026-02-13)
- Fixed duplicate `getLessons`/`getLesson`/`createLesson` declarations in `src/services/api.js` that were blocking deployment (2026-02-13)

## Backlog (P2)
- SMS/Twilio push notifications for admin login alerts
- Refactor `/app/backend/routes.py` into modular routers (`auth.py`, `news.py`, `stripe.py`)

## Notes
- `customer-assets.emergentagent.com` URLs in source are the church's own uploaded logos/images — NOT Emergent branding.
- Stripe uses a LIVE API key. Do not swap with test keys.
