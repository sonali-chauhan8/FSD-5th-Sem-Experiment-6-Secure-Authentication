/**
 * ====================================================================
 * Lab Experiment 6: Comprehensive Automated Test Suite
 * Tests all 9 required scenarios:
 * 1. Successful user registration
 * 2. Duplicate email registration prevention
 * 3. Weak password rejection
 * 4. Successful login with valid credentials
 * 5. Failed login with invalid credentials (generic error)
 * 6. JWT generation and HttpOnly cookie inspection
 * 7. Protected route access with valid JWT (/api/auth/me)
 * 8. Unauthorized access blocking on protected route
 * 9. Successful logout and cookie invalidation
 * ====================================================================
 */

const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const { app } = require('../server');
const User = require('../models/User');

const TEST_PORT = 5001;
let serverInstance;
let storedAuthCookie = '';

// Helper function to make HTTP requests to the test server
function makeRequest({ method, path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const requestHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...headers,
    };

    if (body) {
      requestHeaders['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path,
        method,
        headers: requestHeaders,
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          let parsedData = {};
          try {
            parsedData = JSON.parse(responseBody);
          } catch (e) {
            parsedData = { raw: responseBody };
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData,
          });
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(dataString);
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('\n====================================================================');
  console.log('  STARTING LAB EXPERIMENT 6 AUTOMATED VERIFICATION SUITE');
  console.log('====================================================================\n');

  // Start test server on port 5001
  serverInstance = app.listen(TEST_PORT);
  await new Promise((r) => setTimeout(r, 600));

  // Clean up any previous test user data in MongoDB
  await User.deleteMany({ email: { $in: ['teststudent@university.edu', 'weakuser@university.edu'] } });

  const testResults = [];

  try {
    // -------------------------------------------------------------
    // SCENARIO 1: Successful User Registration
    // -------------------------------------------------------------
    console.log('[TEST 1] Testing Successful User Registration...');
    const regPayload = {
      name: 'Test Student',
      email: 'teststudent@university.edu',
      password: 'SecurePass@2026',
      confirmPassword: 'SecurePass@2026',
    };
    const regRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/register',
      body: regPayload,
    });

    const test1Passed =
      regRes.statusCode === 201 &&
      regRes.data.success === true &&
      regRes.data.user &&
      regRes.data.user.email === regPayload.email.toLowerCase() &&
      !regRes.data.user.password; // Plain password/hash must not be exposed

    console.log(`  -> Status: ${regRes.statusCode}`);
    console.log(`  -> Response Message: ${regRes.data.message}`);
    console.log(`  -> User Registered: ${JSON.stringify(regRes.data.user)}`);
    console.log(`  -> Result: ${test1Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);
    testResults.push({ name: '1. Successful User Registration', passed: test1Passed });

    // Verify in MongoDB: check password hash
    console.log('[DB CHECK] Inspecting Stored MongoDB Document for User...');
    const savedUser = await User.findOne({ email: regPayload.email.toLowerCase() });
    const isHashed = savedUser.password.startsWith('$2a$') || savedUser.password.startsWith('$2b$');
    const isPlainTextExposed = savedUser.password === regPayload.password;
    console.log(`  -> Stored Password in DB: ${savedUser.password}`);
    console.log(`  -> Salt/Hash Format Verified ($2b$): ${isHashed ? 'YES ✓' : 'NO ✗'}`);
    console.log(`  -> Plain-Text Stored: ${isPlainTextExposed ? 'CRITICAL SECURITY FAIL ✗' : 'NO (Secure) ✓'}\n`);

    // -------------------------------------------------------------
    // SCENARIO 2: Duplicate Email Registration
    // -------------------------------------------------------------
    console.log('[TEST 2] Testing Duplicate Email Registration Prevention...');
    const dupRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/register',
      body: regPayload, // Same email
    });

    const test2Passed =
      (dupRes.statusCode === 409 || dupRes.statusCode === 400) &&
      dupRes.data.success === false;

    console.log(`  -> Status: ${dupRes.statusCode}`);
    console.log(`  -> Response Message: ${dupRes.data.message}`);
    console.log(`  -> Result: ${test2Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);
    testResults.push({ name: '2. Duplicate Email Registration Prevention', passed: test2Passed });

    // -------------------------------------------------------------
    // SCENARIO 3: Registration with Weak Password
    // -------------------------------------------------------------
    console.log('[TEST 3] Testing Weak Password Rejection...');
    const weakRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        name: 'Weak Password User',
        email: 'weakuser@university.edu',
        password: '123', // Weak password
        confirmPassword: '123',
      },
    });

    const test3Passed =
      weakRes.statusCode === 400 &&
      weakRes.data.success === false &&
      weakRes.data.message.includes('Password');

    console.log(`  -> Status: ${weakRes.statusCode}`);
    console.log(`  -> Error Message: ${weakRes.data.message}`);
    console.log(`  -> Result: ${test3Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);
    testResults.push({ name: '3. Weak Password Rejection', passed: test3Passed });

    // -------------------------------------------------------------
    // SCENARIO 4: Successful Login with Valid Credentials
    // -------------------------------------------------------------
    console.log('[TEST 4] Testing Successful Login with Valid Credentials...');
    const loginRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: regPayload.email,
        password: regPayload.password,
      },
    });

    // Check Set-Cookie header
    const setCookieHeader = loginRes.headers['set-cookie'];
    if (setCookieHeader && setCookieHeader.length > 0) {
      storedAuthCookie = setCookieHeader[0].split(';')[0]; // Extract 'token=...'
    }

    const test4Passed =
      loginRes.statusCode === 200 &&
      loginRes.data.success === true &&
      loginRes.data.user &&
      loginRes.data.user.email === regPayload.email.toLowerCase();

    console.log(`  -> Status: ${loginRes.statusCode}`);
    console.log(`  -> Response: ${JSON.stringify(loginRes.data)}`);
    console.log(`  -> Result: ${test4Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);
    testResults.push({ name: '4. Successful Login with Valid Credentials', passed: test4Passed });

    // -------------------------------------------------------------
    // SCENARIO 5: Failed Login with Incorrect Credentials
    // -------------------------------------------------------------
    console.log('[TEST 5] Testing Failed Login with Incorrect Credentials (Generic Error)...');
    const failLoginRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: regPayload.email,
        password: 'WrongPassword!999',
      },
    });

    const test5Passed =
      failLoginRes.statusCode === 401 &&
      failLoginRes.data.success === false &&
      failLoginRes.data.message === 'Invalid email or password. Please check your credentials.';

    console.log(`  -> Status: ${failLoginRes.statusCode}`);
    console.log(`  -> Generic Error Message: "${failLoginRes.data.message}"`);
    console.log(`  -> Result: ${test5Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);
    testResults.push({ name: '5. Failed Login with Generic Error', passed: test5Passed });

    // -------------------------------------------------------------
    // SCENARIO 6: JWT Generation and Authentication Cookie
    // -------------------------------------------------------------
    console.log('[TEST 6] Testing JWT Generation and HttpOnly Cookie Security Flags...');
    const cookieString = setCookieHeader ? setCookieHeader[0] : '';
    const hasToken = cookieString.includes('token=');
    const isHttpOnly = /HttpOnly/i.test(cookieString);
    const hasSameSite = /SameSite=Lax/i.test(cookieString) || /SameSite=None/i.test(cookieString);

    const test6Passed = hasToken && isHttpOnly && hasSameSite;

    // Truncate token for secure display
    const tokenPreview = cookieString.split(';')[0].substring(0, 25) + '...[REDACTED]...';
    console.log(`  -> Set-Cookie Header: ${tokenPreview}`);
    console.log(`  -> HttpOnly Flag Present: ${isHttpOnly ? 'YES ✓' : 'NO ✗'}`);
    console.log(`  -> SameSite Flag Present: ${hasSameSite ? 'YES ✓' : 'NO ✗'}`);
    console.log(`  -> Result: ${test6Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);
    testResults.push({ name: '6. JWT Generation & Secure Cookie', passed: test6Passed });

    // -------------------------------------------------------------
    // SCENARIO 7: Accessing Protected Dashboard (GET /api/auth/me)
    // -------------------------------------------------------------
    console.log('[TEST 7] Testing Access to Protected Route with Valid JWT Cookie...');
    const meRes = await makeRequest({
      method: 'GET',
      path: '/api/auth/me',
      headers: {
        Cookie: storedAuthCookie,
      },
    });

    const test7Passed =
      meRes.statusCode === 200 &&
      meRes.data.success === true &&
      meRes.data.user &&
      meRes.data.user.email === regPayload.email.toLowerCase() &&
      !meRes.data.user.password; // Ensure password hash is NOT returned

    console.log(`  -> Status: ${meRes.statusCode}`);
    console.log(`  -> Authenticated User Data: ${JSON.stringify(meRes.data.user)}`);
    console.log(`  -> Result: ${test7Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);
    testResults.push({ name: '7. Accessing Protected Dashboard Route', passed: test7Passed });

    // -------------------------------------------------------------
    // SCENARIO 8: Blocking Unauthorized Dashboard Access
    // -------------------------------------------------------------
    console.log('[TEST 8] Testing Blocking Unauthorized Access to Protected Route...');
    const unauthRes = await makeRequest({
      method: 'GET',
      path: '/api/auth/me',
      // No Cookie provided!
    });

    const test8Passed =
      unauthRes.statusCode === 401 &&
      unauthRes.data.success === false &&
      unauthRes.data.message.includes('Access denied');

    console.log(`  -> Status: ${unauthRes.statusCode}`);
    console.log(`  -> Unauthorized Rejection Message: "${unauthRes.data.message}"`);
    console.log(`  -> Result: ${test8Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);
    testResults.push({ name: '8. Blocking Unauthorized Access', passed: test8Passed });

    // -------------------------------------------------------------
    // SCENARIO 9: Successful Logout and Cookie Invalidation
    // -------------------------------------------------------------
    console.log('[TEST 9] Testing Successful Logout Endpoint...');
    const logoutRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/logout',
      headers: {
        Cookie: storedAuthCookie,
      },
    });

    const logoutCookieHeader = logoutRes.headers['set-cookie'] ? logoutRes.headers['set-cookie'][0] : '';
    // A cleared cookie has an expired date or empty value (token=; Max-Age=0 or Expires in the past)
    const isCookieCleared =
      logoutCookieHeader.includes('token=;') ||
      logoutCookieHeader.includes('Expires=Thu, 01 Jan 1970') ||
      logoutCookieHeader.includes('Max-Age=0');

    const test9Passed =
      logoutRes.statusCode === 200 &&
      logoutRes.data.success === true &&
      isCookieCleared;

    console.log(`  -> Status: ${logoutRes.statusCode}`);
    console.log(`  -> Logout Message: "${logoutRes.data.message}"`);
    console.log(`  -> Invalidation Cookie Header: ${logoutCookieHeader}`);
    console.log(`  -> Result: ${test9Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);
    testResults.push({ name: '9. Successful Logout & Cookie Clearing', passed: test9Passed });

  } catch (error) {
    console.error('Fatal error during test suite execution:', error);
  } finally {
    // Clean up connections
    if (serverInstance) serverInstance.close();
    await mongoose.connection.close();

    console.log('====================================================================');
    console.log('                  FINAL LAB TEST SUMMARY');
    console.log('====================================================================');
    let allPassed = true;
    testResults.forEach((t) => {
      console.log(`  [${t.passed ? 'PASS' : 'FAIL'}] ${t.name}`);
      if (!t.passed) allPassed = false;
    });
    console.log('====================================================================');
    console.log(`  Total: ${testResults.length} | Passed: ${testResults.filter(t=>t.passed).length} | Failed: ${testResults.filter(t=>!t.passed).length}`);
    console.log(`  OVERALL VERIFICATION: ${allPassed ? 'ALL TESTS PASSED SUCCESSFULLY! ✓' : 'SOME TESTS FAILED ✗'}`);
    console.log('====================================================================\n');
  }
}

runTestSuite();
