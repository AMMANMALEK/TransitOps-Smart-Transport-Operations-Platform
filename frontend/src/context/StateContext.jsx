import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { setAuthFailureCallback } from '../api/axios';

const StateContext = createContext();

export const StateProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clear all authentication state (React + localStorage)
  const clearAuth = () => {
    setUser(null);
    localStorage.removeItem('vb_user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Register clearAuth with the axios interceptor so 401s
  // properly reset React state before navigating to /login
  useEffect(() => {
    setAuthFailureCallback(() => {
      clearAuth();
      window.location.replace('/login');
    });
  }, []);

  // Validate stored token on startup — prevents stale auth loops
  useEffect(() => {
    const validate = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        } catch {
          clearAuth();
        }
      } else {
        clearAuth();
      }
      setLoading(false);
    };
    validate();
  }, []);

  // Mock approvals
  const approvals = [];

  // Login — authenticates with backend and sets JWT tokens
  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email.trim(), password);
      if (data && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        const loggedUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        };
        setUser(loggedUser);
        localStorage.setItem('vb_user', JSON.stringify(loggedUser));
        return loggedUser;
      }
      return null;
    } catch (err) {
      console.error('Login failed:', err.response?.data || err.message);
      throw err;
    }
  };

  // Logout
  const logout = () => {
    clearAuth();
  };

  return (
    <StateContext.Provider value={{
      user,
      loading,
      login,
      logout,
      clearAuth,
      approvals,
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => useContext(StateContext);
