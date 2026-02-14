import axios from 'axios';

// 1. Define the Backend URL (Django)
const API_URL = 'http://127.0.0.1:8000/api';

// 2. Create the Axios Instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Automatically add the Token to every request (Interceptor)
api.interceptors.request.use(
  (config) => {
    // We access localStorage safely (checks if window exists)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;