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
    debug: false // Disable debug mode to prevent detailed logs
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'apikey': supabaseAnonKey,
      'X-Client-Info': 'supabase-js/2.x'
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Check for session errors on initialization
supabase.auth.getSession().then(({ error }) => {
  if (error) {
    console.error('Error checking initial session:', error);
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