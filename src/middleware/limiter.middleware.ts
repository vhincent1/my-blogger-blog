import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';

import { getMinutesDifference, msToTime, MsType, numberToMs } from '../utils/date.utils.ts';

// # Rate Limiting
// COMMON_RATE_LIMIT_WINDOW_MS="1000"  # Window size for rate limiting (ms)
// COMMON_RATE_LIMIT_MAX_REQUESTS="20" # Max number of requests per window per IP

// Configure the rate limiter
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per 15 minutes
//   message: 'Too many requests from this IP, please try again after 15 minutes',
//   handler: (req, res, next, options) => {
//     // Render an EJS template for the rate limit message
//     res.status(options.statusCode).render('rateLimitError', { message: options.message });
//   },
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });

const handler = async (req, res) =>
  // const { limit, current, remaining, resetTime } = req.rateLimit;

  // res.format({
  //   'text/html': function() {
  //     res.render('user-profile', { user: user, title: 'User Profile' });
  //   },
  //   'application/json': function() {
  //     res.json(user);
  //   },
  //   'default': function() {
  //     // log the request and respond with 406
  //     res.status(406).send('Not Acceptable');
  //   }
  // });

  res.status(StatusCodes.TOO_MANY_REQUESTS).json({
    error: 'Rate limit exceeded',
    message: 'You have made too many requests. Please wait a moment and try again.',
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
  windowMs: numberToMs(15, MsType.MINUTES), // 15 minutes
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
  windowMs: numberToMs(15, MsType.MINUTES), // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler,
  // keyGenerator: function (req, res) {
  //   return req.ip;
  // },
  // onLimitReached: function (req, res, optionsUsed) {},
});

export const uploadLimiter = rateLimit({
  // windowMs: numberToMs(24, MsType.HOURS), // 24 hours
  // max: 2, // Max 2 requests per 24 hours per IP
  windowMs: numberToMs(15, MsType.MINUTES), // 15 minutes
  max: 5, // Max 5 requests per 15 mins per IP
  statusCode: StatusCodes.TOO_MANY_REQUESTS, // HTTP status code for "Too Many Requests"
  headers: true, // Enable X-RateLimit-* headers
  // handler: handler,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  handler: (req, res, next, options) => {
    // Render an EJS template for the rate limit message
    res.status(options.statusCode).render('rateLimitError', { message: options.message });
  },
});

export const inboxLimiter = rateLimit({
  windowMs: numberToMs(1, MsType.HOURS), // 24 hours
  max: 2, // Max 2 requests per 24 hours per IP
  statusCode: StatusCodes.TOO_MANY_REQUESTS, // HTTP status code for "Too Many Requests"
  headers: true, // Enable X-RateLimit-* headers
  handler: handler,
});
