import axios from 'axios';

/**
 * Axios API client instance configured for HttpOnly Cookie authentication.
 * withCredentials: true ensures that cookies set by the backend (like 'token')
 * are automatically stored by the browser and sent with cross-origin requests.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Crucial for sending & receiving HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Anti-CSRF defense header
  },
});

// Response interceptor to format clean error messages from backend responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected network error occurred.',
    };
    return Promise.reject(customError);
  }
);

export default api;
