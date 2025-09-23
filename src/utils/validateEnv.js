// Environment variable validation utility

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const optionalEnvVars = [
  'VITE_ADMIN_USERNAME',
  'VITE_ADMIN_PASSWORD',
  'VITE_HUBSPOT_API_KEY',
  'VITE_ENABLE_ANALYTICS'
];

export const validateEnvironment = () => {
  const missing = [];
  const warnings = [];
  
  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!import.meta.env[varName]) {
      missing.push(varName);
    }
  });
  
  // Check optional variables
  optionalEnvVars.forEach(varName => {
    if (!import.meta.env[varName]) {
      warnings.push(varName);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('Please create a .env file with the required variables');
  }
  
  if (warnings.length > 0 && import.meta.env.DEV) {
    console.warn('⚠️ Missing optional environment variables:', warnings);
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
};

// Auto-validate on import in development
if (import.meta.env.DEV) {
  validateEnvironment();
}
