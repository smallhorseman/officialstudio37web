import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export const useSupabaseQuery = (queryFn, deps = [], options = {}) => {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!options.enabled && options.enabled !== undefined) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await queryFn();
      setData(result.data || result);
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Set up real-time subscription if requested
  useEffect(() => {
    if (options.realtime && options.realtimeTable) {
      const subscription = supabase
        .channel(`${options.realtimeTable}_changes`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: options.realtimeTable
          }, 
          () => {
            refetch();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [options.realtime, options.realtimeTable, refetch]);

  return { data, loading, error, refetch };
};

export const useSupabaseMutation = (mutationFn, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (variables) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mutationFn(variables);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      setError(err);
      
      if (options.onError) {
        options.onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options]);

  return { mutate, loading, error };
};
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
