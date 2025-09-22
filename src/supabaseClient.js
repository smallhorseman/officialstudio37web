import { createClient } from '@supabase/supabase-js';

// Supabase configuration with provided credentials
const supabaseUrl = 'https://sqfqlnodwjubacmaduzl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZnFsbm9kd2p1YmFjbWFkdXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzQ2ODUsImV4cCI6MjA3Mzc1MDY4NX0.OtEDSh5UCm8CxWufG_NBLDzgNFI3wnr-oAyaRib_4Mw';

// Validate required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Using demo mode.');
}

// Create a mock client for demo purposes when Supabase is not configured
const createMockSupabase = () => {
  const mockResponse = { data: null, error: null };
  
  return {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve(mockResponse),
      update: () => Promise.resolve(mockResponse),
      delete: () => Promise.resolve(mockResponse),
      eq: function() { return this; },
      order: function() { return this; },
      limit: function() { return this; }
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve(mockResponse),
        remove: () => Promise.resolve(mockResponse),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  };
};

// Create Supabase client
let supabase;
try {
  if (supabaseUrl && supabaseAnonKey && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    console.log('Supabase client initialized successfully');
  } else {
    console.warn('Invalid or missing Supabase configuration. Using mock client.');
    supabase = createMockSupabase();
  }
} catch (error) {
  console.error('Failed to initialize Supabase:', error);
  supabase = createMockSupabase();
}

export { supabase };

// Helper functions for common operations
export const uploadImage = async (file, bucket = 'images') => {
  try {
    if (!supabase.storage) {
      throw new Error('Storage not available in demo mode');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
      
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (fileName, bucket = 'images') => {
  try {
    if (!supabase.storage) {
      throw new Error('Storage not available in demo mode');
    }
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Utility function for secure data fetching
export const fetchWithErrorHandling = async (query) => {
  try {
    const result = await query;
    if (result && result.error) {
      console.error('Supabase query error:', result.error);
      throw result.error;
    }
    return result.data || [];
  } catch (err) {
    console.error('Database operation failed:', err);
    // Return empty array for graceful degradation
    return [];
  }
};

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'));
};

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is expected if tables aren't created yet
      throw error;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};
