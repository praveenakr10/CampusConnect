/**
 * Simple in-memory fixed-window rate limiter.
 *
 * This is deliberately dependency-free so the project runs with zero
 * external services. For production/multi-instance deployments, swap
 * the `store` Map below for Redis (e.g. Upstash) so counters are shared
 * across server instances — the windowing logic itself stays the same.
 */

const store = new Map(); // key -> { count, windowStart }

function makeRateLimiter({ windowMs, max, keyPrefix, message }) {
  return (req, res, next) => {
    const identity = req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
    const key = `${keyPrefix}:${identity}`;
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
      store.set(key, { count: 1, windowStart: now });
      return next();
    }

    if (entry.count >= max) {
      const retryAfterSec = Math.ceil((entry.windowStart + windowMs - now) / 1000);
      res.setHeader("Retry-After", retryAfterSec);
      return res.status(429).json({
        error: message || "Too many requests. Please slow down.",
        retryAfterSeconds: retryAfterSec,
      });
    }

    entry.count += 1;
    next();
  };
}

// General API traffic: generous limit, protects against abuse/scraping.
const generalLimiter = makeRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  keyPrefix: "general",
  message: "Too many requests. Please try again in a few minutes.",
});

// AI Question Improver: costs a real LLM call, so it's tightly limited per user.
const aiImproverLimiter = makeRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyPrefix: "ai-improve",
  message: "You've hit the AI Question Improver limit (5/hour). Try again later.",
});

// Auth endpoints: slow down brute-force login/signup attempts.
const authLimiter = makeRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyPrefix: "auth",
  message: "Too many auth attempts. Please wait before trying again.",
});

// Periodically clear stale entries so the Map doesn't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > 60 * 60 * 1000) store.delete(key);
  }
}, 30 * 60 * 1000).unref();

module.exports = { generalLimiter, aiImproverLimiter, authLimiter, makeRateLimiter };
