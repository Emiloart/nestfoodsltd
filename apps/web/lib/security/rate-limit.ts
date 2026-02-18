import { NextResponse } from "next/server";

type RateLimitBucketState = {
  count: number;
  windowResetAt: number;
  blockedUntil?: number;
  lastSeenAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
};

const MAX_BUCKET_COUNT = 10_000;

function getStore() {
  const globalObject = globalThis as typeof globalThis & {
    __nestfoodsltdRateLimitStore?: Map<string, RateLimitBucketState>;
  };
  if (!globalObject.__nestfoodsltdRateLimitStore) {
    globalObject.__nestfoodsltdRateLimitStore = new Map<string, RateLimitBucketState>();
  }
  return globalObject.__nestfoodsltdRateLimitStore;
}

function cleanupExpiredBuckets(now: number) {
  const store = getStore();
  if (store.size <= MAX_BUCKET_COUNT) {
    return;
  }

  for (const [key, value] of store) {
    if (value.windowResetAt < now && (!value.blockedUntil || value.blockedUntil < now)) {
      store.delete(key);
    }
  }
}

export function evaluateRateLimit(input: {
  bucket: string;
  identifier: string;
  windowMs: number;
  max: number;
  blockDurationMs?: number;
}): RateLimitResult {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const store = getStore();
  const key = `${input.bucket}:${input.identifier}`;
  const existing = store.get(key);

  let state: RateLimitBucketState;
  if (!existing || existing.windowResetAt <= now) {
    state = {
      count: 0,
      windowResetAt: now + input.windowMs,
      blockedUntil: undefined,
      lastSeenAt: now,
    };
  } else {
    state = existing;
  }

  if (state.blockedUntil && state.blockedUntil > now) {
    const retryAfterMs = Math.max(1, state.blockedUntil - now);
    store.set(key, {
      ...state,
      lastSeenAt: now,
    });
    return {
      allowed: false,
      limit: input.max,
      remaining: 0,
      resetAt: state.windowResetAt,
      retryAfterMs,
    };
  }

  state.count += 1;
  state.lastSeenAt = now;

  const allowed = state.count <= input.max;
  if (!allowed) {
    if (input.blockDurationMs && input.blockDurationMs > 0) {
      state.blockedUntil = now + input.blockDurationMs;
    }
    store.set(key, state);
    const retryAt =
      state.blockedUntil && state.blockedUntil > now ? state.blockedUntil : state.windowResetAt;
    return {
      allowed: false,
      limit: input.max,
      remaining: 0,
      resetAt: state.windowResetAt,
      retryAfterMs: Math.max(1, retryAt - now),
    };
  }

  store.set(key, state);
  return {
    allowed: true,
    limit: input.max,
    remaining: Math.max(0, input.max - state.count),
    resetAt: state.windowResetAt,
    retryAfterMs: 0,
  };
}

export function applyRateLimitHeaders(response: NextResponse, result: RateLimitResult) {
  response.headers.set("x-ratelimit-limit", String(result.limit));
  response.headers.set("x-ratelimit-remaining", String(result.remaining));
  response.headers.set("x-ratelimit-reset", String(result.resetAt));
  if (!result.allowed && result.retryAfterMs > 0) {
    response.headers.set("retry-after", String(Math.ceil(result.retryAfterMs / 1000)));
  }
}

export function createRateLimitErrorResponse(
  result: RateLimitResult,
  message = "Too many requests.",
) {
  const response = NextResponse.json(
    {
      error: message,
      retryAfterSeconds: Math.ceil(result.retryAfterMs / 1000),
    },
    { status: 429 },
  );
  applyRateLimitHeaders(response, result);
  return response;
}
