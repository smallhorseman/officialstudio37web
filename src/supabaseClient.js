import { createClient } from '@supabase/supabase-js';

// Supabase configuration with provided credentials
const supabaseUrl = 'https://sqfqlnodwjubacmaduzl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZnFsbm9kd2p1YmFjbWFkdXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzQ2ODUsImV4cCI6MjA3Mzc1MDY4NX0.OtEDSh5UCm8CxWufG_NBLDzgNFI3wnr-oAyaRib_4Mw';

// Connection state management
let connectionState = {
  status: 'disconnected',
  lastCheck: null,
  retryCount: 0,
  maxRetries: 3
};

// Create Supabase client with optimized settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  global: {
    headers: {
      'x-application-name': 'Studio37-Photography'
    }
  }
});

// Test connection function
export const testConnection = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    connectionState.status = 'unconfigured';
    return false;
  }

  try {
    connectionState.status = 'checking';
    
    // Simple health check - try to select from a system table
    const { data, error } = await supabase
      .from('leads')
      .select('count')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is OK
      throw error;
    }

    connectionState.status = 'connected';
    connectionState.lastCheck = new Date();
    connectionState.retryCount = 0;
    
    console.log('✅ Supabase connection successful');
    return true;
    
  } catch (error) {
    connectionState.status = 'error';
    connectionState.retryCount++;
    
    console.error('❌ Supabase connection failed:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    
    return false;
  }
};

// Get current connection status
export const getConnectionStatus = () => connectionState.status;

// Helper function to check if we should use offline mode
export const shouldUseOfflineMode = () => {
  return connectionState.status !== 'connected';
};

// Retry connection with exponential backoff
export const retryConnection = async () => {
  if (connectionState.retryCount >= connectionState.maxRetries) {
    console.warn('Max retry attempts reached for Supabase connection');
    return false;
  }

  const delay = Math.pow(2, connectionState.retryCount) * 1000; // Exponential backoff
  
  console.log(`Retrying Supabase connection in ${delay}ms (attempt ${connectionState.retryCount + 1}/${connectionState.maxRetries})`);
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  return await testConnection();
};

// Real-time subscription helper
export const subscribeToTable = (table, callback, filter = '*') => {
  if (shouldUseOfflineMode()) {
    console.warn(`Cannot subscribe to ${table} - offline mode`);
    return { unsubscribe: () => {} };
  }

  try {
    const subscription = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          filter: filter 
        }, 
        callback
      )
      .subscribe();

    return subscription;
  } catch (error) {
    console.error(`Failed to subscribe to ${table}:`, error);
    return { unsubscribe: () => {} };
  }
};

// Safe database operations with offline fallback
export const safeSupabaseOperation = async (operation, fallback = null) => {
  if (shouldUseOfflineMode()) {
    console.warn('Database operation attempted while offline, using fallback');
    return fallback;
  }

  try {
    return await operation();
  } catch (error) {
    console.error('Supabase operation failed:', error);
    
    // Mark as disconnected and try fallback
    connectionState.status = 'error';
    return fallback;
  }
};

// Initialize connection on import
testConnection().catch(console.error);

export default supabase;

// Health check function
const healthCheck = async () => {
  try {
    const { error } = await supabase
      .from('leads')
      .select('id')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    connectionState.status = 'connected';
    connectionState.retryCount = 0;
    connectionState.lastCheck = Date.now();
    return true;
  } catch (error) {
    connectionState.status = 'error';
    connectionState.retryCount++;
    console.error(`❌ Health check failed (attempt ${connectionState.retryCount}):`, error);
    return false;
  }
};

// Auto-reconnection with exponential backoff
const setupAutoReconnect = () => {
  if (connectionState.status === 'mock') return;
  
  const checkInterval = setInterval(async () => {
    if (connectionState.status === 'error' && connectionState.retryCount < connectionState.maxRetries) {
      console.log(`🔄 Attempting reconnection (${connectionState.retryCount + 1}/${connectionState.maxRetries})`);
      
      const delay = Math.pow(2, connectionState.retryCount) * 1000;
      setTimeout(async () => {
        const isHealthy = await healthCheck();
        if (isHealthy) {
          console.log('✅ Reconnection successful');
        }
      }, delay);
    }
  }, 30000); // Check every 30 seconds
  
  return () => clearInterval(checkInterval);
};

// Setup auto-reconnection
const cleanupReconnect = setupAutoReconnect();

// Enhanced helper functions with caching and retry logic
export const uploadImage = async (file, bucket = 'images', retries = 2) => {
  const cacheKey = `upload_${file.name}_${file.size}`;
  
  try {
    if (connectionState.status === 'mock') {
      throw new Error('Storage not available in mock mode');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
      
    // Cache the result
    cache.set(cacheKey, { publicUrl, fileName });
    
    return { publicUrl, fileName };
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    
    // Retry logic
    if (retries > 0 && error.message !== 'Storage not available in mock mode') {
      console.log(`🔄 Retrying upload... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return uploadImage(file, bucket, retries - 1);
    }
    
    throw error;
  }
};

export const deleteImage = async (fileName, bucket = 'images', retries = 2) => {
  try {
    if (connectionState.status === 'mock') {
      throw new Error('Storage not available in mock mode');
    }
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);
      
    if (error) throw error;
    
    // Clear from cache
    cache.forEach((value, key) => {
      if (value.fileName === fileName) {
        cache.delete(key);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error deleting image:', error);
    
    // Retry logic
    if (retries > 0 && error.message !== 'Storage not available in mock mode') {
      console.log(`🔄 Retrying delete... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return deleteImage(fileName, bucket, retries - 1);
    }
    
    throw error;
  }
};

// Enhanced data fetching with caching and pagination
export const fetchWithErrorHandling = async (query, useCache = true, retries = 2) => {
  const queryString = JSON.stringify(query);
  const cacheKey = `query_${btoa(queryString)}`;
  
  // Check cache first
  if (useCache && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('📦 Returning cached data');
      return cached.data;
    } else {
      cache.delete(cacheKey);
    }
  }
  
  try {
    console.log('🔄 Fetching fresh data from Supabase');
    const result = await query;
    
    if (result && result.error) {
      console.error('❌ Supabase query error:', result.error);
      throw result.error;
    }
    
    const data = result?.data || [];
    
    // Cache successful results
    if (useCache && data) {
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    }
    
    return data;
  } catch (err) {
    console.error('❌ Database operation failed:', err);
    
    // Retry logic for network errors
    if (retries > 0 && (err.code === 'PGRST301' || err.message.includes('network'))) {
      console.log(`🔄 Retrying query... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithErrorHandling(query, useCache, retries - 1);
    }
    
    // Return cached data if available during errors
    if (cache.has(cacheKey)) {
      console.log('📦 Returning stale cached data due to error');
      return cache.get(cacheKey).data;
    }
    
    // Graceful degradation
    return [];
  }
};

// Complete the batchInsert function
export const batchInsert = async (table, records, batchSize = 100) => {
  if (!Array.isArray(records) || records.length === 0) {
    return [];
  }
  
  const results = [];
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from(table)
        .insert(batch)
        .select();
      
      if (error) throw error;
      
      results.push(...(data || []));
    } catch (error) {
      console.error(`❌ Batch insert failed for batch ${Math.floor(i / batchSize) + 1}:`, error);
      throw error;
    }
  }
  
  // Clear related cache
  clearTableCache(table);
  
  return results;
};

export const batchUpdate = async (table, updates, batchSize = 50) => {
  if (!Array.isArray(updates) || updates.length === 0) {
    return [];
  }
  
  const results = [];
  
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    
    for (const update of batch) {
      try {
        const { data, error } = await supabase
          .from(table)
          .update(update.data)
          .eq(update.column, update.value)
          .select();
        
        if (error) throw error;
        
        results.push(...(data || []));
      } catch (error) {
        console.error(`❌ Batch update failed for item ${update.value}:`, error);
        throw error;
      }
    }
  }
  
  // Clear related cache
  clearTableCache(table);
  
  return results;
};

// Cache management
export const clearCache = () => {
  cache.clear();
  console.log('🧹 Cache cleared');
};

export const clearTableCache = (table) => {
  const keysToDelete = [];
  cache.forEach((value, key) => {
    if (key.includes(table)) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => cache.delete(key));
  console.log(`🧹 Cleared cache for table: ${table}`);
};

// Real-time subscriptions with auto-cleanup
const activeSubscriptions = new Map();

export const subscribeToTable = (table, callback, filters = {}) => {
  const subscriptionKey = `${table}_${JSON.stringify(filters)}`;
  
  // Unsubscribe existing subscription
  if (activeSubscriptions.has(subscriptionKey)) {
    activeSubscriptions.get(subscriptionKey).unsubscribe();
  }
  
  try {
    let query = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          ...filters
        }, 
        callback
      )
      .subscribe();
    
    activeSubscriptions.set(subscriptionKey, query);
    console.log(`📡 Subscribed to ${table} changes`);
    
    return () => {
      query.unsubscribe();
      activeSubscriptions.delete(subscriptionKey);
      console.log(`📡 Unsubscribed from ${table} changes`);
    };
  } catch (error) {
    console.error(`❌ Failed to subscribe to ${table}:`, error);
    return () => {};
  }
};

// Connection status functions
export const testConnection = async () => {
  try {
    if (connectionState.status === 'mock') return true;
    
    const { error } = await supabase
      .from('leads')
      .select('id')
      .limit(1);
    
    return !error || error.code === 'PGRST116'; // PGRST116 means empty table, which is fine
  } catch (err) {
    console.error('Connection test failed:', err);
    return false;
  }
};

export const getConnectionStatus = () => connectionState.status;

// Export the configured supabase client
export { supabase };
export default supabase;

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanup);
}
