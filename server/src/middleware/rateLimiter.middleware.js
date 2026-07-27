/**
 * Simple in-memory fixed-window rate limiter.
 *
 * This is deliberately dependency-free so the project runs with zero
 * external services. For production/multi-instance deployments, swap
 * the `store` Map below for Redis (e.g. Upstash) so counters are shared
 * across server instances — the windowing logic itself stays the same.
 */

const store = new Map(); // key -> { count, windowStart }
const failedLoginStore = new Map(); // email -> { count, windowStart }

function makeRateLimiter({ windowMs, max, keyPrefix, message, keyFn }) {
  return (req, res, next) => {
    const identity = keyFn
      ? keyFn(req)
      : req.user
        ? `user:${req.user.id}`
        : `ip:${req.ip}`;
    if (!identity) return next();

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

// Signup: slow down account-creation spam (IP-keyed).
const signupLimiter = makeRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyPrefix: "signup",
  message: "Too many signup attempts. Please wait before trying again.",
});

const LOGIN_FAIL_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_FAIL_MAX = 8;

function normalizeEmail(email) {
  return (email || "").toLowerCase().trim();
}

function getFailedLoginEntry(email) {
  const key = normalizeEmail(email);
  if (!key) return null;

  const now = Date.now();
  const entry = failedLoginStore.get(key);
  if (!entry || now - entry.windowStart > LOGIN_FAIL_WINDOW_MS) {
    failedLoginStore.set(key, { count: 0, windowStart: now });
    return failedLoginStore.get(key);
  }
  return entry;
}

function checkLoginEmailLockout(email) {
  const entry = getFailedLoginEntry(email);
  if (!entry || entry.count < LOGIN_FAIL_MAX) return null;

  const retryAfterSec = Math.ceil((entry.windowStart + LOGIN_FAIL_WINDOW_MS - Date.now()) / 1000);
  return {
    error: "Too many failed login attempts for this account. Please wait before trying again.",
    retryAfterSeconds: Math.max(retryAfterSec, 1),
  };
}

function recordFailedLogin(email) {
  const entry = getFailedLoginEntry(email);
  if (entry) entry.count += 1;
}

function clearFailedLogin(email) {
  failedLoginStore.delete(normalizeEmail(email));
}

const loginEmailLockout = (req, res, next) => {
  const lockout = checkLoginEmailLockout(req.body?.email);
  if (!lockout) return next();

  res.setHeader("Retry-After", lockout.retryAfterSeconds);
  return res.status(429).json(lockout);
};

// Periodically clear stale entries so the Maps don't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > 60 * 60 * 1000) store.delete(key);
  }
  for (const [key, entry] of failedLoginStore.entries()) {
    if (now - entry.windowStart > LOGIN_FAIL_WINDOW_MS) failedLoginStore.delete(key);
  }
}, 30 * 60 * 1000).unref();

module.exports = {
  generalLimiter,
  aiImproverLimiter,
  signupLimiter,
  loginEmailLockout,
  recordFailedLogin,
  clearFailedLogin,
  makeRateLimiter,
  // Backward-compatible alias (signup limiter).
  authLimiter: signupLimiter,
};
