import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('🚨 ERROR BOUNDARY CAUGHT ERROR:', error);
    console.error('🚨 ERROR INFO:', errorInfo);
    console.error('🚨 ERROR STACK:', error.stack);
    console.error('🚨 COMPONENT STACK:', errorInfo.componentStack);
    
    // Store error details in state
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to localStorage for persistence
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: errorInfo,
        userAgent: navigator.userAgent,
        url: window.location.href,
        environment: process.env.NODE_ENV
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('finmate_error_logs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 10 error logs
      if (existingLogs.length > 10) {
        existingLogs.splice(0, existingLogs.length - 10);
      }
      
      localStorage.setItem('finmate_error_logs', JSON.stringify(existingLogs));
    } catch (logError) {
      console.error('🚨 Failed to log error to localStorage:', logError);
    }
  }

  handleReload = () => {
    // Clear error state and reload
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
    
    // Force page reload as last resort
    window.location.reload();
  };

  handleReset = () => {
    // Just reset error state without page reload
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Production-safe error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Beklenmeyen Bir Hata Oluştu
              </h3>
              
              <p className="text-sm text-gray-500 mb-6">
                Üzgünüz, uygulama beklenmeyen bir hatayla karşılaştı. 
                Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-left">
                  <p className="text-xs font-mono text-red-800 break-all">
                    <strong>Error:</strong> {this.state.error.message}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    <strong>ID:</strong> {this.state.errorId}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Tekrar Dene
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Sayfayı Yenile
                </button>
              </div>
              
              <p className="text-xs text-gray-400 mt-4">
                Sorun devam ederse, lütfen destek ekibiyle iletişime geçin.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
