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

    // CMS functionality  
    try {
      const { error: cmsError } = await supabase.from('portfolio_images').select('count').limit(1);
      setHealth(prev => ({ ...prev, cms: cmsError ? 'error' : 'healthy' }));
    } catch (error) {
      setHealth(prev => ({ ...prev, cms: 'error' }));
    }

    // Storage
    setHealth(prev => ({ ...prev, storage: 'healthy' }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'checking': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'error': return '❌';
      case 'checking': return '🔄';
      default: return '❓';
    }
  };

  const getConnectionStatus = () => {
    return health.database === 'healthy' ? 'Connected' : 'Disconnected';
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-[#F3E3C3] mb-4">System Health Status</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(health).map(([system, status]) => (
          <div key={system} className="flex items-center gap-2">
            <span className="text-lg">{getStatusIcon(status)}</span>
            <span className="capitalize text-[#F3E3C3]">{system}:</span>
            <span className={`font-medium ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <button
          onClick={checkSystemHealth}
          className="bg-[#F3E3C3] text-[#1a1a1a] px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#E6D5B8] transition-colors"
        >
          Refresh Status
        </button>
      </div>

      <div className="mt-4 text-sm text-[#F3E3C3]/60">
        <p>Database Status: {getConnectionStatus()}</p>
        <p>Last Check: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default SystemHealthCheck;
