import React from 'react';
import { AlertTriangle } from './Icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Track error for analytics
    try {
      const errorEvent = {
        event: 'javascript_error',
        properties: {
          error: error.toString(),
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      };
      
      const errors = JSON.parse(localStorage.getItem('studio37_errors') || '[]');
      errors.push(errorEvent);
      
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }
      
      localStorage.setItem('studio37_errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Error logging failed:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#181818] text-[#F3E3C3] p-8">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
            <p className="text-[#F3E3C3]/70 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <summary className="cursor-pointer text-red-400 font-semibold">Error Details</summary>
                <pre className="text-xs mt-2 text-red-300 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-[#F3E3C3] text-[#1a1a1a] px-6 py-2 rounded-md hover:bg-[#E6D5B8] transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="border border-[#F3E3C3] text-[#F3E3C3] px-6 py-2 rounded-md hover:bg-[#F3E3C3] hover:text-[#1a1a1a] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
