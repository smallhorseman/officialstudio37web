import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const SystemHealthCheck = () => {
  const [health, setHealth] = useState({
    database: 'checking',
    storage: 'checking',
    crm: 'checking',
    cms: 'checking'
  });

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    // Database connectivity
    try {
      const { data, error } = await supabase.from('portfolio_images').select('count').limit(1);
      setHealth(prev => ({ ...prev, database: error ? 'error' : 'healthy' }));
    } catch (error) {
      setHealth(prev => ({ ...prev, database: 'error' }));
    }

    // CRM functionality
    try {
      const { error: crmError } = await supabase.from('leads').select('count').limit(1);
      setHealth(prev => ({ ...prev, crm: crmError ? 'error' : 'healthy' }));
    } catch (error) {
      setHealth(prev => ({ ...prev, crm: 'error' }));
    }

    // Storage check
    try {
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      setHealth(prev => ({ ...prev, storage: storageError ? 'error' : 'healthy' }));
    } catch (error) {
      setHealth(prev => ({ ...prev, storage: 'error' }));
    }

    // CMS check
    try {
      const { error: cmsError } = await supabase.from('portfolio_images').select('count').limit(1);
      setHealth(prev => ({ ...prev, cms: cmsError ? 'error' : 'healthy' }));
    } catch (error) {
      setHealth(prev => ({ ...prev, cms: 'error' }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'checking': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'healthy': return 'Operational';
      case 'error': return 'Error';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <div className="system-health-check bg-[#262626] rounded-lg p-6">
      <h3 className="text-xl font-display mb-4 text-[#F3E3C3]">System Health</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(health).map(([service, status]) => (
          <div key={service} className="bg-[#1a1a1a] rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#F3E3C3] capitalize">
                {service.replace('_', ' ')}
              </span>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
            </div>
            <p className="text-xs text-[#F3E3C3]/60">{getStatusText(status)}</p>
          </div>
        ))}
      </div>
      
      <button
        onClick={checkSystemHealth}
        className="mt-4 w-full bg-[#F3E3C3] text-[#1a1a1a] py-2 rounded font-semibold hover:bg-[#E6D5B8] transition-colors"
      >
        Refresh Status
      </button>
    </div>
  );
};

export default SystemHealthCheck;
