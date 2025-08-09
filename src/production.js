/**
 * Production System Initialization
 * Orchestrates the loading and initialization of all production systems
 * Ensures proper startup order and error handling
 */

class ProductionInit {
  constructor() {
    this.systems = [];
    this.initializationErrors = [];
    this.startTime = performance.now();
    this.isInitialized = false;

    this.initialize();
  }

  async initialize() {
    try {
      console.log('🚀 Starting Production Systems...');

      // Initialize systems in order of dependency
      await this.initializeCore();
      await this.initializeMonitoring();
      await this.initializeGameSystems();
      await this.initializeUI();
      await this.finalizeInitialization();

      this.isInitialized = true;
      const initTime = performance.now() - this.startTime;

      console.log(`✅ Production systems initialized in ${initTime.toFixed(2)}ms`);

      if (window.Logger) {
        window.Logger.info('Production initialization completed', {
          initializationTime: initTime,
          systems: this.systems.map(s => s.name),
          errors: this.initializationErrors
        });
      }

    } catch (error) {
      console.error('❌ Production initialization failed:', error);
      this.handleInitializationFailure(error);
    }
  }

  async initializeCore() {
    // 1. Environment Configuration (must be first)
    await this.loadSystem('Environment Configuration', () => {
      // Environment config is already loaded globally
      this.systems.push({
        name: 'Environment',
        instance: window.EnvironmentConfig,
        status: 'loaded'
      });
    });

    // 2. Logger (depends on environment)
    await this.loadSystem('Logger', () => {
      // Logger is already loaded globally
      this.systems.push({
        name: 'Logger',
        instance: window.Logger,
        status: 'loaded'
      });
    });

    // 3. Error Handler (depends on logger)
    await this.loadSystem('Error Handler', () => {
      // Error handler is already loaded globally
      this.systems.push({
        name: 'ErrorHandler',
        instance: window.ErrorHandler,
        status: 'loaded'
      });
    });
  }

  async initializeMonitoring() {
    // 4. Performance Monitor
    await this.loadSystem('Performance Monitor', () => {
      if (window.EnvironmentConfig.getConfig('enablePerformanceMonitoring')) {
        this.systems.push({
          name: 'PerformanceMonitor',
          instance: window.PerformanceMonitor,
          status: 'loaded'
        });
      }
    });

    // 5. Health Checker
    await this.loadSystem('Health Checker', () => {
      if (window.EnvironmentConfig.getConfig('enableHealthChecks')) {
        this.systems.push({
          name: 'HealthChecker',
          instance: window.HealthChecker,
          status: 'loaded'
        });
      }
    });
  }

  async initializeGameSystems() {
    // 6. Alert System
    await this.loadSystem('Alert System', () => {
      this.systems.push({
        name: 'AlertSystem',
        instance: window.AlertSystem,
        status: 'loaded'
      });
    });

    // 7. Service Worker (if enabled)
    await this.loadSystem('Service Worker', async () => {
      if (window.EnvironmentConfig.isFeatureEnabled('enableServiceWorker') && 'serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          this.systems.push({
            name: 'ServiceWorker',
            instance: registration,
            status: 'loaded'
          });
        } catch (error) {
          console.warn('Service Worker registration failed:', error);
        }
      }
    });
  }

  async initializeUI() {
    // 8. Development tools (development only)
    await this.loadSystem('Development Tools', () => {
      if (window.EnvironmentConfig.isDevelopment()) {
        this.setupDevelopmentTools();
      }
    });

    // 9. Accessibility enhancements
    await this.loadSystem('Accessibility', () => {
      this.setupAccessibility();
    });

    // 10. Keyboard shortcuts
    await this.loadSystem('Keyboard Shortcuts', () => {
      this.setupKeyboardShortcuts();
    });
  }

  async finalizeInitialization() {
    // Show initialization complete message
    if (window.AlertSystem && window.EnvironmentConfig.isDevelopment()) {
      window.AlertSystem.success(
        'Systems Ready',
        'All production systems have been initialized successfully.'
      );
    }

    // Set up global error boundary
    this.setupGlobalErrorBoundary();

    // Initialize analytics if enabled
    if (window.EnvironmentConfig.shouldEnableAnalytics()) {
      this.initializeAnalytics();
    }

    // Dispatch ready event
    window.dispatchEvent(new CustomEvent('productionSystemsReady', {
      detail: {
        systems: this.systems,
        initializationTime: performance.now() - this.startTime
      }
    }));
  }

  async loadSystem(name, initializer) {
    try {
      const startTime = performance.now();
      await initializer();
      const loadTime = performance.now() - startTime;

      console.log(`✓ ${name} loaded (${loadTime.toFixed(2)}ms)`);
    } catch (error) {
      console.error(`✗ ${name} failed to load:`, error);
      this.initializationErrors.push({ name, error: error.message });
    }
  }

  setupDevelopmentTools() {
    // Create debug panel
    if (window.EnvironmentConfig.createDebugPanel) {
      window.EnvironmentConfig.createDebugPanel();
    }

    // Add development shortcuts
    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey) {
        switch (event.code) {
        case 'KeyD':
          event.preventDefault();
          this.toggleDebugMode();
          break;
        case 'KeyH':
          event.preventDefault();
          if (window.HealthChecker) {
            window.HealthChecker.toggleDashboard();
          }
          break;
        case 'KeyL':
          event.preventDefault();
          if (window.Logger) {
            window.Logger.exportLogs();
          }
          break;
        case 'KeyP':
          event.preventDefault();
          if (window.PerformanceMonitor) {
            window.PerformanceMonitor.exportReport();
          }
          break;
        }
      }
    });

    // Add console helpers
    window.debugHelpers = {
      systems: () => this.systems,
      config: () => window.EnvironmentConfig,
      logs: () => window.Logger?.getStatus(),
      health: () => window.HealthChecker?.getHealthStatus(),
      performance: () => window.PerformanceMonitor?.getCurrentMetrics(),
      errors: () => window.ErrorHandler?.getErrorStatistics()
    };

    console.log('🛠️ Development tools available:', Object.keys(window.debugHelpers));
  }

  setupAccessibility() {
    // High contrast mode toggle
    if (window.EnvironmentConfig.isFeatureEnabled('enableHighContrast')) {
      const highContrastStyle = document.createElement('style');
      highContrastStyle.id = 'high-contrast-style';
      highContrastStyle.textContent = `
        .high-contrast-mode {
          filter: contrast(150%) brightness(110%);
        }
        .high-contrast-mode .card {
          border: 2px solid #fff !important;
        }
        .high-contrast-mode button {
          border: 2px solid #fff !important;
        }
      `;
      document.head.appendChild(highContrastStyle);
    }

    // Keyboard navigation
    if (window.EnvironmentConfig.isFeatureEnabled('enableKeyboardNavigation')) {
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
          document.body.classList.add('keyboard-navigation');
        }
      });

      document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
      });
    }

    // Screen reader announcements
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.setAttribute('aria-atomic', 'true');
    ariaLive.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    ariaLive.id = 'aria-announcements';
    document.body.appendChild(ariaLive);

    window.announceToScreenReader = (message) => {
      ariaLive.textContent = message;
      setTimeout(() => ariaLive.textContent = '', 1000);
    };
  }

  setupKeyboardShortcuts() {
    const shortcuts = {
      'KeyR': () => {
        if (document.getElementById('restart')) {
          document.getElementById('restart').click();
        }
      },
      'KeyH': () => {
        this.toggleHelpModal();
      },
      'KeyM': () => {
        this.toggleMute();
      },
      'KeyF': () => {
        this.toggleFullscreen();
      }
    };

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey) {return;} // Ignore modified keys

      const shortcut = shortcuts[event.code];
      if (shortcut) {
        event.preventDefault();
        shortcut();
      }
    });
  }

  setupGlobalErrorBoundary() {
    // Catch any remaining unhandled errors
    window.addEventListener('error', (event) => {
      if (window.ErrorHandler) {
        // ErrorHandler will handle this
        return;
      }

      // Fallback error handling
      console.error('Unhandled error (no error handler):', event.error);
      if (window.AlertSystem) {
        window.AlertSystem.error(
          'System Error',
          'An unexpected error occurred. Please refresh the page.'
        );
      }
    });
  }

  initializeAnalytics() {
    if (typeof gtag === 'function') {
      // Track system initialization
      gtag('event', 'system_initialized', {
        custom_parameter_1: 'production_systems',
        custom_parameter_2: performance.now() - this.startTime
      });

      // Track enabled features
      const enabledFeatures = Object.entries(window.FEATURE_FLAGS)
        .filter(([, enabled]) => enabled)
        .map(([name]) => name);

      gtag('event', 'features_enabled', {
        custom_parameter_1: enabledFeatures.length,
        custom_parameter_2: enabledFeatures.join(',')
      });
    }
  }

  handleInitializationFailure(error) {
    // Show critical error message
    const errorMessage = `
      System initialization failed. The application may not work correctly.
      Error: ${error.message}
      
      Please try refreshing the page. If the problem persists, contact support.
    `;

    if (window.AlertSystem) {
      window.AlertSystem.error('Initialization Failed', errorMessage, {
        autoClose: false,
        actions: [
          { text: 'Refresh Page', action: () => window.location.reload() },
          { text: 'Report Issue', action: () => this.reportInitializationError(error) }
        ]
      });
    } else {
      alert(errorMessage);
    }
  }

  reportInitializationError(error) {
    const errorReport = {
      type: 'initialization_failure',
      error: error.message,
      stack: error.stack,
      systems: this.systems,
      initializationErrors: this.initializationErrors,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // Create downloadable error report
    const blob = new Blob([JSON.stringify(errorReport, null, 2)],
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `initialization-error-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  // Development helpers
  toggleDebugMode() {
    document.body.classList.toggle('debug-mode');
    const isDebugMode = document.body.classList.contains('debug-mode');

    if (window.AlertSystem) {
      window.AlertSystem.info(
        'Debug Mode',
        isDebugMode ? 'Debug mode enabled' : 'Debug mode disabled'
      );
    }
  }

  toggleHelpModal() {
    // Implementation would show help modal
    if (window.AlertSystem) {
      window.AlertSystem.info(
        'Help',
        'Use arrow keys or click cards to play. Match pairs to win!'
      );
    }
  }

  toggleMute() {
    // Implementation would toggle audio
    console.log('Audio toggle not implemented');
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  // Get system status
  getSystemStatus() {
    return {
      isInitialized: this.isInitialized,
      initializationTime: performance.now() - this.startTime,
      systems: this.systems,
      errors: this.initializationErrors
    };
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.ProductionInit = new ProductionInit();
  });
} else {
  // DOM is already ready
  window.ProductionInit = new ProductionInit();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductionInit;
}
