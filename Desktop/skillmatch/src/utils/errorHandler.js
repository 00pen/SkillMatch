// Global error handler for unhandled promise rejections
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (import.meta.env.DEV) {
      console.error('Unhandled promise rejection:', event.reason);
    }
    
    // Log to error reporting service in production
    if (import.meta.env.PROD && window.reportError) {
      window.reportError(event.reason);
    }
    
    // Prevent the default browser behavior
    event.preventDefault();
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    if (import.meta.env.DEV) {
      console.error('Uncaught error:', event.error);
    }
    
    // Log to error reporting service in production
    if (import.meta.env.PROD && window.reportError) {
      window.reportError(event.error);
    }
  });
};

// Utility function to safely handle async operations
export const safeAsync = (asyncFn) => {
  return (...args) => {
    try {
      const result = asyncFn(...args);
      if (result && typeof result.catch === 'function') {
        return result.catch(error => {
          if (import.meta.env.DEV) {
            console.error('Async operation failed:', error);
          }
          throw error;
        });
      }
      return result;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Sync operation failed:', error);
      }
      throw error;
    }
  };
};

// Production-ready error handler
export const handleError = (error, context = '') => {
  const errorMessage = error?.message || 'Unknown error occurred';
  
  if (import.meta.env.DEV) {
    console.error(`Error ${context ? `in ${context}` : ''}:`, error);
  }
  
  // In production, you could send to an error reporting service
  if (import.meta.env.PROD && window.reportError) {
    window.reportError(error, context);
  }
  
  return errorMessage;
};

// User-friendly error messages
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  
  if (error?.message) {
    // Common API error patterns
    if (error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (error.message.includes('User already registered')) {
      return 'An account with this email already exists.';
    }
    if (error.message.includes('Network Error')) {
      return 'Network connection error. Please check your internet connection.';
    }
    if (error.message.includes('Unauthorized')) {
      return 'Your session has expired. Please log in again.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};