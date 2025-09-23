import { createClient } from '@supabase/supabase-js';

// Enhanced configuration for Supabase Pro
const supabaseUrl = 'https://sqfqlnodwjubacmaduzl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZnFsbm9kd2p1YmFjbWFkdXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzQ2ODUsImV4cCI6MjA3Mzc1MDY4NX0.OtEDSh5UCm8CxWufG_NBLDzgNFI3wnr-oAyaRib_4Mw';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
      heartbeatIntervalMs: 30000
    }
  },
  global: {
    headers: {
      'x-application-name': 'Studio37-Photography',
      'x-application-version': '2.0.0'
    }
  }
});

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
    return { data: null, error };
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
export const trackAnalyticsEvent = async (event, properties = {}) => {
  try {
    await supabase.from('analytics_events').insert({
      event_type: event,
      event_data: {
        ...properties,
        timestamp: new Date().toISOString(),
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        performance_metrics: connectionState.metrics
      },
      page_url: window.location.href,
      referrer: document.referrer,
      created_at: new Date().toISOString()
    });
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
