// Auth helpers — JWT + PBKDF2 password hashing using Web Crypto API
// All Workers-compatible (no node-only deps).

import { sign, verify } from "hono/jwt";

const ITERATIONS = 100_000;
const KEY_LEN = 32; // bytes
const SALT_LEN = 16; // bytes

function bufToB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function b64ToBuf(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveBits(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    baseKey,
    KEY_LEN * 8
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const hash = await deriveBits(password, salt);
  return `pbkdf2$${ITERATIONS}$${bufToB64(salt.buffer)}$${bufToB64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = parseInt(parts[1], 10);
  const salt = b64ToBuf(parts[2]);
  const expected = b64ToBuf(parts[3]);
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derived = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      baseKey,
      expected.length * 8
    )
  );
  if (derived.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < derived.length; i++) diff |= derived[i] ^ expected[i];
  return diff === 0;
}

export interface AdminTokenPayload {
  sub: string;       // admin id
  username: string;
  exp: number;
}

export async function signAdminToken(secret: string, adminId: string, username: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
  return sign({ sub: adminId, username, exp }, secret);
}

export async function verifyAdminToken(secret: string, token: string): Promise<AdminTokenPayload | null> {
  try {
    const payload = (await verify(token, secret, "HS256")) as unknown as AdminTokenPayload;
    return payload;
  } catch {
    return null;
  }
}
