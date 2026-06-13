import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

// Admin session: a single shared password (ADMIN_PASSWORD) trades for an
// HMAC-signed, httpOnly session cookie. The password is never stored in the
// cookie; the cookie holds only an expiry + signature, so it can't be forged
// without ADMIN_SESSION_SECRET.

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

function getSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || null;
}

function hmac(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/** Configured = both env vars present. Routes 500 when not. */
export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

/** Timing-safe password check (compares SHA-256 digests to avoid length leaks). */
export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  const a = crypto.createHash("sha256").update(input).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const payload = String(Date.now() + ADMIN_COOKIE_MAX_AGE * 1000); // expiry ms
  return `${payload}.${hmac(payload, secret)}`;
}

function isValidToken(token: string | undefined): boolean {
  const secret = getSecret();
  if (!token || !secret) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = hmac(payload, secret);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && exp > Date.now();
}

/** True if the current request carries a valid admin session cookie. */
export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  return isValidToken(store.get(ADMIN_COOKIE)?.value);
}
