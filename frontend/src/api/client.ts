import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: inject JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: handle errors with useful categorization
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        console.warn('[API] 401 Unauthorized — clearing session');
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_user');
        if (!window.location.pathname.endsWith('/login')) {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        console.warn('[API] 403 Forbidden');
      } else if (status === 404) {
        console.error('[API] 404 Not Found:', error.config?.url);
      } else if (status >= 500) {
        console.error('[API] Server error:', status);
      }
    } else if (error.request) {
      // Request was made but no response received (network error / CORS)
      console.error('[API] Network error — no response received. Check VITE_API_URL and backend CORS config.');
    } else {
      console.error('[API] Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

