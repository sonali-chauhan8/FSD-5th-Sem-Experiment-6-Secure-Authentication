import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = ({ setCurrentView }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setCurrentView('login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Active Session';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="dashboard-container">
      {/* Hero Welcome Card */}
      <div className="dashboard-hero">
        <div className="user-profile-header">
          <div className="user-avatar-large">
            {getInitials(user?.name)}
          </div>
          <div>
            <h1 className="user-greeting">Welcome, {user?.name || 'User'}!</h1>
            <p className="user-email-text">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>{user?.email}</span>
            </p>
            <div className="status-badge">
              <span className="status-indicator-dot" />
              <span>Authenticated (JWT in HttpOnly Cookie)</span>
            </div>
          </div>
        </div>

        <div>
          <button className="btn-danger" onClick={handleLogout}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Grid: Session & Security Technical Details */}
      <div className="dashboard-grid">
        {/* User Account Details */}
        <div className="dash-card">
          <div className="dash-card-header">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Account Profile</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">User ID (MongoDB _id)</span>
            <span className="detail-value security-badge">{user?.id || user?._id || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Full Name</span>
            <span className="detail-value">{user?.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email Address</span>
            <span className="detail-value">{user?.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Registration Date</span>
            <span className="detail-value">{formatDate(user?.createdAt)}</span>
          </div>
        </div>

        {/* Security & Authentication Mechanisms */}
        <div className="dash-card">
          <div className="dash-card-header">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Security Architecture</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Password Storage</span>
            <span className="detail-value">
              <span className="security-badge">bcryptjs (10 rounds salt)</span>
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Session Management</span>
            <span className="detail-value">
              <span className="security-badge">JSON Web Token (JWT)</span>
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Cookie Protection</span>
            <span className="detail-value">
              <span className="security-badge">HttpOnly + SameSite=Lax</span>
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">XSS Immunity</span>
            <span className="detail-value" style={{ color: '#10b981', fontWeight: 700 }}>
              ✓ No localStorage used
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Rate Limiting</span>
            <span className="detail-value" style={{ color: '#10b981', fontWeight: 700 }}>
              ✓ Active on /register & /login
            </span>
          </div>
        </div>

        {/* Academic Lab Context Card */}
        <div className="dash-card" style={{ gridColumn: '1 / -1' }}>
          <div className="dash-card-header">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Lab Experiment Verification Guide</span>
          </div>
          <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', marginBottom: '1rem' }}>
            This dashboard is only rendered after your browser sends the secure <code>token</code> cookie to the backend route <code>GET /api/auth/me</code>, which is decoded and validated by the <code>verifyToken</code> middleware.
          </p>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', fontSize: '0.85rem', color: '#334155' }}>
            <strong>💡 Inspection Note for Lab Evaluation:</strong> Open DevTools (F12) → <em>Application</em> tab → <em>Cookies</em> → <code>http://localhost:5173</code> (or <code>5000</code>). You will see the <code>token</code> cookie with the <strong>HttpOnly</strong> flag checked. This guarantees that malicious JavaScript (XSS attacks) cannot steal the JWT.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
