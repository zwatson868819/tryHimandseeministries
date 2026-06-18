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
- **"Loving You Back To Life" CRM**: outreach contact book with photo, phone, address, birthday, family notes, custom tags (PEW Pantry/Garments of Grace/etc.), "How we met" field, and a per-contact **Next Step Journal** for follow-ups. Upcoming follow-ups + birthdays (14 days) summary on the index. New D1 tables `loving_you_back_contacts` + `next_step_journal`. Wired into `/admin/lybtl` and `/admin/lybtl/:id` with a gradient nav button on the Admin Dashboard.

## Notes
- All "customer-assets.emergentagent.com" image URLs replaced with local `/images/` paths
- Stripe LIVE keys in use
- Resend domain verification still pending — emails will activate when user sets `RESEND_API_KEY` + `RESEND_FROM_EMAIL` secrets
- Emergent deployment should be deleted to stop credit drain (only after final verification on Cloudflare)
