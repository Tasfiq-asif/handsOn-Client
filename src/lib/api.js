import axios from 'axios';

// Use just the base URL without /api since we'll include it in the routes
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to log all requests
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to log all responses
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} for ${response.config.method.toUpperCase()} ${response.config.url}`);
    console.log('Response headers:', response.headers);
    
    // Log cookies from document if we can access them
    console.log('Document cookies:', document.cookie);
    
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

export default api; 