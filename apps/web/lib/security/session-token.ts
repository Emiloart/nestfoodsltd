import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_VERSION = "v1";
const DEV_SESSION_SECRET = "nestfoodsltd-dev-session-secret";

type SessionTokenPayloadBase = {
  type: string;
  sub: string;
  role?: string;
  iat: number;
  exp: number;
  nonce: string;
};

function getSessionSecret() {
  return process.env.AUTH_SECRET?.trim() || DEV_SESSION_SECRET;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function secureEquals(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  return timingSafeEqual(aBuffer, bBuffer);
}

export function createSignedSessionToken(
  input: { type: string; sub: string; role?: string },
  options?: { ttlSeconds?: number },
) {
  const now = Math.floor(Date.now() / 1000);
  const ttlSeconds = options?.ttlSeconds ?? 60 * 60 * 8;
  const payload: SessionTokenPayloadBase = {
    type: input.type,
    sub: input.sub,
    role: input.role,
    iat: now,
    exp: now + ttlSeconds,
    nonce: crypto.randomUUID(),
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signatureInput = `${TOKEN_VERSION}.${encodedPayload}`;
  const signature = sign(signatureInput);
  return `${TOKEN_VERSION}.${encodedPayload}.${signature}`;
}

function isSessionTokenPayload(value: unknown): value is SessionTokenPayloadBase {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.type === "string" &&
    typeof payload.sub === "string" &&
    typeof payload.iat === "number" &&
    typeof payload.exp === "number" &&
    typeof payload.nonce === "string"
  );
}

export function verifySignedSessionToken(
  token?: string | null,
  expectedType?: string,
): SessionTokenPayloadBase | null {
  if (!token?.trim()) {
    return null;
  }

  const [version, encodedPayload, signature] = token.trim().split(".");
  if (!version || !encodedPayload || !signature) {
    return null;
  }
  if (version !== TOKEN_VERSION) {
    return null;
  }

  const expectedSignature = sign(`${version}.${encodedPayload}`);
  if (!secureEquals(signature, expectedSignature)) {
    return null;
  }

  let parsedPayload: unknown;
  try {
    parsedPayload = JSON.parse(fromBase64Url(encodedPayload));
  } catch {
    return null;
  }

  if (!isSessionTokenPayload(parsedPayload)) {
    return null;
  }
  if (expectedType && parsedPayload.type !== expectedType) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (parsedPayload.exp <= now) {
    return null;
  }

  return parsedPayload;
}
