import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';

// NOTE: these limiters key by req.ip by default. If this server is ever run
// behind a reverse proxy (nginx, a load balancer, etc.), Express's `req.ip`
// only reflects the proxy's own address unless `app.set('trust proxy', ...)`
// is configured with the correct hop count — and setting that carelessly
// (e.g. blindly trusting X-Forwarded-For) lets a client spoof its own IP and
// bypass these limits entirely. Left unset here since this app currently
// runs directly; only enable it, deliberately, once the real deployment
// topology is known.

const rateLimitHandler = (_req: Request, res: Response) => {
  ApiResponse.error(res, 'Too many requests. Please try again later.', 429);
};

const baseOptions = {
  standardHeaders: true as const,
  legacyHeaders: false,
  handler: rateLimitHandler,
};

/** Brute-force guard on login: 10 attempts per 15 minutes per IP. */
export const signinLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
});

/** Slows down mass account creation: 10 signups per hour per IP. */
export const signupLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000,
  limit: 10,
});

/** Stops using this endpoint to spam a victim's inbox: 5 per hour per IP. */
export const forgotPasswordLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000,
  limit: 5,
});

/**
 * Content create/update can each trigger a server-side fetch of a
 * user-supplied URL (link previews) — without a limit here, an authenticated
 * user could spam this to use the server as an anonymous outbound HTTP proxy.
 * Keyed by user id (not IP) since these routes require auth: 60 writes per
 * 15 minutes per account.
 */
export const contentWriteLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 60,
  keyGenerator: (req: Request) => req.user?.id ?? ipKeyGenerator(req.ip ?? 'unknown'),
});
