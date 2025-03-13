import axios from 'axios';
import { supabase } from './supabase';

// Use just the base URL without /api since we'll include it in the routes
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add a request interceptor to include auth token and log all requests
api.interceptors.request.use(
  async (config) => {
    try {
      // Skip token for login and register endpoints
      const isAuthEndpoint = 
        config.url.includes('/api/users/login') || 
        config.url.includes('/api/users/register');
      
      if (!isAuthEndpoint && !config.headers.Authorization) {
        // Get current session from Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          const session = data?.session;
          
          // If session exists, add token to Authorization header
          if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
            console.log('Including token in request to:', config.url);
          } else {
            console.log('No active session found for request to:', config.url);
          }
        }
      } else if (config.headers.Authorization) {
        console.log('Using provided Authorization header for:', config.url);
      } else {
        console.log('Skipping auth token for auth endpoint:', config.url);
      }
      
      // Ensure Accept header is set to application/json to avoid 406 errors
      config.headers.Accept = 'application/json';
    } catch (err) {
      console.error('Error in request interceptor:', err);
    }
    
    console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to log all responses and handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} for ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      // Log detailed error information
      console.error(`API Error ${status}:`, errorData);
      
      // Handle specific status codes
      if (status === 401) {
        console.error('Authentication error - user not authenticated or token expired');
        
        // Try to refresh the token
        try {
          const { data, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !data.session) {
            console.error('Failed to refresh session:', refreshError);
            // Clear any stale session data
            await supabase.auth.signOut();
            
            // Redirect to login if needed
            if (window.location.pathname !== '/login') {
              window.location.href = '/login?session_expired=true';
            }
          } else {
            console.log('Session refreshed, retrying request');
            
            // Retry the original request with the new token
            const originalRequest = error.config;
            originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
            return api(originalRequest);
          }
        } catch (refreshException) {
          console.error('Exception during token refresh:', refreshException);
        }
      } else if (status === 403) {
        console.error('Authorization error - user does not have permission');  
      } else if (status === 406) {
        console.error('Not Acceptable error - check Accept headers');
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