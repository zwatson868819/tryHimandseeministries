import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  hashPassword,
  verifyPassword,
  signAdminToken,
  verifyAdminToken,
} from "./auth";
import {
  createOneTimeCheckoutSession,
  createMonthlyCheckoutSession,
  getCheckoutStatus,
} from "./stripe";

type Bindings = {
  DB: D1Database;
  MEDIA: R2Bucket;
  JWT_SECRET: string;
  STRIPE_API_KEY: string;
  ADMIN_SETUP_KEY: string;
  CORS_ORIGINS: string;
  R2_PUBLIC_BASE_URL: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  SITE_BASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const allowed = (c.env.CORS_ORIGINS || "*").split(",").map((s: string) => s.trim());
      if (allowed.includes("*")) return origin || "*";
      return allowed.includes(origin || "") ? origin || "" : null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ---------- helpers ----------
function uuid(): string {
  return crypto.randomUUID();
}
function now(): string {
  return new Date().toISOString();
}
function parseJsonArray(s: string | null | undefined): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

async function requireAdmin(c: any): Promise<{ adminId: string; username: string } | null> {
  const authHeader = c.req.header("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const payload = await verifyAdminToken(c.env.JWT_SECRET, token);
  if (!payload) return null;
  return { adminId: payload.sub, username: payload.username };
}

// ---------- health ----------
app.get("/api/", (c) =>
  c.json({ message: "tryHimandsee Ministries API", status: "running", version: "1.0.0" })
);

// ---------- admin bootstrap (one-time) ----------
app.post("/api/admin/setup", async (c) => {
  const setupKey = c.req.header("X-Setup-Key") || "";
  if (!c.env.ADMIN_SETUP_KEY || setupKey !== c.env.ADMIN_SETUP_KEY) {
    return c.json({ detail: "Invalid setup key" }, 401);
  }
  const body = await c.req.json<{ username: string; password: string }>();
  if (!body.username || !body.password) {
    return c.json({ detail: "username and password required" }, 400);
  }
  const existing = await c.env.DB.prepare("SELECT id FROM admins LIMIT 1").first();
  if (existing) {
    return c.json({ detail: "Admin already exists. Use a manual SQL update to add more." }, 409);
  }
  const id = uuid();
  const hash = await hashPassword(body.password);
  await c.env.DB.prepare(
    "INSERT INTO admins (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)"
  )
    .bind(id, body.username, hash, now())
    .run();
  return c.json({ id, username: body.username });
});

// ---------- admin login ----------
app.post("/api/admin/login", async (c) => {
  const { username, password } = await c.req.json<{ username: string; password: string }>();
  if (!username || !password) return c.json({ detail: "Invalid credentials" }, 401);
  const row = await c.env.DB.prepare(
    "SELECT id, username, password_hash FROM admins WHERE username = ?"
  )
    .bind(username)
    .first<{ id: string; username: string; password_hash: string }>();
  if (!row) return c.json({ detail: "Invalid credentials" }, 401);
  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) return c.json({ detail: "Invalid credentials" }, 401);
  const token = await signAdminToken(c.env.JWT_SECRET, row.id, row.username);
  return c.json({ access_token: token, token_type: "bearer", username: row.username });
});

// ---------- contacts ----------
app.post("/api/contacts", async (c) => {
  const b = await c.req.json<any>();
  if (!b.name || !b.email || !b.message) return c.json({ detail: "Missing fields" }, 400);
  const id = uuid();
  await c.env.DB.prepare(
    "INSERT INTO contacts (id, name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(id, b.name, b.email, b.phone ?? null, b.subject ?? null, b.message, now())
    .run();
  return c.json({ id, ...b, created_at: now() }, 201);
});

// ---------- volunteers ----------
app.post("/api/volunteers", async (c) => {
  const b = await c.req.json<any>();
  if (!b.name || !b.email) return c.json({ detail: "Missing fields" }, 400);
  const id = uuid();
  await c.env.DB.prepare(
    "INSERT INTO volunteers (id, name, email, phone, interests, availability, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      id,
      b.name,
      b.email,
      b.phone ?? null,
      b.interests ?? null,
      b.availability ?? null,
      b.message ?? null,
      now()
    )
    .run();
  return c.json({ id, ...b, created_at: now() }, 201);
});

// ---------- prayer requests ----------
app.post("/api/prayer-requests", async (c) => {
  const b = await c.req.json<any>();
  if (!b.name || !b.request) return c.json({ detail: "Missing fields" }, 400);
  const id = uuid();
  const isPublic = b.is_public === false ? 0 : 1;
  await c.env.DB.prepare(
    "INSERT INTO prayer_requests (id, name, email, request, is_public, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(id, b.name, b.email ?? null, b.request, isPublic, now())
    .run();
  return c.json({ id, ...b, is_public: !!isPublic, created_at: now() }, 201);
});

app.get("/api/prayer-requests", async (c) => {
  const limit = Math.min(parseInt(c.req.query("limit") || "10", 10), 100);
  const isPublic = c.req.query("is_public") !== "false";
  const rows = await c.env.DB.prepare(
    `SELECT id, name, request, is_public, created_at FROM prayer_requests
     WHERE is_public = ? ORDER BY created_at DESC LIMIT ?`
  )
    .bind(isPublic ? 1 : 0, limit)
    .all();
  return c.json(
    (rows.results || []).map((r: any) => ({ ...r, is_public: !!r.is_public }))
  );
});

// ---------- news ----------
app.get("/api/news", async (c) => {
  const limit = Math.min(parseInt(c.req.query("limit") || "50", 10), 200);
  const publishedOnly = c.req.query("published_only") !== "false";
  const sql = publishedOnly
    ? "SELECT * FROM news WHERE published = 1 ORDER BY created_at DESC LIMIT ?"
    : "SELECT * FROM news ORDER BY created_at DESC LIMIT ?";
  const rows = await c.env.DB.prepare(sql).bind(limit).all();
  return c.json(
    (rows.results || []).map((r: any) => ({
      ...r,
      image_urls: parseJsonArray(r.image_urls),
      video_urls: parseJsonArray(r.video_urls),
      published: !!r.published,
    }))
  );
});

app.get("/api/news/:id", async (c) => {
  const row = await c.env.DB.prepare("SELECT * FROM news WHERE id = ?")
    .bind(c.req.param("id"))
    .first<any>();
  if (!row) return c.json({ detail: "News post not found" }, 404);
  return c.json({
    ...row,
    image_urls: parseJsonArray(row.image_urls),
    video_urls: parseJsonArray(row.video_urls),
    published: !!row.published,
  });
});

app.post("/api/news", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const b = await c.req.json<any>();
  if (!b.title || !b.content) return c.json({ detail: "Missing fields" }, 400);
  const id = uuid();
  const t = now();
  await c.env.DB.prepare(
    "INSERT INTO news (id, title, content, excerpt, image_urls, video_urls, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      id,
      b.title,
      b.content,
      b.excerpt ?? null,
      JSON.stringify(b.image_urls ?? []),
      JSON.stringify(b.video_urls ?? []),
      b.published === false ? 0 : 1,
      t,
      t
    )
    .run();
  return c.json({ id, ...b, created_at: t, updated_at: t }, 201);
});

app.put("/api/news/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const b = await c.req.json<any>();
  const existing = await c.env.DB.prepare("SELECT id FROM news WHERE id = ?").bind(id).first();
  if (!existing) return c.json({ detail: "News post not found" }, 404);
  await c.env.DB.prepare(
    "UPDATE news SET title = ?, content = ?, excerpt = ?, image_urls = ?, video_urls = ?, published = ?, updated_at = ? WHERE id = ?"
  )
    .bind(
      b.title,
      b.content,
      b.excerpt ?? null,
      JSON.stringify(b.image_urls ?? []),
      JSON.stringify(b.video_urls ?? []),
      b.published === false ? 0 : 1,
      now(),
      id
    )
    .run();
  return c.json({ id, ...b, updated_at: now() });
});

app.delete("/api/news/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  await c.env.DB.prepare("DELETE FROM news WHERE id = ?").bind(c.req.param("id")).run();
  return c.json({ message: "Deleted" });
});

// ---------- lessons (encounter series) ----------
app.get("/api/lessons", async (c) => {
  const limit = Math.min(parseInt(c.req.query("limit") || "50", 10), 200);
  const publishedOnly = c.req.query("published_only") !== "false";
  const sql = publishedOnly
    ? "SELECT * FROM lessons WHERE published = 1 ORDER BY created_at DESC LIMIT ?"
    : "SELECT * FROM lessons ORDER BY created_at DESC LIMIT ?";
  const rows = await c.env.DB.prepare(sql).bind(limit).all();
  return c.json(
    (rows.results || []).map((r: any) => ({
      ...r,
      image_urls: parseJsonArray(r.image_urls),
      video_urls: parseJsonArray(r.video_urls),
      published: !!r.published,
    }))
  );
});

app.get("/api/lessons/:id", async (c) => {
  const row = await c.env.DB.prepare("SELECT * FROM lessons WHERE id = ?")
    .bind(c.req.param("id"))
    .first<any>();
  if (!row) return c.json({ detail: "Lesson not found" }, 404);
  return c.json({
    ...row,
    image_urls: parseJsonArray(row.image_urls),
    video_urls: parseJsonArray(row.video_urls),
    published: !!row.published,
  });
});

app.post("/api/lessons", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const b = await c.req.json<any>();
  if (!b.title || !b.content) return c.json({ detail: "Missing fields" }, 400);
  const id = uuid();
  const t = now();
  await c.env.DB.prepare(
    "INSERT INTO lessons (id, title, content, scripture_reference, image_urls, video_urls, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      id,
      b.title,
      b.content,
      b.scripture_reference ?? null,
      JSON.stringify(b.image_urls ?? []),
      JSON.stringify(b.video_urls ?? []),
      b.published === false ? 0 : 1,
      t,
      t
    )
    .run();
  return c.json({ id, ...b, created_at: t, updated_at: t }, 201);
});

app.put("/api/lessons/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const b = await c.req.json<any>();
  const existing = await c.env.DB.prepare("SELECT id FROM lessons WHERE id = ?").bind(id).first();
  if (!existing) return c.json({ detail: "Lesson not found" }, 404);
  await c.env.DB.prepare(
    "UPDATE lessons SET title = ?, content = ?, scripture_reference = ?, image_urls = ?, video_urls = ?, published = ?, updated_at = ? WHERE id = ?"
  )
    .bind(
      b.title,
      b.content,
      b.scripture_reference ?? null,
      JSON.stringify(b.image_urls ?? []),
      JSON.stringify(b.video_urls ?? []),
      b.published === false ? 0 : 1,
      now(),
      id
    )
    .run();
  return c.json({ id, ...b, updated_at: now() });
});

app.delete("/api/lessons/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  await c.env.DB.prepare("DELETE FROM comments WHERE lesson_id = ?")
    .bind(c.req.param("id"))
    .run();
  await c.env.DB.prepare("DELETE FROM lessons WHERE id = ?").bind(c.req.param("id")).run();
  return c.json({ message: "Deleted" });
});

// ---------- blog posts ----------
app.get("/api/blog", async (c) => {
  const limit = Math.min(parseInt(c.req.query("limit") || "50", 10), 200);
  const publishedOnly = c.req.query("published_only") !== "false";
  const sql = publishedOnly
    ? "SELECT * FROM blog_posts WHERE published = 1 ORDER BY created_at DESC LIMIT ?"
    : "SELECT * FROM blog_posts ORDER BY created_at DESC LIMIT ?";
  const rows = await c.env.DB.prepare(sql).bind(limit).all();
  return c.json(
    (rows.results || []).map((r: any) => ({
      ...r,
      image_urls: parseJsonArray(r.image_urls),
      video_urls: parseJsonArray(r.video_urls),
      published: !!r.published,
    }))
  );
});

app.get("/api/blog/:id", async (c) => {
  const row = await c.env.DB.prepare("SELECT * FROM blog_posts WHERE id = ?")
    .bind(c.req.param("id"))
    .first<any>();
  if (!row) return c.json({ detail: "Blog post not found" }, 404);
  return c.json({
    ...row,
    image_urls: parseJsonArray(row.image_urls),
    video_urls: parseJsonArray(row.video_urls),
    published: !!row.published,
  });
});

app.post("/api/blog", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const b = await c.req.json<any>();
  if (!b.title || !b.content) return c.json({ detail: "Missing fields" }, 400);
  const id = uuid();
  const t = now();
  const isPublished = b.published === false ? 0 : 1;
  await c.env.DB.prepare(
    "INSERT INTO blog_posts (id, title, content, excerpt, author, image_urls, video_urls, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      id,
      b.title,
      b.content,
      b.excerpt ?? null,
      b.author ?? null,
      JSON.stringify(b.image_urls ?? []),
      JSON.stringify(b.video_urls ?? []),
      isPublished,
      t,
      t
    )
    .run();

  // Auto-email subscribers if published
  let emailResult: any = null;
  if (isPublished === 1) {
    emailResult = await sendBlogNotification(c.env, {
      id,
      title: b.title,
      author: b.author,
      excerpt: b.excerpt,
      content: b.content,
    });
  }

  return c.json({ id, ...b, created_at: t, updated_at: t, email: emailResult }, 201);
});

app.put("/api/blog/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const b = await c.req.json<any>();
  const existing = await c.env.DB.prepare("SELECT id FROM blog_posts WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) return c.json({ detail: "Blog post not found" }, 404);
  await c.env.DB.prepare(
    "UPDATE blog_posts SET title = ?, content = ?, excerpt = ?, author = ?, image_urls = ?, video_urls = ?, published = ?, updated_at = ? WHERE id = ?"
  )
    .bind(
      b.title,
      b.content,
      b.excerpt ?? null,
      b.author ?? null,
      JSON.stringify(b.image_urls ?? []),
      JSON.stringify(b.video_urls ?? []),
      b.published === false ? 0 : 1,
      now(),
      id
    )
    .run();
  return c.json({ id, ...b, updated_at: now() });
});

app.delete("/api/blog/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  await c.env.DB.prepare("DELETE FROM blog_posts WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return c.json({ message: "Deleted" });
});

// ---------- Resend email helper ----------
async function sendBlogNotification(
  env: Bindings,
  post: { id: string; title: string; author?: string | null; excerpt?: string | null; content: string }
): Promise<{ sent: number; skipped: boolean; error?: string }> {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    return { sent: 0, skipped: true };
  }
  const subs = await env.DB.prepare("SELECT email FROM subscribers").all();
  const emails = (subs.results || []).map((r: any) => r.email).filter(Boolean);
  if (emails.length === 0) return { sent: 0, skipped: true };

  const siteBase = (env.SITE_BASE_URL || "").replace(/\/+$/, "") ||
    "https://tryhimandseeministries.org";
  const postUrl = `${siteBase}/blog/${post.id}`;
  const preview = (post.excerpt || post.content || "")
    .substring(0, 280)
    .replace(/\n+/g, " ")
    .trim();
  const byline = post.author ? `<p style="color:#94a3b8;font-size:14px;margin:0 0 16px;">by ${escapeHtml(post.author)}</p>` : "";

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0f172a;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #f59e0b33;">
        <tr><td style="padding:32px 32px 16px;text-align:center;">
          <p style="color:#fbbf24;font-size:12px;letter-spacing:2px;margin:0 0 8px;text-transform:uppercase;">Notes from the Secret Place</p>
          <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px;line-height:1.3;">${escapeHtml(post.title)}</h1>
          ${byline}
        </td></tr>
        <tr><td style="padding:8px 32px 24px;">
          <p style="color:#cbd5e1;font-size:16px;line-height:1.6;margin:0;">${escapeHtml(preview)}${preview.length >= 280 ? "..." : ""}</p>
        </td></tr>
        <tr><td style="padding:8px 32px 32px;text-align:center;">
          <a href="${postUrl}" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Read the Note</a>
        </td></tr>
        <tr><td style="padding:24px 32px;border-top:1px solid #334155;text-align:center;">
          <p style="color:#64748b;font-size:12px;margin:0;">
            You're receiving this because you subscribed at <a href="${siteBase}/blog" style="color:#f59e0b;">tryHimandsee Ministries</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  // Resend supports a single send with multiple recipients in `bcc` to keep addresses private.
  // Free tier: 100 emails/day, 3000/month. Each `to`+`bcc` recipient counts as one email.
  // Chunk into batches of 49 BCC + 1 to (total 50 per send is safe under Resend limits).
  let sent = 0;
  let lastError: string | undefined;
  const CHUNK = 49;
  for (let i = 0; i < emails.length; i += CHUNK) {
    const chunk = emails.slice(i, i + CHUNK);
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.RESEND_FROM_EMAIL,
          to: [env.RESEND_FROM_EMAIL], // primary recipient (yourself); subscribers in BCC
          bcc: chunk,
          subject: `New Note: ${post.title}`,
          html,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        lastError = `Resend ${res.status}: ${body}`;
        console.error(lastError);
      } else {
        sent += chunk.length;
      }
    } catch (e: any) {
      lastError = e?.message || "Email send failed";
      console.error(lastError);
    }
  }
  return { sent, skipped: false, error: lastError };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------- subscribers ----------
app.post("/api/subscribers", async (c) => {
  const b = await c.req.json<any>();
  const email = (b.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ detail: "Please enter a valid email address" }, 400);
  }
  const name = b.name ? String(b.name).trim().substring(0, 100) : null;
  const existing = await c.env.DB.prepare("SELECT id FROM subscribers WHERE email = ?")
    .bind(email)
    .first();
  if (existing) {
    return c.json({ detail: "You're already subscribed — thank you!" }, 409);
  }
  const id = uuid();
  await c.env.DB.prepare(
    "INSERT INTO subscribers (id, email, name, created_at) VALUES (?, ?, ?, ?)"
  )
    .bind(id, email, name, now())
    .run();
  return c.json({ id, email, name, created_at: now() }, 201);
});

app.get("/api/admin/subscribers", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const rows = await c.env.DB.prepare(
    "SELECT id, email, name, created_at FROM subscribers ORDER BY created_at DESC LIMIT 5000"
  ).all();
  return c.json(rows.results || []);
});

app.delete("/api/admin/subscribers/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  await c.env.DB.prepare("DELETE FROM subscribers WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return c.json({ message: "Removed" });
});

// ---------- comments ----------
app.post("/api/comments", async (c) => {
  const b = await c.req.json<any>();
  if (!b.lesson_id || !b.author || !b.text) return c.json({ detail: "Missing fields" }, 400);
  const id = uuid();
  await c.env.DB.prepare(
    "INSERT INTO comments (id, lesson_id, author, text, created_at) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(id, b.lesson_id, b.author, b.text, now())
    .run();
  return c.json({ id, ...b, created_at: now() }, 201);
});

app.get("/api/comments/:lessonId", async (c) => {
  const limit = Math.min(parseInt(c.req.query("limit") || "100", 10), 500);
  const rows = await c.env.DB.prepare(
    "SELECT id, lesson_id, author, text, created_at FROM comments WHERE lesson_id = ? ORDER BY created_at DESC LIMIT ?"
  )
    .bind(c.req.param("lessonId"), limit)
    .all();
  return c.json(rows.results || []);
});

// ---------- file upload (R2) ----------
app.post("/api/upload", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const form = await c.req.formData();
  const file = form.get("file") as unknown as File | null;
  if (!file || typeof (file as any).stream !== "function") return c.json({ detail: "No file" }, 400);
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const key = `${uuid()}.${ext}`;
  await c.env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
  });
  const base = (c.env.R2_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  const url = base ? `${base}/${key}` : `/api/r2/${key}`;
  return c.json({ url, key, filename: file.name });
});

// Public R2 proxy (used only if R2_PUBLIC_BASE_URL is not configured)
app.get("/api/r2/:key", async (c) => {
  const key = c.req.param("key");
  const obj = await c.env.MEDIA.get(key);
  if (!obj) return c.notFound();
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
});

// ---------- payments ----------
app.post("/api/payments/checkout", async (c) => {
  const b = await c.req.json<any>();
  if (!b.name || !b.email) return c.json({ detail: "Missing donor info" }, 400);
  const amount = parseFloat(b.amount);
  if (!amount || amount <= 0) return c.json({ detail: "Invalid amount" }, 400);
  const origin = (b.origin_url || "").replace(/\/+$/, "");
  if (!origin) return c.json({ detail: "Missing origin_url" }, 400);
  const successUrl = `${origin}/donate?session_id={CHECKOUT_SESSION_ID}&success=true`;
  const cancelUrl = `${origin}/donate?canceled=true`;
  const metadata: Record<string, string> = {
    donation_type: b.donation_type || "one-time",
    donor_name: b.name,
    donor_email: b.email,
    source: "tryHimandsee_ministries",
  };
  const isMonthly = (b.donation_type || "").toLowerCase() === "monthly";
  const session = isMonthly
    ? await createMonthlyCheckoutSession(c.env.STRIPE_API_KEY, {
        amount,
        successUrl,
        cancelUrl,
        customerEmail: b.email,
        metadata,
      })
    : await createOneTimeCheckoutSession(c.env.STRIPE_API_KEY, {
        amount,
        successUrl,
        cancelUrl,
        customerEmail: b.email,
        metadata,
      });

  const t = now();
  await c.env.DB.prepare(
    "INSERT INTO payment_transactions (id, session_id, amount, currency, donation_type, name, email, message, payment_status, status, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      uuid(),
      session.id,
      amount,
      "usd",
      metadata.donation_type,
      b.name,
      b.email,
      b.message ?? null,
      "pending",
      "initiated",
      JSON.stringify(metadata),
      t,
      t
    )
    .run();

  return c.json({ url: session.url, session_id: session.id });
});

app.get("/api/payments/checkout/status/:sessionId", async (c) => {
  const sessionId = c.req.param("sessionId");
  const status = await getCheckoutStatus(c.env.STRIPE_API_KEY, sessionId);
  const existing = await c.env.DB.prepare(
    "SELECT * FROM payment_transactions WHERE session_id = ?"
  )
    .bind(sessionId)
    .first<any>();
  if (existing && existing.payment_status !== status.payment_status) {
    const newStatus =
      status.payment_status === "paid"
        ? "completed"
        : status.status === "expired"
        ? "failed"
        : "processing";
    await c.env.DB.prepare(
      "UPDATE payment_transactions SET payment_status = ?, status = ?, updated_at = ? WHERE session_id = ?"
    )
      .bind(status.payment_status, newStatus, now(), sessionId)
      .run();
    if (status.payment_status === "paid" && existing.payment_status !== "paid") {
      await c.env.DB.prepare(
        "INSERT INTO donations (id, amount, donation_type, name, email, message, status, transaction_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
        .bind(
          uuid(),
          existing.amount,
          existing.donation_type,
          existing.name,
          existing.email,
          existing.message,
          "completed",
          sessionId,
          now()
        )
        .run();
    }
  }
  return c.json(status);
});

// ---------- admin dashboard ----------
app.get("/api/admin/dashboard/stats", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);

  const [contacts, volunteers, prayers, donations, totalDon] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as n FROM contacts").first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as n FROM volunteers").first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as n FROM prayer_requests").first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as n FROM donations WHERE status = 'completed'").first<{
      n: number;
    }>(),
    c.env.DB.prepare(
      "SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE status = 'completed'"
    ).first<{ total: number }>(),
  ]);

  return c.json({
    total_contacts: contacts?.n ?? 0,
    total_volunteers: volunteers?.n ?? 0,
    total_prayer_requests: prayers?.n ?? 0,
    total_donations: donations?.n ?? 0,
    total_donation_amount: totalDon?.total ?? 0,
  });
});

app.get("/api/admin/contacts", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const rows = await c.env.DB.prepare(
    "SELECT * FROM contacts ORDER BY created_at DESC LIMIT 500"
  ).all();
  return c.json(rows.results || []);
});

app.get("/api/admin/volunteers", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const rows = await c.env.DB.prepare(
    "SELECT * FROM volunteers ORDER BY created_at DESC LIMIT 500"
  ).all();
  return c.json(rows.results || []);
});

app.get("/api/admin/prayer-requests", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const rows = await c.env.DB.prepare(
    "SELECT * FROM prayer_requests ORDER BY created_at DESC LIMIT 500"
  ).all();
  return c.json(
    (rows.results || []).map((r: any) => ({ ...r, is_public: !!r.is_public }))
  );
});

app.get("/api/admin/donations", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const rows = await c.env.DB.prepare(
    "SELECT * FROM donations ORDER BY created_at DESC LIMIT 500"
  ).all();
  return c.json(rows.results || []);
});

app.get("/api/admin/donations/export", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const rows = await c.env.DB.prepare(
    "SELECT id, amount, donation_type, name, email, message, status, transaction_id, created_at FROM donations ORDER BY created_at DESC"
  ).all();
  const list = (rows.results || []) as any[];
  const header = "id,amount,donation_type,name,email,message,status,transaction_id,created_at";
  const csv = [header]
    .concat(
      list.map((r) =>
        [
          r.id,
          r.amount,
          r.donation_type,
          `"${(r.name ?? "").replace(/"/g, '""')}"`,
          r.email,
          `"${(r.message ?? "").replace(/"/g, '""')}"`,
          r.status,
          r.transaction_id ?? "",
          r.created_at,
        ].join(",")
      )
    )
    .join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="donations.csv"',
    },
  });
});

// 404
app.notFound((c) => c.json({ detail: "Not found" }, 404));

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ detail: err.message || "Internal error" }, 500);
});

export default app;
