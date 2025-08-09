/**
 * Production Error Handler
 * Comprehensive error handling, reporting, and recovery system
 * Provides graceful degradation and user-friendly error messages
 */

class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.errorCounts = {};
    this.recoveryStrategies = new Map();
    this.isInitialized = false;

    this.setupRecoveryStrategies();
    this.initialize();
  }

  initialize() {
    if (this.isInitialized) {return;}

    // Global error handlers
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));

    // Override console.error to capture manual errors
    this.originalConsoleError = console.error;
    console.error = (...args) => {
      this.captureConsoleError(args);
      this.originalConsoleError.apply(console, args);
    };

    this.isInitialized = true;
    this.logInfo('Error Handler initialized');
  }

  setupRecoveryStrategies() {
    // Game-specific recovery strategies
    this.recoveryStrategies.set('GameInitializationError', () => {
      this.showErrorWithRecovery(
        'Game Initialization Failed',
        'Unable to start the game. This might be due to browser compatibility issues.',
        [
          { text: 'Retry', action: () => window.location.reload() },
          { text: 'Report Issue', action: () => this.reportError() }
        ]
      );
    });

    this.recoveryStrategies.set('LocalStorageError', () => {
      this.showErrorWithRecovery(
        'Storage Error',
        'Unable to save game progress. Your browser may have disabled local storage.',
        [
          { text: 'Continue Without Saving', action: () => this.disableLocalStorage() },
          { text: 'Help', action: () => this.showStorageHelp() }
        ]
      );
    });

    this.recoveryStrategies.set('RenderError', () => {
      this.showErrorWithRecovery(
        'Rendering Error',
        'Graphics rendering failed. The game may not display correctly.',
        [
          { text: 'Try Low Graphics Mode', action: () => this.enableLowGraphicsMode() },
          { text: 'Refresh Page', action: () => window.location.reload() }
        ]
      );
    });

    this.recoveryStrategies.set('NetworkError', () => {
      this.showErrorWithRecovery(
        'Network Error',
        'Unable to connect to analytics services. Your progress will be saved locally.',
        [
          { text: 'Continue Offline', action: () => this.enableOfflineMode() },
          { text: 'Check Connection', action: () => this.testConnection() }
        ]
      );
    });

    this.recoveryStrategies.set('PerformanceError', () => {
      this.showErrorWithRecovery(
        'Performance Issue',
        'The game is running slowly. This may affect the gameplay experience.',
        [
          { text: 'Reduce Quality', action: () => this.reduceGraphicsQuality() },
          { text: 'Continue Anyway', action: () => {} }
        ]
      );
    });
  }

  handleError(event) {
    const error = {
      type: 'JavaScript Error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error ? event.error.stack : 'No stack trace',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.recordError(error);
    this.attemptRecovery(error);
  }

  handlePromiseRejection(event) {
    const error = {
      type: 'Unhandled Promise Rejection',
      message: event.reason ? event.reason.toString() : 'Unknown promise rejection',
      stack: event.reason && event.reason.stack ? event.reason.stack : 'No stack trace',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.recordError(error);
    this.attemptRecovery(error);

    // Prevent the default behavior
    event.preventDefault();
  }

  captureConsoleError(args) {
    const error = {
      type: 'Console Error',
      message: args.join(' '),
      timestamp: new Date().toISOString(),
      stack: new Error().stack,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.recordError(error);
  }

  recordError(error) {
    // Add error to collection
    this.errors.push(error);

    // Limit error collection size
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Count error types
    const errorKey = this.getErrorKey(error);
    this.errorCounts[errorKey] = (this.errorCounts[errorKey] || 0) + 1;

    // Log to system
    this.logError('Error captured', error);

    // Check for error patterns
    this.checkErrorPatterns(errorKey);
  }

  getErrorKey(error) {
    // Create a key for grouping similar errors
    const message = error.message || '';
    const filename = error.filename || '';
    return `${error.type}:${filename}:${message.substring(0, 50)}`;
  }

  checkErrorPatterns(errorKey) {
    const count = this.errorCounts[errorKey];

    // If the same error occurs multiple times, it might indicate a systemic issue
    if (count === 3) {
      this.logWarning('Recurring error pattern detected', { errorKey, count });
    } else if (count >= 5) {
      this.logError('Critical error pattern detected', { errorKey, count });
      this.handleCriticalErrorPattern(errorKey);
    }
  }

  handleCriticalErrorPattern(errorKey) {
    // Attempt global recovery for critical patterns
    if (errorKey.includes('LocalStorage')) {
      this.disableLocalStorage();
    } else if (errorKey.includes('Canvas') || errorKey.includes('WebGL')) {
      this.enableLowGraphicsMode();
    } else if (errorKey.includes('Network') || errorKey.includes('fetch')) {
      this.enableOfflineMode();
    }
  }

  attemptRecovery(error) {
    const errorType = this.classifyError(error);
    const strategy = this.recoveryStrategies.get(errorType);

    if (strategy) {
      try {
        strategy();
      } catch (recoveryError) {
        this.logError('Recovery strategy failed', { originalError: error, recoveryError });
      }
    } else {
      // Generic error handling
      this.showGenericError(error);
    }
  }

  classifyError(error) {
    const message = error.message ? error.message.toLowerCase() : '';
    const stack = error.stack ? error.stack.toLowerCase() : '';
    const filename = error.filename ? error.filename.toLowerCase() : '';

    if (message.includes('localstorage') || message.includes('quotaexceeded')) {
      return 'LocalStorageError';
    }

    if (message.includes('canvas') || message.includes('webgl') || filename.includes('game.js')) {
      return 'RenderError';
    }

    if (message.includes('network') || message.includes('fetch') || message.includes('xmlhttprequest')) {
      return 'NetworkError';
    }

    if (message.includes('performance') || message.includes('slow')) {
      return 'PerformanceError';
    }

    if (filename.includes('game.js') || stack.includes('game.js')) {
      return 'GameInitializationError';
    }

    return 'GenericError';
  }

  showErrorWithRecovery(title, message, actions) {
    if (window.AlertSystem) {
      window.AlertSystem.error(title, message, {
        autoClose: false,
        actions: actions.map(action => ({
          text: action.text,
          type: action.type || 'secondary',
          callback: action.action
        }))
      });
    } else {
      // Fallback to native alert
      alert(`${title}: ${message}`);
    }
  }

  showGenericError(error) {
    const message = `An unexpected error occurred: ${error.message}`;
    this.showErrorWithRecovery(
      'Unexpected Error',
      message,
      [
        { text: 'Reload Page', action: () => window.location.reload() },
        { text: 'Report Issue', action: () => this.reportError(error) }
      ]
    );
  }

  // Recovery actions
  disableLocalStorage() {
    window.localStorage.disabled = true;
    this.logInfo('Local storage disabled due to errors');

    if (window.AlertSystem) {
      window.AlertSystem.info('Storage Disabled', 'Game progress will not be saved this session.');
    }
  }

  enableLowGraphicsMode() {
    document.body.classList.add('low-graphics-mode');
    this.logInfo('Low graphics mode enabled');

    if (window.AlertSystem) {
      window.AlertSystem.info('Low Graphics Mode', 'Graphics quality reduced for better compatibility.');
    }
  }

  enableOfflineMode() {
    window.offlineMode = true;
    this.logInfo('Offline mode enabled');

    if (window.AlertSystem) {
      window.AlertSystem.info('Offline Mode', 'Running in offline mode - analytics disabled.');
    }
  }

  reduceGraphicsQuality() {
    if (window.PerformanceMonitor) {
      // Reduce animation frame rate
      document.documentElement.style.setProperty('--animation-duration', '0.5s');
    }

    this.logInfo('Graphics quality reduced');
  }

  showStorageHelp() {
    const helpMessage = `
      To enable local storage:
      1. Check if you're in private/incognito mode
      2. Clear browser data and try again
      3. Enable cookies in browser settings
      4. Ensure you have sufficient storage space
    `;

    if (window.AlertSystem) {
      window.AlertSystem.info('Storage Help', helpMessage);
    }
  }

  async testConnection() {
    try {
      const response = await fetch('data:text/plain,ping', { method: 'HEAD' });
      if (response.ok) {
        if (window.AlertSystem) {
          window.AlertSystem.success('Connection OK', 'Your internet connection is working.');
        }
      }
    } catch (error) {
      if (window.AlertSystem) {
        window.AlertSystem.error('Connection Failed', 'Unable to connect to the internet.');
      }
    }
  }

  reportError(error = null) {
    const reportData = {
      timestamp: new Date().toISOString(),
      specificError: error,
      recentErrors: this.errors.slice(-5), // Last 5 errors
      errorCounts: this.errorCounts,
      systemInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        onLine: navigator.onLine,
        url: window.location.href
      }
    };

    // Create downloadable error report
    const blob = new Blob([JSON.stringify(reportData, null, 2)],
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);

    if (window.AlertSystem) {
      window.AlertSystem.success('Report Generated', 'Error report downloaded. Please send it to support.');
    }
  }

  // Get error statistics
  getErrorStatistics() {
    const totalErrors = this.errors.length;
    const errorTypes = {};

    this.errors.forEach(error => {
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
    });

    return {
      totalErrors,
      errorTypes,
      errorCounts: this.errorCounts,
      recentErrors: this.errors.slice(-10)
    };
  }

  // Clear error history
  clearErrors() {
    this.errors = [];
    this.errorCounts = {};
    this.logInfo('Error history cleared');
  }

  // Logging helpers
  logInfo(message, data) {
    if (window.Logger) {
      window.Logger.info(`[ErrorHandler] ${message}`, data);
    }
  }

  logWarning(message, data) {
    if (window.Logger) {
      window.Logger.warn(`[ErrorHandler] ${message}`, data);
    }
  }

  logError(message, error) {
    if (window.Logger) {
      window.Logger.error(`[ErrorHandler] ${message}`, error);
    }
  }

  // Cleanup
  destroy() {
    window.removeEventListener('error', this.handleError);
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
    console.error = this.originalConsoleError;
    this.isInitialized = false;
    this.logInfo('Error Handler destroyed');
  }
}

// Create global error handler
window.ErrorHandler = new ErrorHandler();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
}
