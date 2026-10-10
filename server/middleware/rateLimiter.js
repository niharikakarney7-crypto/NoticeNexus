/**
 * NoticeNexus — Rate Limiter Middleware
 * Protects authentication endpoints against brute-force password guessing.
 */

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Max 10 attempts per IP per window
  standardHeaders: true, // Return standard RateLimit headers
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

module.exports = {
  loginLimiter
};
