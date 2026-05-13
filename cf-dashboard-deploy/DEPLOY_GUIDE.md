# tryHimandsee Ministries — Cloudflare Dashboard-Only Deployment Guide

Everything below is done in the Cloudflare web dashboard. **No terminal commands.**

You have two files in this folder:
- `worker.js` — your entire backend, bundled into one file
- `schema.sql` — the database tables to create

Read each step in order. Click slowly. If you get stuck on a step, stop and ask for help before continuing.

---

## Part 1 — Create the D1 Database (~3 minutes)

1. Go to https://dash.cloudflare.com and log in.
2. In the left sidebar click **Workers & Pages** → then click **D1** in the submenu.
   - If you don't see D1, scroll the sidebar — sometimes it's under "Storage & Databases".
3. Click the blue **Create database** button.
4. Database name: type `tryhimandsee-db`
5. Location: pick "Automatic" (or whatever is closest to your users — Eastern US is fine)
6. Click **Create**.

You should now see your new database. **Stay on this page.**

### Apply the schema:
1. Click the **Console** tab (top of the page).
2. Open the `schema.sql` file on your computer in any text editor (Notepad, TextEdit, VS Code, etc.).
3. Select ALL the text in `schema.sql` (Ctrl+A or Cmd+A).
4. Copy it (Ctrl+C or Cmd+C).
5. Click into the Cloudflare D1 Console and paste (Ctrl+V or Cmd+V).
6. Click the **Execute** button.

You should see results like "Query executed successfully" with green checkmarks. About 10 tables get created.

### Save the database ID:
1. Click the **Settings** tab on the D1 page.
2. You'll see a "Database ID" — it looks like `abc12345-6789-...`
3. Copy it somewhere — you'll paste it in Part 3.

---

## Part 2 — Create the R2 Bucket (~1 minute)

1. In the left sidebar click **R2 Object Storage** (or just "R2").
2. If this is your first time using R2, Cloudflare will ask you to "Enable R2" — it's free, click Enable.
3. Click **Create bucket**.
4. Bucket name: `tryhimandsee-media`
5. Location: pick "Automatic"
6. Click **Create bucket**.

### Enable public access (so uploaded images load):
1. Click your new `tryhimandsee-media` bucket.
2. Click the **Settings** tab.
3. Find **Public access** → click **Allow Access**.
4. Cloudflare gives you a URL like `https://pub-xxxxxxxxxx.r2.dev` — copy this URL somewhere.

---

## Part 3 — Create the Worker (~5 minutes)

1. In the left sidebar click **Workers & Pages**.
2. Click **Create application**.
3. Click **Create Worker** (the big blue button).
4. Worker name: `tryhimandsee-backend`
5. Click **Deploy** (a placeholder "Hello World" Worker gets created).

### Replace the code with our backend:
1. After deployment, click **Edit code** (top right).
2. The web code editor opens. You'll see "Hello World" code.
3. Select ALL the code in the editor (click inside it, then Ctrl+A / Cmd+A).
4. Delete it.
5. Open `worker.js` from your computer in a text editor.
6. Select all (Ctrl+A) → copy (Ctrl+C).
7. Paste it into the Cloudflare code editor.
8. Click **Deploy** (top right of the editor).

You should see "Deployed successfully." The Worker URL appears — something like `https://tryhimandsee-backend.YOUR-SUBDOMAIN.workers.dev`. **Copy that URL and save it.**

---

## Part 4 — Connect D1 + R2 to the Worker (~3 minutes)

The Worker code runs but doesn't have access to the database or bucket yet. We bind them now.

1. On the Worker page, click **Settings** tab.
2. Click **Bindings** (in the left sub-menu).
3. Click **Add binding** → choose **D1 database**.
   - Variable name: `DB` (exactly two letters, uppercase)
   - D1 database: select `tryhimandsee-db` from the dropdown
   - Click **Deploy** or **Save**.

4. Click **Add binding** again → choose **R2 bucket**.
   - Variable name: `MEDIA` (uppercase)
   - R2 bucket: select `tryhimandsee-media`
   - Click **Save**.

---

## Part 5 — Set the Worker Secrets (~3 minutes)

Still on the Worker's **Settings → Bindings** page (or **Variables and Secrets** depending on Cloudflare's current layout):

You need to add 5 secrets. For each one click **Add variable** (or **Add secret**) and choose **Type: Secret**:

| Variable name | Value |
|---|---|
| `JWT_SECRET` | A random 50+ character string (just mash your keyboard, or use [this generator](https://1password.com/password-generator/)) |
| `STRIPE_API_KEY` | Your Stripe LIVE secret key (`sk_live_...`) |
| `ADMIN_SETUP_KEY` | Any random string you make up (used ONCE in Part 7) |
| `R2_PUBLIC_BASE_URL` | The `https://pub-xxxxxxxxxx.r2.dev` URL you copied in Part 2 |
| `CORS_ORIGINS` | `*` (just an asterisk) — we'll tighten this in Part 9 |

**Important**: For `CORS_ORIGINS`, choose **Type: Variable (plaintext)** — not Secret. The rest should be **Type: Secret**.

After adding all 5, click **Deploy** to apply.

---

## Part 6 — Test the Worker (~1 minute)

In your browser, visit your Worker URL + `/api/`:
`https://tryhimandsee-backend.YOUR-SUBDOMAIN.workers.dev/api/`

You should see:
```json
{"message":"tryHimandsee Ministries API","status":"running","version":"1.0.0"}
```

If yes, your backend is alive!

---

## Part 7 — Seed Your Admin Account (~1 minute)

Cloudflare has a built-in tool to make HTTP requests called a "REST API explorer" — but the easiest way for non-developers is to use https://reqbin.com (a free online tool).

1. Go to https://reqbin.com
2. URL: paste `https://tryhimandsee-backend.YOUR-SUBDOMAIN.workers.dev/api/admin/setup`
3. Method: change from GET to **POST**
4. Click **Content** tab → choose **JSON**
5. Body: paste this (use your real password):
   ```json
   {"username":"zwatson","password":"Anandotowel@1988*"}
   ```
6. Click **Headers** tab → click **Add Header**:
   - Name: `X-Setup-Key`
   - Value: the random string you put in `ADMIN_SETUP_KEY` in Part 5
7. Click the big **Send** button.

Expected response (right side): `{"id":"...","username":"zwatson"}` with status 200.

**Done!** Your admin account is created. The setup endpoint now refuses to run again — it's safely locked.

---

## Part 8 — Rebuild Your Frontend with the New Backend URL

Paste your Worker URL back to your developer (me). I will:
- Rebuild the React frontend with your Worker URL baked in as the backend
- Give you a new ZIP to upload to Cloudflare Pages
- That replaces the current Pages deployment

---

## Part 9 — Tighten CORS (~1 minute, do this AFTER Part 8)

Once your Cloudflare Pages site is live at its real URL (whether `tryhimandsee.pages.dev` or your custom domain):

1. Go back to your Worker → Settings → Bindings → find `CORS_ORIGINS`
2. Click Edit → change value from `*` to a comma-separated list of allowed origins:
   ```
   https://tryhimandsee.pages.dev,https://tryhimandseeministries.org,https://www.tryhimandseeministries.org
   ```
3. Click Save / Deploy.

---

## Part 10 — Connect Custom Domain (Optional, do AFTER everything else works)

To make `tryhimandseeministries.org` serve your Cloudflare site:

1. Cloudflare Pages → click your `tryhimandsee` Pages project → **Custom domains** tab → **Set up a custom domain**
2. Type `tryhimandseeministries.org`
3. Cloudflare will tell you what DNS records to update. If your domain is already managed by Cloudflare (i.e., you bought it through Cloudflare or transferred it), Cloudflare adds the records automatically.
4. If your domain is registered elsewhere, Cloudflare gives you the records to add at your registrar.

Once the domain is verified (can take a few minutes to hours), `https://tryhimandseeministries.org` will serve your Cloudflare site, and Stripe + admin + everything will work because the frontend calls the Worker URL directly.

After custom domain is live, you can shut down your Emergent deployment to stop the 50 credits/month bill.

---

## Troubleshooting

**"Bindings not found" error in Worker logs**
→ You skipped Part 4. Go back and add the D1 + R2 bindings.

**Worker shows 500 errors**
→ Check the Worker's **Logs** tab in the dashboard. Look for the error message and tell me what it says.

**Setup endpoint returns "Invalid setup key"**
→ The `ADMIN_SETUP_KEY` secret value doesn't match the `X-Setup-Key` header. Double-check both.

**Setup endpoint returns 409 "Admin already exists"**
→ You ran it twice or someone got there first. To reset: go to D1 Console, run `DELETE FROM admins;`, then try again.

**Stripe checkout fails**
→ Verify the `STRIPE_API_KEY` secret is your LIVE key (`sk_live_...`), not a test key. Redeploy the Worker after fixing.

---

## What You'll Have At the End

- ✅ Backend running 24/7 on Cloudflare Workers (free)
- ✅ Database on Cloudflare D1 (free)
- ✅ File storage on Cloudflare R2 (free)
- ✅ Frontend on Cloudflare Pages (free)
- ✅ Custom domain works (free)
- ✅ No more 50 credits/month bill on Emergent

You can delete your Emergent deployment **only after** Part 10 is done and you've verified the Cloudflare site fully works (test a donation, log in as admin, etc.).
