import rateLimit from 'express-rate-limit';

import { getMinutesDifference } from '../utils/date.utils.js';

const handler = (req, res) =>
  res.status(429).json({
    error: 'Rate limit exceeded',
    message:
      'You have made too many requests. Please wait a moment and try again.',
    retryAfter: req.rateLimit.resetTime, // Provides the time when the limit resets
    retryTimeInMinutes: getMinutesDifference(
      new Date(),
      req.rateLimit.resetTime
    ),
  });

const loginLimiter = rateLimit({
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

const apiLimiter = rateLimit({
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

export { loginLimiter, apiLimiter };
