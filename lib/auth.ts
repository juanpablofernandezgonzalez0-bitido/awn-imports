import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "awn_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "awnadmin2026";

export function verifyPassword(password: string) {
  return password === ADMIN_PASSWORD;
}

function sign(value: string) {
  return crypto
    .createHmac("sha256", ADMIN_PASSWORD)
    .update(value)
    .digest("hex");
}

export async function createSession() {
  const ts = Date.now().toString();
  const value = `${ts}.${sign(ts)}`;
  const store = await cookies();
  store.set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function hasSession() {
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  if (!value) return false;
  const [ts, sig] = value.split(".");
  if (!ts || !sig) return false;
  if (Date.now() - Number(ts) > SESSION_TTL_MS) return false;
  return sign(ts) === sig;
}