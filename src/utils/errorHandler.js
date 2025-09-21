export class ErrorHandler {
  static log(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorData);
    }
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorData);
    }
  }
  
  static async sendToErrorService(errorData) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      });
    } catch (e) {
      console.error('Failed to send error to service:', e);
    }
  }
  
  static createErrorBoundary(fallbackComponent) {
    return class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      
      componentDidCatch(error, errorInfo) {
        ErrorHandler.log(error, { errorInfo, component: 'ErrorBoundary' });
      }
      
      render() {
        if (this.state.hasError) {
          return fallbackComponent || <div>Something went wrong.</div>;
        }
        return this.props.children;
      }
    };
  }
}

// Global error handler
window.addEventListener('error', (event) => {
  ErrorHandler.log(event.error, { type: 'global' });
});

window.addEventListener('unhandledrejection', (event) => {
  ErrorHandler.log(new Error(event.reason), { type: 'promise' });
});
