import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

const StateContext = createContext();


export const StateProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const data = localStorage.getItem('vb_user');
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  
  // Mock approvals (empty for now)
  const approvals = [];

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('vb_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('vb_user');
    }
  }, [user]);

  // Real login - authenticates with backend and sets JWT tokens
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
    setUser(null);
    localStorage.removeItem('vb_user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <StateContext.Provider value={{
      user,
      loading,
      login,
      logout,
      approvals, // Add this for Header component
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => useContext(StateContext);
