export async function createSignature(
  payload: {
    [key: string]: unknown;
  },
  secretKey: string,
  nonce: string,
  timestamp: number
) {
  // Extend payload with required fields
  const updatedPayload = { ...payload, timestamp, nonce };

  // Convert payload to Base64
  const payloadString = btoa(JSON.stringify(updatedPayload));

  // Encode secret key
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  // Sign payload
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payloadString)
  );

  // Convert ArrayBuffer → hex string
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
