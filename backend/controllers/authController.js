const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Helper function to validate password strength
 * Rules: At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
 */
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (password.length < minLength) {
    return 'Password must be at least 8 characters long.';
  }
  if (!hasUpperCase) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }
  if (!hasLowerCase) {
    return 'Password must contain at least one lowercase letter (a-z).';
  }
  if (!hasNumber) {
    return 'Password must contain at least one number (0-9).';
  }
  if (!hasSpecialChar) {
    return 'Password must contain at least one special character (!@#$%^&* etc.).';
  }
  return null;
};

/**
 * Helper function to generate JWT and set HttpOnly Cookie
 */
const sendTokenCookie = (res, user, statusCode, message) => {
  // Generate signed JWT with 1 hour expiration
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1h' }
  );

  const isProduction = process.env.NODE_ENV === 'production';

  // Cookie options
  const cookieOptions = {
    httpOnly: true, // Prevents client-side JavaScript access (XSS defense)
    secure: isProduction, // Transmitted only over HTTPS in production
    sameSite: isProduction ? 'none' : 'lax', // CSRF defense
    maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
  };

  // Set HttpOnly cookie
  res.cookie('token', token, cookieOptions);

  // Return clean response excluding password
  return res.status(statusCode).json({
    success: true,
    message,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Name, Email, Password, Confirm Password) are required.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      });
    }

    // 3. Check password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password do not match.',
      });
    }

    // 4. Validate password strength
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    // 5. Check if user with same email already exists (prevent duplicate registration)
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // 6. Hash password with bcryptjs (salt factor: 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 7. Store user with hashed password (plain-text password is never saved)
    const newUser = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in with your credentials.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & issue JWT in HttpOnly cookie
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Look up user by email in MongoDB
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      // Generic error message to prevent user enumeration attacks
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    // 3. Compare entered password with stored bcrypt hash
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      // Generic error message for security
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    // 4. Generate JWT and return in HttpOnly cookie
    return sendTokenCookie(res, user, 200, 'Login successful! Welcome back.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user details (Protected)
 * @route   GET /api/auth/me
 * @access  Private (Requires valid JWT)
 */
const getMe = async (req, res) => {
  // req.user was populated by verifyToken middleware (excludes password)
  return res.status(200).json({
    success: true,
    message: 'User authenticated successfully.',
    user: req.user,
  });
};

/**
 * @desc    Log out user by clearing the HttpOnly authentication cookie
 * @route   POST /api/auth/logout
 * @access  Public / Private
 */
const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully. Authentication cookie has been cleared.',
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
};
