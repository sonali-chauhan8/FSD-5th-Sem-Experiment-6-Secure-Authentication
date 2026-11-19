const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Rate limiter for authentication routes to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true, // Return standard rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit headers
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
});

// Stricter rate limiter specifically for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes before trying again.',
  },
});

// Route: User Registration
router.post('/register', authLimiter, registerUser);

// Route: User Login
router.post('/login', loginLimiter, loginUser);

// Route: Get Authenticated User (Protected)
router.get('/me', verifyToken, getMe);

// Route: Logout
router.post('/logout', logoutUser);

module.exports = router;
