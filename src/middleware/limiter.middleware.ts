import rateLimit from 'express-rate-limit';

import { getMinutesDifference, msToTime} from '../utils/date.utils.ts';

// # Rate Limiting
// COMMON_RATE_LIMIT_WINDOW_MS="1000"  # Window size for rate limiting (ms)
// COMMON_RATE_LIMIT_MAX_REQUESTS="20" # Max number of requests per window per IP

const handler = async (req, res) =>
  // const { limit, current, remaining, resetTime } = req.rateLimit;
  res.status(429).json({
    error: 'Rate limit exceeded',
    message:
      'You have made too many requests. Please wait a moment and try again.',
    retryAfter: req.rateLimit.resetTime, // Provides the time when the limit resets
    // retryTimeInMinutes: getMinutesDifference(
    //   new Date(),
    //   req.rateLimit.resetTime
    // ),
    retryTime: msToTime(req.rateLimit.resetTime),
    remaining: req.rateLimit.remaining, //requests
    current: req.rateLimit.current,
    limit: req.rateLimit.limit,
  });

export const loginLimiter = rateLimit({
  limit: 20, // Max number of requests per window per IP
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 failed login attempts per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // message:'Too many failed login attempts from this IP, please try again after 15 minutes.',
  handler: handler,
  // keyGenerator: function (req, res) {
  //   return req.ip;
  // },
  // onLimitReached: function (req, res, optionsUsed) {},
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler,
  // keyGenerator: function (req, res) {
  //   return req.ip;
  // },
  // onLimitReached: function (req, res, optionsUsed) {},
});

export const inboxLimiter = rateLimit({
  windowMs: 24 * 3600000, // 24 hours
  max: 2, // Max 2 requests per 24 hours per IP
  statusCode: 429, // HTTP status code for "Too Many Requests"
  headers: true, // Enable X-RateLimit-* headers
  handler: handler
});
