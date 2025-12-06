import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Preferences from './pages/Preferences';
import client from './api/client';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsAuthenticated(false);
        setHasCompletedOnboarding(null);
        return;
      }

      try {
        const response = await client.get('/auth/me/');
        setIsAuthenticated(true);
        setHasCompletedOnboarding(response.data.has_completed_onboarding);
      } catch {
        setIsAuthenticated(false);
        setHasCompletedOnboarding(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    };

    checkAuth();
  }, [location]);

  if (isAuthenticated === null || (isAuthenticated && hasCompletedOnboarding === null)) {
    return <div>Loading...</div>;
  }

  // If authenticated but hasn't completed onboarding, redirect to onboarding
  // (unless already on onboarding page)
  if (isAuthenticated && !hasCompletedOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If authenticated and completed onboarding, don't allow access to onboarding
  if (isAuthenticated && hasCompletedOnboarding && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            hasCompletedOnboarding ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/onboarding" />
            )
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            hasCompletedOnboarding ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/onboarding" />
            )
          ) : (
            <Signup />
          )
        }
      />
      <Route
        path="/onboarding"
        element={
          isAuthenticated ? (
            <Onboarding />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated && hasCompletedOnboarding ? (
            <Dashboard />
          ) : isAuthenticated ? (
            <Navigate to="/onboarding" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/preferences"
        element={
          isAuthenticated && hasCompletedOnboarding ? (
            <Preferences />
          ) : isAuthenticated ? (
            <Navigate to="/onboarding" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated && hasCompletedOnboarding ? (
            <Navigate to="/dashboard" />
          ) : isAuthenticated ? (
            <Navigate to="/onboarding" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

