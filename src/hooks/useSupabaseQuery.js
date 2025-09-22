import { useState, useEffect, useCallback } from 'react';
import { supabase, fetchWithErrorHandling, subscribeToTable, getConnectionStatus } from '../supabaseClient';

export const useSupabaseQuery = (queryFn, dependencies = [], options = {}) => {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const executeQuery = useCallback(async () => {
    if (!options.enabled && options.enabled !== undefined) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await queryFn();
      
      if (result.error) {
        throw result.error;
      }
      
      setData(result.data || result);
    } catch (err) {
      console.error('Query error:', err);
      setError(err);
      if (options.onError) {
        options.onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [queryFn, options.enabled]);

  useEffect(() => {
    executeQuery();
  }, [...dependencies, executeQuery]);

  // Real-time subscription
  useEffect(() => {
    if (options.realtime && options.realtimeTable) {
      const subscription = supabase
        .channel(`${options.realtimeTable}-changes`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: options.realtimeTable 
          }, 
          () => {
            executeQuery();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [options.realtime, options.realtimeTable, executeQuery]);

  return {
    data,
    loading,
    error,
    refetch: executeQuery
  };
};

export const useSupabaseMutation = (mutationFn, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (variables) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await mutationFn(variables);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      console.error('Mutation error:', err);
      setError(err);
      
      if (options.onError) {
        options.onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options]);

  return {
    mutate,
    loading,
    error
  };
};
