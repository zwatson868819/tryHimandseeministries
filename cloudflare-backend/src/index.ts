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
    `SELECT id, name, request, is_public, created_at, COALESCE(pray_count, 0) as pray_count FROM prayer_requests
     WHERE is_public = ? ORDER BY created_at DESC LIMIT ?`
  )
    .bind(isPublic ? 1 : 0, limit)
    .all();
  return c.json(
    (rows.results || []).map((r: any) => ({ ...r, is_public: !!r.is_public }))
  );
});

// Increment "praying" counter on a public prayer request. No auth - public action.
app.post("/api/prayer-requests/:id/pray", async (c) => {
  const id = c.req.param("id");
  const existing = await c.env.DB.prepare(
    "SELECT id, is_public FROM prayer_requests WHERE id = ?"
  )
    .bind(id)
    .first<{ id: string; is_public: number }>();
  if (!existing) return c.json({ detail: "Not found" }, 404);
  if (!existing.is_public) return c.json({ detail: "Not public" }, 403);
  await c.env.DB.prepare(
    "UPDATE prayer_requests SET pray_count = COALESCE(pray_count, 0) + 1 WHERE id = ?"
  )
    .bind(id)
    .run();
  const row = await c.env.DB.prepare(
    "SELECT COALESCE(pray_count, 0) as pray_count FROM prayer_requests WHERE id = ?"
  )
    .bind(id)
    .first<{ pray_count: number }>();
  return c.json({ id, pray_count: row?.pray_count ?? 0 });
});

// ---------- notary requests ----------
// Public endpoint - anyone can request a free notary appointment.
app.post("/api/notary-requests", async (c) => {
  const b = await c.req.json<any>();
  if (!b.name || !b.phone) return c.json({ detail: "Name and phone are required" }, 400);
  const id = uuid();
  const createdAt = now();
  await c.env.DB.prepare(
    "INSERT INTO notary_requests (id, name, phone, email, document_type, preferred_time, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)"
  )
    .bind(
      id,
      b.name,
      b.phone,
      b.email ?? null,
      b.document_type ?? null,
      b.preferred_time ?? null,
      b.message ?? null,
      createdAt
    )
    .run();

  // Fire-and-forget email to admin (via Resend). We don't fail the request if email fails.
  if (c.env.RESEND_API_KEY && c.env.RESEND_FROM_EMAIL) {
    const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0f172a;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #f59e0b33;">
        <tr><td style="padding:32px 32px 16px;">
          <p style="color:#fbbf24;font-size:12px;letter-spacing:2px;margin:0 0 8px;text-transform:uppercase;">Free Notary Request</p>
          <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px;line-height:1.3;">New notary appointment request</h1>
        </td></tr>
        <tr><td style="padding:8px 32px 24px;color:#cbd5e1;font-size:15px;line-height:1.7;">
          <p style="margin:0 0 8px;"><strong style="color:#f59e0b;">Name:</strong> ${escapeHtml(b.name)}</p>
          <p style="margin:0 0 8px;"><strong style="color:#f59e0b;">Phone:</strong> ${escapeHtml(b.phone)}</p>
          ${b.email ? `<p style="margin:0 0 8px;"><strong style="color:#f59e0b;">Email:</strong> ${escapeHtml(b.email)}</p>` : ""}
          ${b.document_type ? `<p style="margin:0 0 8px;"><strong style="color:#f59e0b;">Paperwork:</strong> ${escapeHtml(b.document_type)}</p>` : ""}
          ${b.preferred_time ? `<p style="margin:0 0 8px;"><strong style="color:#f59e0b;">Preferred time:</strong> ${escapeHtml(b.preferred_time)}</p>` : ""}
          ${b.message ? `<p style="margin:16px 0 0;padding-top:16px;border-top:1px solid #334155;"><strong style="color:#f59e0b;">Message:</strong><br/>${escapeHtml(b.message)}</p>` : ""}
        </td></tr>
        <tr><td style="padding:16px 32px 24px;border-top:1px solid #334155;">
          <p style="color:#64748b;font-size:12px;margin:0;">Submitted ${escapeHtml(createdAt)} - view all in the admin dashboard.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: c.env.RESEND_FROM_EMAIL,
          to: [c.env.RESEND_FROM_EMAIL],
          subject: `Notary request from ${b.name}`,
          html,
          reply_to: b.email || undefined,
        }),
      });
    } catch (e) {
      console.error("Notary email send failed", e);
    }
  }

  return c.json({ id, ...b, status: "new", created_at: createdAt }, 201);
});

app.get("/api/admin/notary-requests", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const rows = await c.env.DB.prepare(
    "SELECT * FROM notary_requests ORDER BY created_at DESC LIMIT 500"
  ).all();
  return c.json(rows.results || []);
});

app.delete("/api/admin/notary-requests/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM notary_requests WHERE id = ?").bind(id).run();
  return c.json({ ok: true });
});

// ---------- resource directory ----------
// Public: list active resources, optionally filtered by category.
app.get("/api/resources", async (c) => {
  const category = c.req.query("category");
  const stmt = category
    ? c.env.DB.prepare(
        "SELECT * FROM resources WHERE is_active = 1 AND category = ? ORDER BY sort_order ASC, name ASC"
      ).bind(category)
    : c.env.DB.prepare(
        "SELECT * FROM resources WHERE is_active = 1 ORDER BY category, sort_order ASC, name ASC"
      );
  const rows = await stmt.all();
  return c.json(rows.results || []);
});

// Admin: list ALL resources (including inactive)
app.get("/api/admin/resources", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const rows = await c.env.DB.prepare(
    "SELECT * FROM resources ORDER BY category, sort_order ASC, name ASC"
  ).all();
  return c.json(rows.results || []);
});

app.post("/api/admin/resources", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const b = await c.req.json<any>();
  if (!b.category || !b.name) return c.json({ detail: "Category and name are required" }, 400);
  const id = uuid();
  const ts = now();
  await c.env.DB.prepare(
    "INSERT INTO resources (id, category, name, description, address, phone, website, hours, notes, sort_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      id,
      b.category,
      b.name,
      b.description ?? "",
      b.address ?? "",
      b.phone ?? "",
      b.website ?? "",
      b.hours ?? "",
      b.notes ?? "",
      typeof b.sort_order === "number" ? b.sort_order : 999,
      b.is_active === false ? 0 : 1,
      ts,
      ts
    )
    .run();
  return c.json({ id, ...b, created_at: ts, updated_at: ts }, 201);
});

app.put("/api/admin/resources/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const b = await c.req.json<any>();
  const ts = now();
  await c.env.DB.prepare(
    "UPDATE resources SET category = ?, name = ?, description = ?, address = ?, phone = ?, website = ?, hours = ?, notes = ?, sort_order = ?, is_active = ?, updated_at = ? WHERE id = ?"
  )
    .bind(
      b.category,
      b.name,
      b.description ?? "",
      b.address ?? "",
      b.phone ?? "",
      b.website ?? "",
      b.hours ?? "",
      b.notes ?? "",
      typeof b.sort_order === "number" ? b.sort_order : 999,
      b.is_active === false ? 0 : 1,
      ts,
      id
    )
    .run();
  return c.json({ ok: true, updated_at: ts });
});

app.delete("/api/admin/resources/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM resources WHERE id = ?").bind(id).run();
  return c.json({ ok: true });
});

// ---------- Voices from the Street ----------
// Public: submit an audio testimony. Multipart: audio, first_name, category, ref_source.
app.post("/api/voices", async (c) => {
  const form = await c.req.formData();
  const audio = form.get("audio");
  const firstName = String(form.get("first_name") || "").trim();
  const category = String(form.get("category") || "testimony");
  const refSource = String(form.get("ref_source") || "");
  const durationSec = Number(form.get("duration_sec") || 0) | 0;

  if (!(audio instanceof Blob)) return c.json({ detail: "Missing audio" }, 400);
  if (!firstName) return c.json({ detail: "First name is required" }, 400);
  if (audio.size > 8 * 1024 * 1024) return c.json({ detail: "Audio too large (max 8MB)" }, 413);

  const id = uuid();
  const audioKey = `voices/${id}.webm`;

  // Store the audio in R2
  await c.env.MEDIA.put(audioKey, audio.stream(), {
    httpMetadata: { contentType: audio.type || "audio/webm" },
  });

  // Transcribe with Cloudflare Workers AI Whisper (skip if binding missing e.g. local test)
  let transcript = "";
  try {
    if (c.env.AI) {
      const arrayBuf = await audio.arrayBuffer();
      const audioBase64 = arrayBufferToBase64(arrayBuf);
      const result = (await c.env.AI.run("@cf/openai/whisper-large-v3-turbo", {
        audio: audioBase64,
        language: "en",
      })) as { text?: string };
      transcript = (result?.text || "").trim();
    }
  } catch (e) {
    console.error("Whisper transcription failed:", e);
  }

  const publicUrl = c.env.R2_PUBLIC_BASE_URL
    ? `${c.env.R2_PUBLIC_BASE_URL}/${audioKey}`
    : "";

  await c.env.DB.prepare(
    "INSERT INTO voices (id, first_name, audio_key, audio_url, mime_type, duration_sec, transcript, category, ref_source, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)"
  )
    .bind(
      id, firstName, audioKey, publicUrl, audio.type || "audio/webm",
      durationSec, transcript, category, refSource || null, now()
    )
    .run();

  return c.json({ id, transcript, status: "pending" }, 201);
});

// Public: get the approved audio testimony wall.
app.get("/api/voices", async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT id, first_name, audio_url, audio_key, transcript, category, duration_sec, created_at, approved_at FROM voices WHERE status = 'approved' ORDER BY approved_at DESC LIMIT 100"
  ).all();
  return c.json(rows.results || []);
});

// Public: stream a single audio blob (fallback if R2_PUBLIC_BASE_URL not configured).
app.get("/api/voices/audio/:id", async (c) => {
  const id = c.req.param("id");
  const row = await c.env.DB.prepare(
    "SELECT audio_key, mime_type, status FROM voices WHERE id = ?"
  ).bind(id).first<any>();
  if (!row || row.status !== "approved") return c.notFound();
  const obj = await c.env.MEDIA.get(row.audio_key);
  if (!obj) return c.notFound();
  return new Response(obj.body, {
    headers: {
      "Content-Type": row.mime_type || "audio/webm",
      "Cache-Control": "public, max-age=86400",
    },
  });
});

// Admin: list all voices with pending queue first.
app.get("/api/admin/voices", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const rows = await c.env.DB.prepare(
    "SELECT * FROM voices ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END, created_at DESC LIMIT 500"
  ).all();
  return c.json(rows.results || []);
});

app.put("/api/admin/voices/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const b = await c.req.json<any>();
  const ts = now();
  await c.env.DB.prepare(
    "UPDATE voices SET first_name = COALESCE(?, first_name), transcript = COALESCE(?, transcript), category = COALESCE(?, category), status = COALESCE(?, status), approved_at = CASE WHEN ? = 'approved' THEN ? ELSE approved_at END WHERE id = ?"
  )
    .bind(
      b.first_name ?? null,
      b.transcript ?? null,
      b.category ?? null,
      b.status ?? null,
      b.status ?? null,
      ts,
      id
    )
    .run();
  return c.json({ ok: true, updated_at: ts });
});

app.delete("/api/admin/voices/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const row = await c.env.DB.prepare("SELECT audio_key FROM voices WHERE id = ?").bind(id).first<any>();
  if (row?.audio_key) {
    try { await c.env.MEDIA.delete(row.audio_key); } catch { /* ignore */ }
  }
  await c.env.DB.prepare("DELETE FROM voices WHERE id = ?").bind(id).run();
  return c.json({ ok: true });
});

// ---------- Miracle Mailbox ----------
// Public: retrieve mailbox content by code + track visit.
app.get("/api/mailbox/:code", async (c) => {
  const code = c.req.param("code").toUpperCase();
  const row = await c.env.DB.prepare("SELECT * FROM mailbox_codes WHERE code = ?").bind(code).first<any>();
  if (!row) return c.json({ detail: "Mailbox code not found" }, 404);

  const ts = now();
  await c.env.DB.prepare(
    "UPDATE mailbox_codes SET visit_count = visit_count + 1, last_visited_at = ?, first_opened_at = COALESCE(first_opened_at, ?) WHERE code = ?"
  ).bind(ts, ts, code).run();

  // Optionally hydrate featured voice
  let featured_voice = null;
  if (row.featured_voice_id) {
    featured_voice = await c.env.DB.prepare(
      "SELECT id, first_name, audio_url, audio_key, transcript FROM voices WHERE id = ? AND status = 'approved'"
    ).bind(row.featured_voice_id).first<any>();
  }
  return c.json({ ...row, featured_voice });
});

// Admin: bulk-generate mailbox codes.
app.post("/api/admin/mailbox/generate", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const b = await c.req.json<any>();
  const count = Math.max(1, Math.min(200, Number(b.count) || 10));
  const distributedBy = b.distributed_by || "";
  const distributedAt = b.distributed_at || null;
  const welcomeText = b.welcome_text || "";
  const scriptureRef = b.scripture_ref || "";
  const featuredVoiceId = b.featured_voice_id || null;

  const created: any[] = [];
  const ts = now();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing 0/O/1/I
  const genCode = () => {
    let s = "MM-";
    for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  };

  for (let i = 0; i < count; i++) {
    let code = genCode();
    // Retry once if collision (very unlikely with 32^5 space)
    let attempts = 0;
    while (attempts < 3) {
      try {
        await c.env.DB.prepare(
          "INSERT INTO mailbox_codes (code, welcome_text, scripture_ref, featured_voice_id, distributed_at, distributed_by, notes, visit_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)"
        ).bind(code, welcomeText, scriptureRef, featuredVoiceId, distributedAt, distributedBy, b.notes || "", ts).run();
        created.push({ code });
        break;
      } catch {
        code = genCode();
        attempts++;
      }
    }
  }
  return c.json({ created, count: created.length }, 201);
});

app.get("/api/admin/mailbox", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const rows = await c.env.DB.prepare(
    "SELECT * FROM mailbox_codes ORDER BY created_at DESC LIMIT 500"
  ).all();
  return c.json(rows.results || []);
});

app.put("/api/admin/mailbox/:code", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const code = c.req.param("code").toUpperCase();
  const b = await c.req.json<any>();
  await c.env.DB.prepare(
    "UPDATE mailbox_codes SET welcome_text = COALESCE(?, welcome_text), scripture_ref = COALESCE(?, scripture_ref), featured_voice_id = COALESCE(?, featured_voice_id), distributed_by = COALESCE(?, distributed_by), notes = COALESCE(?, notes) WHERE code = ?"
  ).bind(b.welcome_text ?? null, b.scripture_ref ?? null, b.featured_voice_id ?? null, b.distributed_by ?? null, b.notes ?? null, code).run();
  return c.json({ ok: true });
});

app.delete("/api/admin/mailbox/:code", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const code = c.req.param("code").toUpperCase();
  await c.env.DB.prepare("DELETE FROM mailbox_codes WHERE code = ?").bind(code).run();
  return c.json({ ok: true });
});

// Base64 helper for Whisper (nodejs_compat provides Buffer)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  // btoa is available in Workers runtime
  return btoa(binary);
}

// Public impact stats: combines admin-editable settings + live counts.
app.get("/api/stats/impact", async (c) => {
  const settingRows = await c.env.DB.prepare(
    "SELECT key, value FROM settings WHERE key IN ('impact_lives_touched','impact_kits_given','impact_miracle_runs')"
  ).all();
  const settings: Record<string, string> = {};
  for (const row of (settingRows.results || []) as any[]) {
    settings[row.key] = row.value;
  }
  const donations = await c.env.DB.prepare(
    "SELECT COUNT(*) as n FROM donations WHERE status = 'completed'"
  ).first<{ n: number }>();
  return c.json({
    lives_touched: parseInt(settings["impact_lives_touched"] || "0", 10),
    kits_given: parseInt(settings["impact_kits_given"] || "0", 10),
    miracle_runs: parseInt(settings["impact_miracle_runs"] || "0", 10),
    total_donations: donations?.n ?? 0,
  });
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
    return c.json({ detail: "You're already subscribed - thank you!" }, 409);
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

// ---------- testimonies ----------
app.post("/api/testimonies", async (c) => {
  const b = await c.req.json<any>();
  const name = (b.name || "").trim();
  const testimony = (b.testimony || "").trim();
  if (!name || !testimony) {
    return c.json({ detail: "Please share your name and testimony" }, 400);
  }
  if (testimony.length < 20) {
    return c.json({ detail: "Please share a bit more - at least a few sentences" }, 400);
  }
  const id = uuid();
  await c.env.DB.prepare(
    "INSERT INTO testimonies (id, name, email, location, testimony, status, created_at) VALUES (?, ?, ?, ?, ?, 'pending', ?)"
  )
    .bind(
      id,
      name.substring(0, 100),
      b.email ? String(b.email).trim().substring(0, 200) : null,
      b.location ? String(b.location).trim().substring(0, 100) : null,
      testimony.substring(0, 5000),
      now()
    )
    .run();
  return c.json({ id, message: "Thank you for sharing - your testimony has been received." }, 201);
});

// Public - only approved
app.get("/api/testimonies", async (c) => {
  const limit = Math.min(parseInt(c.req.query("limit") || "20", 10), 100);
  const rows = await c.env.DB.prepare(
    "SELECT id, name, location, testimony, approved_at FROM testimonies WHERE status = 'approved' ORDER BY approved_at DESC, created_at DESC LIMIT ?"
  )
    .bind(limit)
    .all();
  return c.json(rows.results || []);
});

// Admin - all
app.get("/api/admin/testimonies", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const status = c.req.query("status");
  const sql = status
    ? "SELECT * FROM testimonies WHERE status = ? ORDER BY created_at DESC LIMIT 500"
    : "SELECT * FROM testimonies ORDER BY created_at DESC LIMIT 500";
  const rows = status
    ? await c.env.DB.prepare(sql).bind(status).all()
    : await c.env.DB.prepare(sql).all();
  return c.json(rows.results || []);
});

// Admin - approve / reject / edit
app.put("/api/admin/testimonies/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const b = await c.req.json<any>();
  const existing = await c.env.DB.prepare("SELECT * FROM testimonies WHERE id = ?")
    .bind(id)
    .first<any>();
  if (!existing) return c.json({ detail: "Testimony not found" }, 404);

  const nextStatus = b.status || existing.status;
  const approvedAt =
    nextStatus === "approved" && existing.status !== "approved" ? now() : existing.approved_at;

  await c.env.DB.prepare(
    "UPDATE testimonies SET name = ?, location = ?, testimony = ?, status = ?, approved_at = ? WHERE id = ?"
  )
    .bind(
      b.name ?? existing.name,
      b.location ?? existing.location,
      b.testimony ?? existing.testimony,
      nextStatus,
      approvedAt,
      id
    )
    .run();
  return c.json({ id, status: nextStatus, message: "Updated" });
});

app.delete("/api/admin/testimonies/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  await c.env.DB.prepare("DELETE FROM testimonies WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return c.json({ message: "Deleted" });
});

// ---------- donation goal / progress ----------
async function getGoal(env: Bindings): Promise<number> {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'monthly_goal'").first<
    { value: string }
  >();
  const v = row ? parseFloat(row.value) : 1000;
  return Number.isFinite(v) && v > 0 ? v : 1000;
}

app.get("/api/donations/progress", async (c) => {
  const goal = await getGoal(c.env);
  // Start of current calendar month in UTC
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const row = await c.env.DB.prepare(
    "SELECT COALESCE(SUM(amount), 0) AS total FROM donations WHERE status = 'completed' AND created_at >= ?"
  )
    .bind(monthStart)
    .first<{ total: number }>();
  const raised = row?.total ?? 0;
  const percent = Math.min(100, Math.round((raised / goal) * 100));
  return c.json({
    goal,
    raised,
    percent,
    month: now.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
  });
});

app.put("/api/admin/settings/monthly-goal", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const b = await c.req.json<any>();
  const goal = parseFloat(b.goal);
  if (!Number.isFinite(goal) || goal <= 0) {
    return c.json({ detail: "Goal must be a positive number" }, 400);
  }
  await c.env.DB.prepare(
    "INSERT INTO settings (key, value) VALUES ('monthly_goal', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  )
    .bind(String(goal))
    .run();
  return c.json({ goal, message: "Goal updated" });
});

// ---------- Loving You Back To Life - Contacts CRM ----------

function mapContactRow(r: any) {
  if (!r) return r;
  return { ...r, tags: parseJsonArray(r.tags) };
}

app.get("/api/admin/lybtl/contacts", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const q = (c.req.query("q") || "").trim().toLowerCase();
  const sql = q
    ? `SELECT * FROM loving_you_back_contacts
       WHERE LOWER(name) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(email) LIKE ? OR LOWER(address) LIKE ?
       ORDER BY name LIMIT 500`
    : "SELECT * FROM loving_you_back_contacts ORDER BY name LIMIT 500";
  const rows = q
    ? await c.env.DB.prepare(sql).bind(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`).all()
    : await c.env.DB.prepare(sql).all();
  return c.json((rows.results || []).map(mapContactRow));
});

app.post("/api/admin/lybtl/contacts", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const b = await c.req.json<any>();
  const name = (b.name || "").trim();
  if (!name) return c.json({ detail: "Name is required" }, 400);
  const id = uuid();
  const t = now();
  await c.env.DB.prepare(
    "INSERT INTO loving_you_back_contacts (id, name, phone, email, address, birthday, how_we_met, family_notes, photo_url, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      id,
      name,
      b.phone ?? null,
      b.email ?? null,
      b.address ?? null,
      b.birthday ?? null,
      b.how_we_met ?? null,
      b.family_notes ?? null,
      b.photo_url ?? null,
      JSON.stringify(Array.isArray(b.tags) ? b.tags : []),
      t,
      t
    )
    .run();
  return c.json({ id, ...b, name, created_at: t, updated_at: t }, 201);
});

app.get("/api/admin/lybtl/contacts/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const row = await c.env.DB.prepare("SELECT * FROM loving_you_back_contacts WHERE id = ?")
    .bind(c.req.param("id"))
    .first<any>();
  if (!row) return c.json({ detail: "Not found" }, 404);
  return c.json(mapContactRow(row));
});

app.put("/api/admin/lybtl/contacts/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const b = await c.req.json<any>();
  const existing = await c.env.DB.prepare("SELECT id FROM loving_you_back_contacts WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) return c.json({ detail: "Not found" }, 404);
  await c.env.DB.prepare(
    "UPDATE loving_you_back_contacts SET name = ?, phone = ?, email = ?, address = ?, birthday = ?, how_we_met = ?, family_notes = ?, photo_url = ?, tags = ?, updated_at = ? WHERE id = ?"
  )
    .bind(
      b.name,
      b.phone ?? null,
      b.email ?? null,
      b.address ?? null,
      b.birthday ?? null,
      b.how_we_met ?? null,
      b.family_notes ?? null,
      b.photo_url ?? null,
      JSON.stringify(Array.isArray(b.tags) ? b.tags : []),
      now(),
      id
    )
    .run();
  return c.json({ id, ...b, updated_at: now() });
});

app.delete("/api/admin/lybtl/contacts/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM next_step_journal WHERE contact_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM loving_you_back_contacts WHERE id = ?").bind(id).run();
  return c.json({ message: "Deleted" });
});

// Journal entries
app.get("/api/admin/lybtl/contacts/:id/journal", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const rows = await c.env.DB.prepare(
    "SELECT * FROM next_step_journal WHERE contact_id = ? ORDER BY created_at DESC LIMIT 500"
  )
    .bind(c.req.param("id"))
    .all();
  return c.json(rows.results || []);
});

app.post("/api/admin/lybtl/contacts/:id/journal", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const contactId = c.req.param("id");
  const b = await c.req.json<any>();
  const note = (b.note || "").trim();
  if (!note) return c.json({ detail: "Note is required" }, 400);
  const id = uuid();
  await c.env.DB.prepare(
    "INSERT INTO next_step_journal (id, contact_id, note, follow_up_date, follow_up_reason, status, created_at) VALUES (?, ?, ?, ?, ?, 'active', ?)"
  )
    .bind(id, contactId, note, b.follow_up_date ?? null, b.follow_up_reason ?? null, now())
    .run();
  return c.json({ id, contact_id: contactId, note, follow_up_date: b.follow_up_date ?? null, follow_up_reason: b.follow_up_reason ?? null, status: "active", created_at: now() }, 201);
});

app.put("/api/admin/lybtl/journal/:entryId", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const b = await c.req.json<any>();
  const id = c.req.param("entryId");
  const existing = await c.env.DB.prepare("SELECT * FROM next_step_journal WHERE id = ?").bind(id).first<any>();
  if (!existing) return c.json({ detail: "Not found" }, 404);
  await c.env.DB.prepare(
    "UPDATE next_step_journal SET note = ?, follow_up_date = ?, follow_up_reason = ?, status = ? WHERE id = ?"
  )
    .bind(
      b.note ?? existing.note,
      b.follow_up_date !== undefined ? b.follow_up_date : existing.follow_up_date,
      b.follow_up_reason !== undefined ? b.follow_up_reason : existing.follow_up_reason,
      b.status ?? existing.status,
      id
    )
    .run();
  return c.json({ id, message: "Updated" });
});

app.delete("/api/admin/lybtl/journal/:entryId", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  await c.env.DB.prepare("DELETE FROM next_step_journal WHERE id = ?").bind(c.req.param("entryId")).run();
  return c.json({ message: "Deleted" });
});

// Upcoming follow-ups + birthdays (next 14 days)
app.get("/api/admin/lybtl/upcoming", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const future = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Follow-ups
  const fuRows = await c.env.DB.prepare(
    `SELECT j.id, j.contact_id, j.note, j.follow_up_date, j.follow_up_reason, c.name
     FROM next_step_journal j JOIN loving_you_back_contacts c ON c.id = j.contact_id
     WHERE j.status = 'active' AND j.follow_up_date IS NOT NULL
       AND j.follow_up_date >= ? AND j.follow_up_date <= ?
     ORDER BY j.follow_up_date ASC LIMIT 200`
  )
    .bind(todayISO, future)
    .all();

  // Birthdays - match MM-DD slice across the 14-day window
  const allContacts = await c.env.DB.prepare(
    "SELECT id, name, birthday, phone FROM loving_you_back_contacts WHERE birthday IS NOT NULL AND birthday != ''"
  ).all();
  const bdayUpcoming: any[] = [];
  for (const row of (allContacts.results || []) as any[]) {
    const bd: string = row.birthday;
    // Accept either YYYY-MM-DD or MM-DD
    const mmdd = bd.length >= 10 ? bd.slice(5, 10) : bd;
    if (!/^\d{2}-\d{2}$/.test(mmdd)) continue;
    for (let i = 0; i <= 14; i++) {
      const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const key = `${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      if (key === mmdd) {
        bdayUpcoming.push({
          contact_id: row.id,
          name: row.name,
          phone: row.phone,
          date: d.toISOString().slice(0, 10),
          mmdd,
        });
        break;
      }
    }
  }
  bdayUpcoming.sort((a, b) => a.date.localeCompare(b.date));

  return c.json({
    follow_ups: fuRows.results || [],
    birthdays: bdayUpcoming,
  });
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

// "Today" summary card - events in the last 24 hours + pending follow-ups for today.
app.get("/api/admin/today-summary", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [donCount, donSum, newPrayers, newContacts, newSubs, newTest, followups] = await Promise.all([
    c.env.DB.prepare(
      "SELECT COUNT(*) as n FROM donations WHERE status = 'completed' AND created_at >= ?"
    )
      .bind(since)
      .first<{ n: number }>(),
    c.env.DB.prepare(
      "SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE status = 'completed' AND created_at >= ?"
    )
      .bind(since)
      .first<{ total: number }>(),
    c.env.DB.prepare(
      "SELECT COUNT(*) as n FROM prayer_requests WHERE created_at >= ?"
    )
      .bind(since)
      .first<{ n: number }>(),
    c.env.DB.prepare(
      "SELECT COUNT(*) as n FROM loving_you_back_contacts WHERE created_at >= ?"
    )
      .bind(since)
      .first<{ n: number }>()
      .catch(() => ({ n: 0 })),
    c.env.DB.prepare(
      "SELECT COUNT(*) as n FROM subscribers WHERE created_at >= ?"
    )
      .bind(since)
      .first<{ n: number }>(),
    c.env.DB.prepare(
      "SELECT COUNT(*) as n FROM testimonies WHERE created_at >= ? AND status = 'pending'"
    )
      .bind(since)
      .first<{ n: number }>(),
    c.env.DB.prepare(
      `SELECT COUNT(*) as n FROM next_step_journal
       WHERE status = 'active' AND follow_up_date IS NOT NULL
       AND follow_up_date >= ? AND follow_up_date < ?`
    )
      .bind(todayStart.toISOString(), todayEnd.toISOString())
      .first<{ n: number }>()
      .catch(() => ({ n: 0 })),
  ]);

  return c.json({
    new_donations: donCount?.n ?? 0,
    new_donation_amount: donSum?.total ?? 0,
    new_prayer_requests: newPrayers?.n ?? 0,
    new_contacts: newContacts?.n ?? 0,
    new_subscribers: newSubs?.n ?? 0,
    new_testimonies_pending: newTest?.n ?? 0,
    followups_due_today: followups?.n ?? 0,
  });
});

// Admin-editable impact counters (Miracle Counter on homepage).
app.put("/api/admin/stats/impact", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  const b = await c.req.json<{ lives_touched?: number; kits_given?: number; miracle_runs?: number }>();
  const upsert = async (key: string, value: number) => {
    await c.env.DB.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
      .bind(key, String(value))
      .run();
  };
  if (typeof b.lives_touched === "number") await upsert("impact_lives_touched", b.lives_touched);
  if (typeof b.kits_given === "number") await upsert("impact_kits_given", b.kits_given);
  if (typeof b.miracle_runs === "number") await upsert("impact_miracle_runs", b.miracle_runs);
  return c.json({ ok: true });
});

// Admin: delete a prayer request
app.delete("/api/admin/prayer-requests/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  await c.env.DB.prepare("DELETE FROM prayer_requests WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return c.json({ ok: true });
});

// Public: total "I prayed" interactions across all prayer requests.
app.get("/api/stats/prayer-count", async (c) => {
  const row = await c.env.DB.prepare(
    "SELECT COALESCE(SUM(pray_count), 0) as total FROM prayer_requests WHERE is_public = 1"
  ).first<{ total: number }>();
  return c.json({ total: row?.total ?? 0 });
});

// Public Candle Wall - anonymous "Light a candle" page.
app.post("/api/candles", async (c) => {
  const b = await c.req.json<{ name?: string; intention?: string }>();
  const name = (b.name || "Anonymous").slice(0, 40).trim() || "Anonymous";
  const intention = (b.intention || "").slice(0, 200).trim();
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO candles (id, name, intention, created_at) VALUES (?, ?, ?, ?)"
  )
    .bind(id, name, intention, new Date().toISOString())
    .run();
  return c.json({ id, name, intention, created_at: new Date().toISOString() });
});

app.get("/api/candles", async (c) => {
  const limit = Math.min(parseInt(c.req.query("limit") || "200", 10), 500);
  const rows = await c.env.DB.prepare(
    "SELECT id, name, intention, created_at FROM candles ORDER BY created_at DESC LIMIT ?"
  )
    .bind(limit)
    .all();
  const count = await c.env.DB.prepare("SELECT COUNT(*) as n FROM candles").first<{ n: number }>();
  return c.json({ total: count?.n ?? 0, candles: rows.results || [] });
});

app.delete("/api/admin/candles/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ detail: "Unauthorized" }, 401);
  await c.env.DB.prepare("DELETE FROM candles WHERE id = ?").bind(c.req.param("id")).run();
  return c.json({ ok: true });
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
