const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Allowed frontend client origin
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. CORS Configuration with credentials enabled for secure cookies
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true, // Allows browser to send cookies with requests
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 2. Request parsing middlewares
app.use(express.json({ limit: '10kb' })); // JSON body parser with size limit (DoS protection)
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies from request headers

// 3. Security Middleware: CSRF Protection for state-changing requests
// Verifies that cross-origin state-changing requests cannot forge actions
app.use((req, res, next) => {
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (stateChangingMethods.includes(req.method)) {
    const origin = req.headers.origin || req.headers.referer;
    // Allow local development tools (like Postman or curl where origin is undefined)
    // but enforce origin match when an Origin header is sent from browsers
    if (origin && !origin.startsWith(CLIENT_URL) && !origin.startsWith('http://localhost:')) {
      return res.status(403).json({
        success: false,
        message: 'CSRF Protection: Cross-origin state-changing request blocked.',
      });
    }
  }
  next();
});

// 4. API Routes
app.use('/api/auth', authRoutes);

// Root health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Secure Authentication API is up and running!',
    timestamp: new Date().toISOString(),
  });
});

// 5. Centralized Error Handler
app.use(errorHandler);

// Start server only when executed directly (not when required by tests)
const PORT = process.env.PORT || 5000;
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Authentication Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(` Listening on port: ${PORT}`);
    console.log(` Accessible at: http://localhost:${PORT}`);
    console.log(` Client URL: ${CLIENT_URL}`);
    console.log(`===============================================`);
  });
}

module.exports = { app, server };
