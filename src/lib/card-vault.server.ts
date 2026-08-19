/**
 * AES-256-GCM encryption for vaulted card details.
 * The key comes from CARD_VAULT_KEY and is read per call (Workers inject env per request).
 */

function toBytes(s: string) {
  return new TextEncoder().encode(s);
}

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

async function getKey() {
  const raw = process.env["CARD_VAULT_KEY"];
  if (!raw) throw new Error("CARD_VAULT_KEY is not configured.");
  // Normalise any key length into 256 bits.
  const digest = await crypto.subtle.digest("SHA-256", toBytes(raw));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptSecret(plaintext: string): Promise<{ ciphertext: string; iv: string }> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, toBytes(plaintext));
  return { ciphertext: b64(new Uint8Array(encrypted)), iv: b64(iv) };
}

export async function decryptSecret(ciphertext: string, iv: string): Promise<string> {
  const key = await getKey();
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: unb64(iv) },
    key,
    unb64(ciphertext),
  );
  return new TextDecoder().decode(plain);
}
