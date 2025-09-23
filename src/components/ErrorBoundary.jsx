import React from 'react';
import { AlertTriangle } from './Icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to analytics if available
    if (window.supabase) {
      window.supabase
        .from('system_logs')
        .insert({
          log_type: 'error',
          message: error.toString(),
          details: {
            componentStack: errorInfo.componentStack,
            error: {
              message: error.message,
              stack: error.stack
            }
          },
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        })
        .then(({ error: logError }) => {
          if (logError) console.error('Failed to log error:', logError);
        });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#181818] text-[#F3E3C3]">
          <div className="text-center p-8 max-w-md">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-[#F3E3C3]/70 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-[#F3E3C3] text-[#1a1a1a] px-6 py-2 rounded-md hover:bg-[#E6D5B8] transition-colors"
              >
                Refresh Page
              </button>
              {import.meta.env.DEV && (
                <details className="text-left bg-[#262626] p-4 rounded-md">
                  <summary className="cursor-pointer text-sm">Error Details</summary>
                  <pre className="mt-2 text-xs text-[#F3E3C3]/60 overflow-auto">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
