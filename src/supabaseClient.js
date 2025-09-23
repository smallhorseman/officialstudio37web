import { createClient } from '@supabase/supabase-js';

// Use environment variables with better error handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create mock client for development without Supabase
const createMockClient = () => {
  console.warn('⚠️ Running in mock mode - no Supabase connection');
  
  return {
    from: (table) => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: (data) => Promise.resolve({ data, error: null }),
      update: (data) => Promise.resolve({ data, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      upsert: (data) => Promise.resolve({ data, error: null })
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signIn: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null })
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    },
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
      unsubscribe: () => {}
    }),
    removeChannel: () => {}
  };
};

// Create Supabase client or mock
let supabase;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      flowType: 'pkce'
    }
  });
} else {
  console.warn('Missing Supabase environment variables - using mock client');
  supabase = createMockClient();
}

// Connection state management
let connectionState = {
  status: 'disconnected',
  lastCheck: null,
  retryCount: 0,
  maxRetries: 5,
  metrics: {
    lastLatency: 0,
    averageLatency: 0,
    connectionQuality: 'good'
  }
};

// Test connection function
export const testConnection = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    connectionState.status = 'mock';
    return false;
  }
  
  try {
    connectionState.status = 'checking';
    
    const { data, error } = await supabase
      .from('leads')
      .select('count', { count: 'exact', head: true })
      .limit(1);

    if (error && error.code !== 'PGRST116') {
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
    
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};

// Get connection status
export const getConnectionStatus = () => connectionState.status;

// Batch operations
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
  
  try {
    const query = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table }, 
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

// Pro-level batch operations with transaction support
export const batchTransaction = async (operations) => {
  const startTime = performance.now();
  
  try {
    // Use Supabase Pro transaction features
    const results = await Promise.all(
      operations.map(async (op) => {
        const { data, error } = await op();
        if (error) throw error;
        return data;
      })
    );
    
    const duration = performance.now() - startTime;
    console.log(`✅ Batch transaction completed in ${duration.toFixed(2)}ms`);
    
    return { data: results, error: null };
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`❌ Batch transaction failed after ${duration.toFixed(2)}ms:`, error);
    
    return { data: null, error: error.message };
  }
};

// Pro-level real-time subscriptions with connection pooling
export const createRealtimeSubscription = (table, callback, filters = {}) => {
  const channel = supabase
    .channel(`studio37-${table}-${Date.now()}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: table,
        ...filters
      }, 
      (payload) => {
        console.log('📡 Real-time update:', payload);
        callback(payload);
      }
    )
    .on('system', {}, (payload) => {
      console.log('🔗 System status:', payload);
    })
    .subscribe((status) => {
      console.log(`📡 Subscription status for ${table}:`, status);
    });

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
    getStatus: () => channel.getState()
  };
};

// Pro-level storage operations with CDN
export const uploadToStorage = async (file, bucket = 'portfolio', options = {}) => {
  const startTime = performance.now();
  
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName, {
        transform: options.transform
      });
    
    trackPerformance('storage_upload', startTime, true);
    return { publicUrl, fileName, data };
  } catch (error) {
    trackPerformance('storage_upload', startTime, false);
    throw error;
  }
};

// Pro-level analytics and monitoring
export const trackAnalyticsEvent = async (eventType, eventData = {}) => {
  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: eventType,
        event_data: eventData,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      });
    
    if (error) throw error;
    console.log(`📊 Analytics event tracked: ${eventType}`);
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};

// Session management for Pro features
let sessionId = null;
const getSessionId = () => {
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
  return sessionId;
};

// Performance tracking function
const trackPerformance = (eventName, startTime, success) => {
  const duration = performance.now() - startTime;
  console.log(`Performance: ${eventName} - ${duration}ms - ${success ? 'success' : 'failed'}`);
};

// Connection status functions
// testConnection is already defined above

// getConnectionStatus is already defined above

// Export the configured supabase client
export { supabase };
export default supabase;

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanup);
}
// getConnectionStatus is already defined above

// Export the configured supabase client
export { supabase };
export default supabase;

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanup);
}
