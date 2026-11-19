import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ currentView, setCurrentView }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setCurrentView('login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <span>AuthShield</span>
        <span className="badge">Exp 6 • B.Tech FSD</span>
      </div>

      <div className="nav-links">
        {user ? (
          <>
            <button
              className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </button>
            <button
              className="nav-link nav-btn-outline"
              onClick={handleLogout}
            >
              Logout ({user.name.split(' ')[0]})
            </button>
          </>
        ) : (
          <>
            <button
              className={`nav-link ${currentView === 'login' ? 'active' : ''}`}
              onClick={() => setCurrentView('login')}
            >
              Login
            </button>
            <button
              className={`nav-link ${currentView === 'register' ? 'active' : ''}`}
              onClick={() => setCurrentView('register')}
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
