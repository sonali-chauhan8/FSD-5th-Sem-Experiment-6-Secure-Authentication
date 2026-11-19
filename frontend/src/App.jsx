import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('login');

  // Automatic view routing based on authentication state
  useEffect(() => {
    if (!loading) {
      if (user) {
        setCurrentView('dashboard');
      } else {
        if (currentView === 'dashboard') {
          setCurrentView('login');
        }
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="full-loader">
        <div className="spinner spinner-dark" />
        <p>Verifying secure session...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="main-content">
        {currentView === 'register' && (
          <Register setCurrentView={setCurrentView} />
        )}

        {currentView === 'login' && (
          <Login setCurrentView={setCurrentView} />
        )}

        {currentView === 'dashboard' && (
          user ? (
            <Dashboard setCurrentView={setCurrentView} />
          ) : (
            <Login setCurrentView={setCurrentView} />
          )
        )}
      </main>

      {/* Lab Academic Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1.25rem',
        color: 'rgba(255, 255, 255, 0.65)',
        fontSize: '0.85rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        B.Tech 5th Semester Full Stack Development Lab &bull; Experiment 6: Secure User Authentication (Password Hashing & JWT)
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
