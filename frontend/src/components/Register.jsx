import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Register = ({ setCurrentView }) => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { name, email, password, confirmPassword } = formData;

  // Password Strength Calculation
  const checkStrength = (pass) => {
    const rules = {
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass),
    };

    const passedCount = Object.values(rules).filter(Boolean).length;
    let score = 'Weak';
    let color = '#ef4444';
    let percent = '20%';

    if (passedCount >= 5) {
      score = 'Strong';
      color = '#10b981';
      percent = '100%';
    } else if (passedCount >= 3) {
      score = 'Medium';
      color = '#f59e0b';
      percent = '60%';
    }

    return { rules, score, color, percent, isValid: passedCount === 5 };
  };

  const strength = checkStrength(password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Client-side validations
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!strength.isValid) {
      setErrorMsg(
        'Password does not meet the security criteria. Please choose a stronger password.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your confirm password.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password, confirmPassword);
      setSuccessMsg(
        res.message || 'Registration successful! Redirecting to login...'
      );
      setTimeout(() => {
        setCurrentView('login');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrap">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">
            Experiment 6: Password Hashing with Salt & bcryptjs
          </p>
        </div>

        {errorMsg && (
          <div className="alert-box alert-danger">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-box alert-success">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. John Doe"
                value={name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="name@university.edu"
                value={email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="Create strong password"
                value={password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Dynamic Password Strength Indicator */}
            {password.length > 0 && (
              <div className="strength-meter-box">
                <div className="strength-meter-header">
                  <span>Password Strength</span>
                  <span style={{ color: strength.color }}>{strength.score}</span>
                </div>
                <div className="strength-bar-track">
                  <div
                    className="strength-bar-fill"
                    style={{
                      width: strength.percent,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
                <ul className="strength-rules-list">
                  <li
                    className={`strength-rule-item ${strength.rules.length ? 'valid' : ''}`}
                  >
                    {strength.rules.length ? '✓' : '○'} Min 8 characters
                  </li>
                  <li
                    className={`strength-rule-item ${strength.rules.upper ? 'valid' : ''}`}
                  >
                    {strength.rules.upper ? '✓' : '○'} 1 Uppercase (A-Z)
                  </li>
                  <li
                    className={`strength-rule-item ${strength.rules.lower ? 'valid' : ''}`}
                  >
                    {strength.rules.lower ? '✓' : '○'} 1 Lowercase (a-z)
                  </li>
                  <li
                    className={`strength-rule-item ${strength.rules.number ? 'valid' : ''}`}
                  >
                    {strength.rules.number ? '✓' : '○'} 1 Number (0-9)
                  </li>
                  <li
                    className={`strength-rule-item ${strength.rules.special ? 'valid' : ''}`}
                  >
                    {strength.rules.special ? '✓' : '○'} 1 Special symbol
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m9 12 2 2 4-4" />
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className={`form-input ${
                  confirmPassword && password !== confirmPassword
                    ? 'input-error'
                    : ''
                }`}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <span className="field-error-text">
                ⚠️ Passwords do not match yet.
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-submit"
            disabled={loading || (password.length > 0 && !strength.isValid)}
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>Hashing & Registering...</span>
              </>
            ) : (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <polyline points="16 11 18 13 22 9" />
                </svg>
                <span>Register User</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already registered an account?
          <a
            className="auth-footer-link"
            onClick={() => setCurrentView('login')}
          >
            Log In Here
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
