import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWithErrorHandling, subscribeToTable, getConnectionStatus } from '../supabaseClient';

export const useSupabaseQuery = (
  queryFn, 
  dependencies = [], 
  options = {}
) => {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    refetchInterval = null,
    staleTime = 5 * 60 * 1000, // 5 minutes
    retry = 3,
    retryDelay = 1000,
    onSuccess = null,
    onError = null,
    realtime = false,
    realtimeTable = null,
    realtimeFilter = null
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const abortControllerRef = useRef(null);
  const intervalRef = useRef(null);
  const unsubscribeRef = useRef(null);

  const executeQuery = useCallback(async (isRetry = false) => {
    if (!enabled || (!isRetry && loading)) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      if (!isRetry) {
        setError(null);
        setRetryCount(0);
      }

      const query = queryFn();
      if (!query) return;

      const result = await fetchWithErrorHandling(query, true, 0);
      
      setData(result);
      setLastFetch(Date.now());
      setRetryCount(0);
      
      if (onSuccess) {
        onSuccess(result);
      }

    } catch (err) {
      console.error('Query failed:', err);
      setError(err);
      
      // Retry logic
      if (retryCount < retry) {
        const delay = retryDelay * Math.pow(2, retryCount);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          executeQuery(true);
        }, delay);
      } else if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [queryFn, enabled, loading, retry, retryDelay, retryCount, onSuccess, onError]);

  // Initial fetch and dependency updates
  useEffect(() => {
    if (enabled) {
      executeQuery();
    }
  }, [executeQuery, ...dependencies]);

  // Setup real-time subscription
  useEffect(() => {
    if (realtime && realtimeTable && getConnectionStatus() === 'connected') {
      unsubscribeRef.current = subscribeToTable(
        realtimeTable,
        (payload) => {
          console.log('Real-time update received:', payload);
          executeQuery();
        },
        realtimeFilter
      );
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [realtime, realtimeTable, realtimeFilter, executeQuery]);

  // Setup refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        // Only refetch if data is stale
        if (!lastFetch || Date.now() - lastFetch > staleTime) {
          executeQuery();
        }
      }, refetchInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, enabled, executeQuery, lastFetch, staleTime]);

  // Refetch on window focus
  useEffect(() => {
    if (refetchOnWindowFocus) {
      const handleFocus = () => {
        if (!lastFetch || Date.now() - lastFetch > staleTime) {
          executeQuery();
        }
      };

      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [refetchOnWindowFocus, executeQuery, lastFetch, staleTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const refetch = useCallback(() => {
    setRetryCount(0);
    executeQuery();
  }, [executeQuery]);

  const isStale = lastFetch ? Date.now() - lastFetch > staleTime : true;

  return {
    data,
    loading,
    error,
    refetch,
    isStale,
    lastFetch,
    retryCount
  };
};

export const useSupabaseMutation = (mutationFn, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    onSettled = null
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(async (variables) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await mutationFn(variables);
      
      setData(result);
      
      if (onSuccess) {
        onSuccess(result, variables);
      }
      
      return result;
    } catch (err) {
      console.error('Mutation failed:', err);
      setError(err);
      
      if (onError) {
        onError(err, variables);
      }
      
      throw err;
    } finally {
      setLoading(false);
      
      if (onSettled) {
        onSettled(data, error);
      }
    }
  }, [mutationFn, onSuccess, onError, onSettled, data, error]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset
  };
};
