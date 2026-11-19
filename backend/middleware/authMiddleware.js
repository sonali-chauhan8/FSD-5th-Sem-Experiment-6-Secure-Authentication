const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Validates the JWT stored in HttpOnly cookie (or Bearer header)
 * Attaches the authenticated user document to req.user (excluding password)
 */
const verifyToken = async (req, res, next) => {
  try {
    let token = null;

    // 1. Primary storage: HttpOnly cookie 'token'
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Secondary fallback: Authorization Header 'Bearer <token>'
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided. Please log in.',
      });
    }

    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB, excluding password hash
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. User no longer exists.',
      });
    }

    // Attach user payload to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token. Please log in again.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication token verification.',
    });
  }
};

module.exports = { verifyToken };
