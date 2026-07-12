import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Callback registry for logout — avoids window.location.href that bypasses React state
let _onAuthFailure = null;
export const setAuthFailureCallback = (cb) => { _onAuthFailure = cb; };

const forceLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('vb_user');
  if (_onAuthFailure) {
    _onAuthFailure();
  } else {
    window.location.href = '/login';
  }
};

// Request interceptor - attach authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401/403 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // If 401 (expired/invalid token) and we haven't already retried
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          forceLogout();
          return Promise.reject(error);
        }

        // Attempt token refresh
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/token`,
          { refreshToken }
        );

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    // If 403 on a non-auth endpoint (role permission denied) — don't redirect,
    // just let the calling component handle the error message
    return Promise.reject(error);
  }
);

export default api;
