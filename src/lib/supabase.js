import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

// Create Supabase client with persistence configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage, // Explicitly use localStorage for session storage
    storageKey: 'handsOn-auth-token',
    debug: true // Enable debug mode to see more detailed logs
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Log the current session on initialization to help with debugging
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error checking initial session:', error);
  } else if (data.session) {
    console.log('Supabase initialized with existing session for user:', data.session.user.email);
    console.log('Session expires at:', new Date(data.session.expires_at * 1000).toLocaleString());
  } else {
    console.log('Supabase initialized with no active session');
  }
});

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};

// Helper function to check if user is logged in
export const isLoggedIn = async () => {
  const user = await getCurrentUser();
  return !!user;
}; 