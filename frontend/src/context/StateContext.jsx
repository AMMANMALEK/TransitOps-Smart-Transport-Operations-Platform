/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const StateContext = createContext();

// Mock users for offline login
const MOCK_USERS = [
  {
    id: 'USR-001',
    name: 'Admin User',
    email: 'admin@transitops.com',
    password: 'Admin@123',
    role: 'fleet_manager',
  },
  {
    id: 'USR-002',
    name: 'Rahul Sharma',
    email: 'fleet@transitops.com',
    password: 'Fleet@123',
    role: 'fleet_manager',
  },
  {
    id: 'USR-003',
    name: 'Dev Mehta',
    email: 'driver@transitops.com',
    password: 'Driver@123',
    role: 'driver',
  },
  {
    id: 'USR-004',
    name: 'Priya Nair',
    email: 'safety@transitops.com',
    password: 'Safety@123',
    role: 'safety_officer',
  },
  {
    id: 'USR-005',
    name: 'Meera Kapoor',
    email: 'finance@transitops.com',
    password: 'Finance@123',
    role: 'financial_analyst',
  },
];

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

  // Mock login - no backend required
  const login = (email, password) => {
    const foundUser = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      return null;
    }

    const loggedUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
    };

    setUser(loggedUser);
    return loggedUser;
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('vb_user');
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
