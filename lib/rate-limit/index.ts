import "server-only";

/**
 * Rate limiter in-memory simples — sliding window.
 *
 * Limitações:
 *  - Só funciona em single-instance (cada Vercel function tem seu Map).
 *    Pra produção horizontal, migrar pra @upstash/ratelimit (Redis).
 *  - O contador zera no cold start.
 *
 * Suficiente pra:
 *  - bloquear bruteforce simples no /login
 *  - prevenir spam no /api/leads
 *
 * API:
 *   const { ok, remaining, retryAfterSeconds } = await rateLimit({
 *     key: `login:${ip}`, limit: 5, windowSeconds: 60,
 *   });
 */

type Bucket = { hits: number[] }; // timestamps em ms

const globalBuckets = globalThis as unknown as {
  _ecRateLimitBuckets?: Map<string, Bucket>;
};

function buckets(): Map<string, Bucket> {
  if (!globalBuckets._ecRateLimitBuckets) {
    globalBuckets._ecRateLimitBuckets = new Map();
  }
  return globalBuckets._ecRateLimitBuckets;
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export async function rateLimit({
  key,
  limit,
  windowSeconds,
}: {
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  const map = buckets();
  let bucket = map.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    map.set(key, bucket);
  }

  // descarta hits fora da janela
  bucket.hits = bucket.hits.filter((t) => t > windowStart);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    const retryAfterMs = Math.max(0, oldest + windowSeconds * 1000 - now);
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  bucket.hits.push(now);
  return {
    ok: true,
    remaining: limit - bucket.hits.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Limpa buckets velhos pra não vazar memória ao longo do tempo.
 * Chame ocasionalmente; não é crítico (nodejs gc cuida em última instância).
 */
export function rateLimitGc(maxAgeMs = 60 * 60 * 1000) {
  const now = Date.now();
  const map = buckets();
  for (const [key, bucket] of map.entries()) {
    const last = bucket.hits[bucket.hits.length - 1];
    if (!last || now - last > maxAgeMs) map.delete(key);
  }
}

/**
 * Pega IP do header (Vercel/Cloudflare/proxy chain) com fallback.
 * Em dev local todos veem 127.0.0.1 — então em dev rate-limit é meio
 * inútil. Em prod, x-forwarded-for vai ter o IP real.
 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
