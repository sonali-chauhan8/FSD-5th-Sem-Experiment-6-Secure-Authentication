# B.Tech 5th Semester Full Stack Development Lab
## Experiment 6: Secure User Authentication System Using Password Hashing and JWT

---

### Aim
To design, develop, and evaluate a secure full-stack user authentication and authorization system implementing client and server-side validation, salted password hashing with **bcryptjs**, and stateless session management with **JSON Web Tokens (JWT)** secured via **HttpOnly cookies**.

---

### 1. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 (Vite) | Single Page Application (SPA), state management, dynamic UI |
| **Styling** | Modern CSS3 | Responsive glassmorphism UI, gradient background, mobile adaptation |
| **Backend** | Node.js & Express.js | RESTful API server, routing, security middlewares, controllers |
| **Database** | MongoDB with Mongoose | NoSQL document database, data schema, unique constraints |
| **Password Hashing** | `bcryptjs` | Salt generation (10 rounds) and one-way cryptographic hashing |
| **Authentication** | `jsonwebtoken` | Stateless authentication tokens signed with HS256 secret |
| **Cookie Handling** | `cookie-parser` | Extraction and serialization of secure HttpOnly cookies |
| **Security & Defense** | `express-rate-limit`, CORS | Brute-force throttling, strict CORS origin whitelisting, anti-CSRF |
| **API Client** | Axios | HTTP client configured with `withCredentials: true` |
| **Environment** | `dotenv` | Secure isolation of database credentials and JWT secrets |

---

### 2. Key Features

- **Robust Form Validation**: Client-side feedback and backend schema-level validation for names, valid email formats, and matching passwords.
- **Enforced Password Complexity**: Strong password policy requiring $\ge 8$ characters, at least one uppercase letter, one lowercase letter, one digit, and one special symbol.
- **Dynamic Password Strength Meter**: Live visual strength indicator with color changes and criteria checklist.
- **Show / Hide Password Toggle**: User-friendly eye toggle for password and confirmation fields.
- **Zero Plain-Text Password Storage**: Passwords are cryptographically salted and hashed using `bcryptjs` with 10 salt rounds before database insertion.
- **Duplicate Account Prevention**: Unique MongoDB indexing and clean HTTP 409 conflict responses.
- **Timing & Enumeration Attack Defense**: Generic error messages (`"Invalid email or password"`) for login failures to avoid exposing whether an email exists.
- **HttpOnly Cookie Storage**: JWTs are sent and stored strictly in **HttpOnly, SameSite=Lax** cookies, rendering them inaccessible to malicious JavaScript and defeating Cross-Site Scripting (XSS) token theft.
- **Protected Dashboard**: Secured backend route (`GET /api/auth/me`) guarded by JWT verification middleware (`verifyToken`).
- **Graceful Logout**: Dedicated endpoint (`POST /api/auth/logout`) that immediately clears authentication cookies.
- **Automated Verification Suite**: Built-in 9-scenario integration test runner verifying all functional and security requirements.

---

### 3. Project Directory Structure

```text
experiment-6-secure-authentication/
├── .env.example                       # Root environment variable template
├── .gitignore                          # Git ignore specification (ignoring .env and node_modules)
├── README.md                           # Comprehensive lab documentation & manual
├── backend/
│   ├── .env                            # Backend environment configuration (git ignored)
│   ├── .env.example                    # Backend environment template
│   ├── package.json                    # Backend dependencies and scripts
│   ├── server.js                       # Express server initialization, middlewares, and CORS
│   ├── config/
│   │   └── db.js                       # Mongoose MongoDB connection handler
│   ├── controllers/
│   │   └── authController.js           # Business logic: register, login, me, logout
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT verification and route protection middleware
│   │   └── errorMiddleware.js          # Centralized error handler (duplicate keys, validation)
│   ├── models/
│   │   └── User.js                     # Mongoose User schema with safe JSON serialization
│   ├── routes/
│   │   └── authRoutes.js               # REST routes with rate limiting attached
│   └── test/
│       ├── run-tests.js                # Test orchestrator (starts local mongod if needed)
│       └── test-suite.js               # Complete 9-scenario automated test runner
└── frontend/
    ├── index.html                      # Single page HTML entry point
    ├── package.json                    # Frontend dependencies and Vite configuration
    ├── vite.config.js                  # Vite server config with API proxy support
    └── src/
        ├── App.jsx                     # Root application component and view routing
        ├── index.css                   # Modern CSS styling (gradient, cards, responsiveness)
        ├── main.jsx                    # React DOM entry point
        ├── components/
        │   ├── Dashboard.jsx           # Protected user dashboard view
        │   ├── Login.jsx               # User login card with show/hide password
        │   ├── Navbar.jsx              # Navigation bar with dynamic auth status
        │   ├── ProtectedRoute.jsx      # Client-side route guard component
        │   └── Register.jsx            # User registration card with strength meter
        ├── context/
        │   └── AuthContext.jsx         # Global authentication state and methods
        └── services/
            └── api.js                  # Axios instance with withCredentials: true
```

---

### 4. Installation and Setup Instructions

#### Prerequisites
- **Node.js** (v18.x or higher) installed (`node -v`)
- **npm** (v9.x or higher) installed (`npm -v`)
- **MongoDB** running locally on port 27017 or a free cloud cluster from [MongoDB Atlas](https://www.mongodb.com/atlas)

#### Step 1: Clone or Navigate to the Project
```bash
cd experiment-6-secure-authentication
```

#### Step 2: Configure Environment Variables
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```
Inside `backend/.env`, verify or customize the values:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/secure_auth_db
JWT_SECRET=btech_cse_exp6_secure_jwt_token_secret_key_384918239012
JWT_EXPIRE=1h
CLIENT_URL=http://localhost:5173
```

> **Using MongoDB Atlas?**
> Replace `MONGO_URI` with your connection string:
> `mongodb+srv://<username>:<password>@cluster0.mongodb.net/secure_auth_db?retryWrites=true&w=majority`

#### Step 3: Install Backend Dependencies
```bash
cd backend
npm install
```

#### Step 4: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

### 5. Running the Application

#### Option A: Running Backend and Frontend Simultaneously

1. **Terminal 1: Start Backend Server**
   ```bash
   cd backend
   npm start
   ```
   *Expected output:*
   ```text
   ===============================================
    Authentication Server running in development mode
    Listening on port: 5000
    Accessible at: http://localhost:5000
    Client URL: http://localhost:5173
   ===============================================
   [MongoDB Connected]: 127.0.0.1 / Database: secure_auth_db
   ```

2. **Terminal 2: Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   *Expected output:*
   ```text
     VITE v5.4.11  ready in 240 ms

     ➜  Local:   http://localhost:5173/
     ➜  Network: use --host to expose
   ```

3. **Open Browser:** Navigate to `http://localhost:5173` to interact with the application.

---

### 6. Backend API Reference

| Endpoint | Method | Access | Description | Request Body | Headers | Response Codes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register new user account | `{ name, email, password, confirmPassword }` | `Content-Type: application/json` | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `/api/auth/login` | `POST` | Public | Authenticate user & set JWT cookie | `{ email, password }` | `Content-Type: application/json` | `200 OK`, `400 Bad Request`, `401 Unauthorized` |
| `/api/auth/me` | `GET` | Protected | Fetch authenticated profile | *None* | `Cookie: token=<jwt>` or `Authorization: Bearer <jwt>` | `200 OK`, `401 Unauthorized` |
| `/api/auth/logout` | `POST` | Public | Clear JWT cookie | *None* | *None* | `200 OK` |
| `/api/health` | `GET` | Public | Server health probe | *None* | *None* | `200 OK` |

#### Sample Responses:

- **Registration Success (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Registration successful! You can now log in with your credentials.",
    "user": {
      "id": "6aff83bc5d59ae07b50cb605",
      "name": "Anmol Sharma",
      "email": "anmol@university.edu",
      "createdAt": "2026-11-20T04:45:00.000Z"
    }
  }
  ```

- **Login Success with Set-Cookie (`200 OK`):**
  ```http
  HTTP/1.1 200 OK
  Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; SameSite=Lax
  Content-Type: application/json

  {
    "success": true,
    "message": "Login successful! Welcome back.",
    "user": {
      "id": "6aff83bc5d59ae07b50cb605",
      "name": "Anmol Sharma",
      "email": "anmol@university.edu",
      "createdAt": "2026-11-20T04:45:00.000Z"
    }
  }
  ```

- **Protected Profile (`GET /api/auth/me` -> `200 OK`):**
  ```json
  {
    "success": true,
    "message": "User authenticated successfully.",
    "user": {
      "_id": "6aff83bc5d59ae07b50cb605",
      "name": "Anmol Sharma",
      "email": "anmol@university.edu",
      "createdAt": "2026-11-20T04:45:00.000Z",
      "updatedAt": "2026-11-20T04:45:00.000Z"
    }
  }
  ```

- **Unauthorized Access (`401 Unauthorized`):**
  ```json
  {
    "success": false,
    "message": "Access denied. No authentication token provided. Please log in."
  }
  ```

---

### 7. Automated Test Suite Execution

The repository includes a self-contained automated integration test suite that tests all 9 experiment requirements:

```bash
cd backend
npm test
```

#### Test Execution Report:
```text
====================================================================
  STARTING LAB EXPERIMENT 6 AUTOMATED VERIFICATION SUITE
====================================================================

[MongoDB Connected]: 127.0.0.1 / Database: secure_auth_db

[TEST 1] Testing Successful User Registration...
  -> Status: 201
  -> Response Message: Registration successful! You can now log in with your credentials.
  -> User Registered: {"id":"6aff83bc5d59ae07b50cb605","name":"Test Student","email":"teststudent@university.edu"}
  -> Result: PASSED ✓

[DB CHECK] Inspecting Stored MongoDB Document for User...
  -> Stored Password in DB: $2b$10$9guzXbXuD0OPBNG4.ekYY.A5cuiUn7jazvGZnmo28DuEBfkgDhQoG
  -> Salt/Hash Format Verified ($2b$): YES ✓
  -> Plain-Text Stored: NO (Secure) ✓

[TEST 2] Testing Duplicate Email Registration Prevention...
  -> Status: 409
  -> Response Message: An account with this email address already exists. Please log in.
  -> Result: PASSED ✓

[TEST 3] Testing Weak Password Rejection...
  -> Status: 400
  -> Error Message: Password must be at least 8 characters long.
  -> Result: PASSED ✓

[TEST 4] Testing Successful Login with Valid Credentials...
  -> Status: 200
  -> Response: {"success":true,"message":"Login successful! Welcome back."}
  -> Result: PASSED ✓

[TEST 5] Testing Failed Login with Incorrect Credentials (Generic Error)...
  -> Status: 401
  -> Generic Error Message: "Invalid email or password. Please check your credentials."
  -> Result: PASSED ✓

[TEST 6] Testing JWT Generation and HttpOnly Cookie Security Flags...
  -> Set-Cookie Header: token=eyJhbGciOiJIUzI1NiI...[REDACTED]...
  -> HttpOnly Flag Present: YES ✓
  -> SameSite Flag Present: YES ✓
  -> Result: PASSED ✓

[TEST 7] Testing Access to Protected Route with Valid JWT Cookie...
  -> Status: 200
  -> Authenticated User Data: {"_id":"6aff83bc5d59ae07b50cb605","name":"Test Student","email":"teststudent@university.edu"}
  -> Result: PASSED ✓

[TEST 8] Testing Blocking Unauthorized Access to Protected Route...
  -> Status: 401
  -> Unauthorized Rejection Message: "Access denied. No authentication token provided. Please log in."
  -> Result: PASSED ✓

[TEST 9] Testing Successful Logout Endpoint...
  -> Status: 200
  -> Logout Message: "Logged out successfully. Authentication cookie has been cleared."
  -> Invalidation Cookie Header: token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax
  -> Result: PASSED ✓

====================================================================
                  FINAL LAB TEST SUMMARY
====================================================================
  [PASS] 1. Successful User Registration
  [PASS] 2. Duplicate Email Registration Prevention
  [PASS] 3. Weak Password Rejection
  [PASS] 4. Successful Login with Valid Credentials
  [PASS] 5. Failed Login with Generic Error
  [PASS] 6. JWT Generation & Secure Cookie
  [PASS] 7. Accessing Protected Dashboard Route
  [PASS] 8. Blocking Unauthorized Access
  [PASS] 9. Successful Logout & Cookie Clearing
====================================================================
  Total: 9 | Passed: 9 | Failed: 0
  OVERALL VERIFICATION: ALL TESTS PASSED SUCCESSFULLY! ✓
====================================================================
```

---

### 8. Security Architecture & Mechanism Deep Dive

#### A. Password Hashing with Salt (`bcryptjs`)
- **One-Way Cryptographic Function**: Bcrypt is an adaptive hash function based on the Blowfish cipher. It is strictly one-way; hashes cannot be decrypted back into plain-text.
- **Salt Generation**: A random string of cryptographic salt (10 rounds = $2^{10} = 1024$ key expansion iterations) is prepended to the password before hashing.
  $$\text{Hash} = \text{bcrypt}(\text{Password}, \text{Salt})$$
- **Rainbow Table Mitigation**: Even if two users register with the identical password (e.g. `Secret@123`), their stored hashes in MongoDB will be completely different because each receives a unique, random salt.
- **Brute-Force Resistance**: The computational work factor makes brute-force dictionary attacks practically infeasible.

#### B. Stateless Authentication with JSON Web Tokens (JWT)
A JWT consists of three Base64URL-encoded components separated by dots:
$$\text{Header}.\text{Payload}.\text{Signature}$$
1. **Header**: Contains the signing algorithm (`HS256`) and token type (`JWT`).
2. **Payload (Claims)**: Contains non-sensitive claims (`{ id: user._id, email: user.email, exp, iat }`). Sensitive data like password hashes are strictly omitted.
3. **Cryptographic Signature**:
   $$\text{Signature} = \text{HMACSHA256}(\text{Base64Url}(\text{Header}) + "." + \text{Base64Url}(\text{Payload}), \text{JWT\_SECRET})$$
   The server verifies the signature on every protected request without requiring a database session table, making authentication stateless and highly scalable.

#### C. HttpOnly Cookies vs. localStorage (XSS Immunity)
| Criterion | `localStorage` | `HttpOnly Cookie` (Implemented) |
| :--- | :--- | :--- |
| **JavaScript Accessibility** | Accessible via `window.localStorage` | **Inaccessible to JavaScript (`document.cookie` cannot read it)** |
| **XSS Vulnerability** | **High** — Any injected script can steal tokens | **Immune** — Injected scripts cannot read the cookie |
| **Transmission** | Must be manually attached by client script | Automatically sent by browser with credentials |
| **CSRF Consideration** | Not susceptible to standard CSRF | Mitigated using `SameSite=Lax`, CORS origin limits & custom headers |

---

### 9. Word Practical File Screenshot Checklist

Capture the following 12 screenshots for your final laboratory report:

| # | Screenshot Title | Where & When to Capture | What Must Be Visible |
| :---: | :--- | :--- | :--- |
| **1** | **Project Folder Structure** | VS Code / File Explorer | The tree showing `backend/`, `frontend/`, `.env.example`, `.gitignore`, `README.md`. |
| **2** | **Registration Page** | Browser (`http://localhost:5173`) | The registration card with Full Name, Email, Password, Confirm Password, and the Password Strength Meter. |
| **3** | **Successful Registration** | Browser | Green alert notification: *"Registration successful! Redirecting to login..."*. |
| **4** | **MongoDB User Record** | MongoDB Compass or Shell | The saved user document showing `_id`, `name`, `email`, and the `password` starting with `$2b$10$...` (confirming plain-text is never stored). |
| **5** | **Login Page** | Browser (`http://localhost:5173`) | Clean login card with email & password fields and the show/hide password toggle. |
| **6** | **Successful Login** | Browser | Green success alert: *"Login successful! Redirecting to dashboard..."*. |
| **7** | **Protected Dashboard** | Browser | Dashboard rendering *"Welcome, [User Name]!"*, registered email, and the green *"Authenticated (JWT in HttpOnly Cookie)"* badge. |
| **8** | **JWT Authentication Cookie** | Browser DevTools (F12) &rarr; **Application** &rarr; **Cookies** | The cookie named `token`, with the **HttpOnly** column checked and **SameSite=Lax**. *(Redact full token value for security).* |
| **9** | **Invalid Login Error** | Browser | Red alert banner displaying generic error: *"Invalid email or password. Please check your credentials."*. |
| **10** | **Logout Functionality** | Browser DevTools &rarr; Console/Cookies | Clicking *"Log Out"*, redirecting to login, and observing that the `token` cookie was deleted/cleared. |
| **11** | **Backend Server Running** | Terminal | Terminal showing `Authentication Server running on port 5000` and `[MongoDB Connected]: 127.0.0.1 / Database: secure_auth_db`. |
| **12** | **Automated Test Report / GitHub** | Terminal (`npm test`) or GitHub Web UI | The automated test suite summary showing all 9 test scenarios marked **[PASS]** and the repository page. |

---

### 10. Conclusion

In this experiment, a secure, production-standard user authentication system was successfully designed and verified. Passwords are never stored in cleartext; rather, they are salted and hashed using `bcryptjs` with 10 salt rounds to defend against rainbow table and dictionary attacks. Session management was implemented using signed JSON Web Tokens (JWT) transmitted inside secure, `HttpOnly`, `SameSite=Lax` cookies, offering robust protection against client-side token theft (XSS) while eliminating the need for server-side session state storage. All functional and security requirements were validated through an automated integration test suite with a 100% pass rate.
