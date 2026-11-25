import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

/**
 * Single shared password (ADMIN_PASSWORD). The session cookie is "<expiry>.<hmac>", signed with a
 * key derived from the password, so changing the password signs everyone out.
 */
const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function key() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD is not set.");
  return createHash("sha256").update(`admin-session\0${password}`).digest();
}

const sign = (value: string) => createHmac("sha256", key()).update(value).digest("base64url");

function safeEqual(a: string, b: string) {
  // Hash first so both buffers have the same length and the compare leaks nothing about length.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string) {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password) && safeEqual(input, password!);
}

export async function startSession() {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  const value = `${expires}.${sign(String(expires))}`;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value || !process.env.ADMIN_PASSWORD) return false;
  const [expires, mac] = value.split(".");
  if (!expires || !mac || !safeEqual(mac, sign(expires))) return false;
  await connection(); // the expiry check reads the clock, so it must run at request time
  return Number(expires) > Date.now() / 1000;
}

/** Call at the top of every admin page and Server Action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
