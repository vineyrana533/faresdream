/**
 * Staff credential hashing (PBKDF2-SHA256 via WebCrypto — Worker compatible)
 * and role helpers for the admin console session.
 */

export type StaffRole = "agent" | "manager" | "superadmin";

const ITERATIONS = 120_000;

function b64(bytes: Uint8Array) {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function unb64(value: string) {
  const bin = atob(value);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function derive(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt);
  return { hash: b64(hash), salt: b64(salt) };
}

export function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyPassword(password: string, hash: string, salt: string) {
  try {
    const derived = await derive(password, unb64(salt));
    return timingSafeEqual(b64(derived), hash);
  } catch {
    return false;
  }
}

export const canVerify = (role: StaffRole) => role === "manager" || role === "superadmin";
export const canCapture = (role: StaffRole) => role === "manager" || role === "superadmin";
export const canReveal = (role: StaffRole) => role === "manager" || role === "superadmin";
export const canManageStaff = (role: StaffRole) => role === "superadmin";
