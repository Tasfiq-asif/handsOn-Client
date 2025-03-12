import axios from 'axios';
import { supabase } from './supabase';

// Use just the base URL without /api since we'll include it in the routes
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token and log all requests
api.interceptors.request.use(
  async (config) => {
    // Get current session from Supabase
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    
    // If session exists, add token to Authorization header
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      console.log('Including token in request (first 10 chars):', session.access_token.substring(0, 10) + '...');
    } else {
      console.log('No active session found for request');
    }
    
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
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      // Log detailed error information
      console.error(`API Error ${status}:`, errorData);
      
      // Handle specific status codes
      if (status === 401) {
        console.error('Authentication error - user not authenticated or token expired');
      } else if (status === 403) {
        console.error('Authorization error - user does not have permission');  
      } else if (status === 500) {
        console.error('Server error:', errorData.error || errorData.message || 'Unknown server error');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Request Error: No response received', error.request);
    } else {
      // Something happened in setting up the request
      console.error('API Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 