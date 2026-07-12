import api from './axios';

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/token', { refreshToken });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    const { user } = response.data;
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },
};
