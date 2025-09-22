import { createClient } from '@supabase/supabase-js';

// Supabase configuration with provided credentials
const supabaseUrl = 'https://sqfqlnodwjubacmaduzl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZnFsbm9kd2p1YmFjbWFkdXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzQ2ODUsImV4cCI6MjA3Mzc1MDY4NX0.OtEDSh5UCm8CxWufG_NBLDzgNFI3wnr-oAyaRib_4Mw';

// Connection state management
let connectionState = {
  status: 'disconnected', // 'connecting', 'connected', 'error', 'disconnected'
  lastCheck: null,
  retryCount: 0,
  maxRetries: 3
};

// Cache for frequently accessed data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Enhanced mock client for offline mode
const createEnhancedMockSupabase = () => {
  const mockData = {
    leads: JSON.parse(localStorage.getItem('studio37_mock_leads') || '[]'),
    portfolio_images: JSON.parse(localStorage.getItem('studio37_mock_portfolio') || '[]'),
    projects: JSON.parse(localStorage.getItem('studio37_mock_projects') || '[]')
  };

  const saveMockData = (table, data) => {
    mockData[table] = data;
    localStorage.setItem(`studio37_mock_${table}`, JSON.stringify(data));
  };

  return {
    from: (table) => ({
      select: (columns = '*') => {
        const data = mockData[table] || [];
        return Promise.resolve({ 
          data: columns === 'count' ? [{ count: data.length }] : data, 
          error: null 
        });
      },
      insert: (records) => {
        const data = mockData[table] || [];
        const newRecords = Array.isArray(records) ? records : [records];
        const recordsWithIds = newRecords.map(record => ({
          ...record,
          id: record.id || Date.now() + Math.random(),
          created_at: record.created_at || new Date().toISOString()
        }));
        
        const updatedData = [...data, ...recordsWithIds];
        saveMockData(table, updatedData);
        
        return Promise.resolve({ data: recordsWithIds, error: null });
      },
      update: (updates) => ({
        eq: (column, value) => {
          const data = mockData[table] || [];
          const updatedData = data.map(item => 
            item[column] === value ? { ...item, ...updates } : item
          );
          saveMockData(table, updatedData);
          return Promise.resolve({ data: updatedData.filter(item => item[column] === value), error: null });
        }
      }),
      delete: () => ({
        eq: (column, value) => {
          const data = mockData[table] || [];
          const filteredData = data.filter(item => item[column] !== value);
          saveMockData(table, filteredData);
          return Promise.resolve({ data: [], error: null });
        }
      }),
      eq: function(column, value) { 
        this._filters = this._filters || [];
        this._filters.push({ column, value, operator: 'eq' });
        return this; 
      },
      order: function(column, options = {}) { 
        this._order = { column, ascending: options.ascending !== false };
        return this; 
      },
      limit: function(count) { 
        this._limit = count;
        return this; 
      }
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        remove: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: (fileName) => ({ 
          data: { publicUrl: `https://example.com/mock/${fileName}` } 
        })
      })
    },
    // Add realtime mock
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
      unsubscribe: () => {}
    })
  };
};

// Create optimized Supabase client
let supabase;
try {
  if (supabaseUrl && supabaseAnonKey && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      global: {
        headers: {
          'x-client-info': 'studio37-web@1.0.0'
        }
      },
      db: {
        schema: 'public'
      }
    });
    
    connectionState.status = 'connected';
    console.log('✅ Supabase client initialized successfully');
  } else {
    console.warn('⚠️ Invalid or missing Supabase configuration. Using enhanced mock client.');
    supabase = createEnhancedMockSupabase();
    connectionState.status = 'mock';
  }
} catch (error) {
  console.error('❌ Failed to initialize Supabase:', error);
  supabase = createEnhancedMockSupabase();
  connectionState.status = 'error';
}

// Connection health monitoring
const healthCheck = async () => {
  if (connectionState.status === 'mock') return true;
  
  try {
    connectionState.status = 'connecting';
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
