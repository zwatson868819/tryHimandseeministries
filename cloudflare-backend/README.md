# tryHimandsee Ministries — Cloudflare Backend

Full-stack Cloudflare deployment: Worker (Hono/TypeScript) + D1 (SQLite) + R2 (file storage) + Stripe.

This replaces the FastAPI/MongoDB backend with a 100% Cloudflare native stack.

---

## What's included

- **Worker** (`src/index.ts`) — all API endpoints, Hono framework
- **D1 schema** (`schema.sql`) — all tables, fresh-start ready
- **R2 bucket** — admin media uploads (news/lesson images & videos)
- **Stripe** — direct REST API (no SDK) for one-time + monthly checkout
- **Auth** — JWT signing + PBKDF2 password hashing via Web Crypto API

---

## One-Time Setup (do this once)

### 0. Install Wrangler CLI

```bash
cd cloudflare-backend
npm install            # installs wrangler + hono locally
npx wrangler login     # opens browser, authenticate with Cloudflare
```

### 1. Create D1 database

```bash
npx wrangler d1 create tryhimandsee-db
```

The command prints something like:
```
[[d1_databases]]
binding = "DB"
database_name = "tryhimandsee-db"
database_id = "abc12345-..."
```

Copy the `database_id` value and paste it into `wrangler.toml` (replace `REPLACE_WITH_YOUR_D1_DATABASE_ID`).

### 2. Create R2 bucket

```bash
npx wrangler r2 bucket create tryhimandsee-media
```

### 3. Apply database schema

```bash
npx wrangler d1 execute tryhimandsee-db --remote --file=./schema.sql
```

You should see ~10 tables created.

### 4. Set required secrets

Run each command and paste the value when prompted:

```bash
# 32+ random characters — used to sign admin JWTs
npx wrangler secret put JWT_SECRET

# Your Stripe LIVE secret key (sk_live_...)
npx wrangler secret put STRIPE_API_KEY

# A random one-time password used ONLY to seed the first admin account
npx wrangler secret put ADMIN_SETUP_KEY

# Public R2 URL (leave blank for now — fill in step 7)
npx wrangler secret put R2_PUBLIC_BASE_URL
```

You can generate strong random secrets with:
```bash
openssl rand -hex 32
```

### 5. Deploy the Worker

```bash
npx wrangler deploy
```

You'll get a URL like `https://tryhimandsee-backend.<your-subdomain>.workers.dev`. **Copy this — it's your backend URL.**

### 6. Seed the first admin account

Replace `<URL>` with your Worker URL and `<SETUP_KEY>` with the `ADMIN_SETUP_KEY` you set in step 4:

```bash
curl -X POST https://<URL>/api/admin/setup \
  -H "Content-Type: application/json" \
  -H "X-Setup-Key: <SETUP_KEY>" \
  -d '{"username":"zwatson","password":"Anandotowel@1988*"}'
```

You should get back `{"id":"...","username":"zwatson"}`. This endpoint is one-time — it refuses to run once an admin exists.

### 7. (Optional) Public R2 access for media

R2 buckets are private by default. To serve uploaded news/lesson images publicly:

**Easiest**: enable r2.dev public URL on the bucket from the Cloudflare dashboard:
- Cloudflare Dashboard → R2 → `tryhimandsee-media` → Settings → **Public access** → enable "Allow Access"
- Copy the `https://pub-...r2.dev` URL it gives you
- Set it as the secret: `npx wrangler secret put R2_PUBLIC_BASE_URL` (paste the URL)
- Redeploy: `npx wrangler deploy`

**Better (custom domain)**: connect a domain like `media.tryhimandseeministries.org` to the bucket in the Cloudflare dashboard.

If you skip this step, uploaded files are still accessible via `/api/r2/<key>` (proxied through the Worker — slower but works).

### 8. Configure CORS for your Pages domain

After you deploy the frontend (next section), update the allowed origins. Edit `wrangler.toml`:

```toml
[vars]
CORS_ORIGINS = "https://tryhimandseeministries.org,https://www.tryhimandseeministries.org"
```

Then redeploy:
```bash
npx wrangler deploy
```

---

## Frontend (React) on Cloudflare Pages

1. In the React app, set `REACT_APP_BACKEND_URL` to your Worker URL (no trailing slash):
   - For example: `https://tryhimandsee-backend.your-subdomain.workers.dev`

2. Rebuild the React app:
   ```bash
   cd ../frontend
   REACT_APP_BACKEND_URL=https://tryhimandsee-backend.your-subdomain.workers.dev yarn build
   ```

3. Upload the `build/` folder to Cloudflare Pages (Direct Upload).

The build already includes a `_redirects` file with `/*  /index.html  200` for SPA routing.

---

## Endpoint Map

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/` | — | Health check |
| POST | `/api/admin/setup` | Setup-Key | One-time bootstrap of first admin |
| POST | `/api/admin/login` | — | Returns JWT |
| POST | `/api/contacts` | — | Submit contact form |
| POST | `/api/volunteers` | — | Submit volunteer form |
| POST | `/api/prayer-requests` | — | Submit prayer request |
| GET | `/api/prayer-requests` | — | List public prayer requests |
| GET | `/api/news` | — | List news |
| GET | `/api/news/:id` | — | Single news post |
| POST/PUT/DELETE | `/api/news[:id]` | JWT | Admin news CRUD |
| GET | `/api/lessons` | — | List lessons |
| GET | `/api/lessons/:id` | — | Single lesson |
| POST/PUT/DELETE | `/api/lessons[:id]` | JWT | Admin lesson CRUD |
| GET | `/api/comments/:lessonId` | — | List comments |
| POST | `/api/comments` | — | Submit comment |
| POST | `/api/upload` | JWT | Upload to R2 |
| GET | `/api/r2/:key` | — | Serve R2 file (fallback) |
| POST | `/api/payments/checkout` | — | Stripe checkout (one-time or monthly) |
| GET | `/api/payments/checkout/status/:id` | — | Poll status |
| GET | `/api/admin/dashboard/stats` | JWT | Aggregate counts |
| GET | `/api/admin/contacts` | JWT | All contacts |
| GET | `/api/admin/volunteers` | JWT | All volunteers |
| GET | `/api/admin/prayer-requests` | JWT | All prayer requests |
| GET | `/api/admin/donations` | JWT | All donations |
| GET | `/api/admin/donations/export` | JWT | CSV download |

---

## Local development

```bash
npx wrangler dev
```

Use `--local` for an offline D1 instance, or omit for remote D1.

---

## Cost (free tier as of 2026)

- **Workers**: 100,000 requests/day free
- **D1**: 5M reads + 100K writes/day free
- **R2**: 10 GB storage + 1M class-A ops/month free
- **Pages**: 500 builds/month, unlimited bandwidth

For a ministry-sized site this will all stay in the free tier comfortably.
