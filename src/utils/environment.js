/**
 * Production Environment Configuration
 * Manages different environment settings and feature flags
 */

class EnvironmentConfig {
  constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.loadConfiguration();
    this.featureFlags = this.loadFeatureFlags();

    this.initialize();
  }

  detectEnvironment() {
    // Check URL patterns to determine environment
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168.')) {
      return 'development';
    } else if (hostname.includes('staging') || hostname.includes('test') || hostname.includes('dev')) {
      return 'staging';
    } else if (pathname.includes('test') || window.location.search.includes('test=true')) {
      return 'testing';
    } else {
      return 'production';
    }
  }

  loadConfiguration() {
    const configs = {
      development: {
        debug: true,
        logLevel: 'DEBUG',
        enableAnalytics: false,
        enablePerformanceMonitoring: true,
        enableHealthChecks: true,
        enableErrorReporting: true,
        apiTimeout: 10000,
        maxRetries: 3,
        cacheEnabled: false,
        compressionEnabled: false
      },

      staging: {
        debug: true,
        logLevel: 'INFO',
        enableAnalytics: true,
        enablePerformanceMonitoring: true,
        enableHealthChecks: true,
        enableErrorReporting: true,
        apiTimeout: 8000,
        maxRetries: 2,
        cacheEnabled: true,
        compressionEnabled: true
      },

      testing: {
        debug: false,
        logLevel: 'WARN',
        enableAnalytics: false,
        enablePerformanceMonitoring: false,
        enableHealthChecks: false,
        enableErrorReporting: false,
        apiTimeout: 5000,
        maxRetries: 1,
        cacheEnabled: false,
        compressionEnabled: false
      },

      production: {
        debug: false,
        logLevel: 'ERROR',
        enableAnalytics: true,
        enablePerformanceMonitoring: true,
        enableHealthChecks: true,
        enableErrorReporting: true,
        apiTimeout: 5000,
        maxRetries: 2,
        cacheEnabled: true,
        compressionEnabled: true
      }
    };

    return configs[this.environment] || configs.production;
  }

  loadFeatureFlags() {
    const defaultFlags = {
      // Game features
      enableLeaderboard: true,
      enableDifficultySelection: true,
      enableEyeColorToggle: true,
      enableLanguageSwitch: true,

      // Therapy features
      enableBrightnessControl: true,
      enableContrastControl: true,
      enableProgressTracking: true,

      // Technical features
      enableServiceWorker: true,
      enableWebGL: true,
      enableLocalStorage: true,
      enableSessionReplay: false,

      // Monitoring features
      enablePerformanceTracing: true,
      enableUserBehaviorTracking: true,
      enableErrorBoundaries: true,

      // Accessibility features
      enableHighContrast: true,
      enableKeyboardNavigation: true,
      enableScreenReader: true,

      // Experimental features
      enableBetaFeatures: this.environment === 'development',
      enableAdvancedGraphics: true,
      enableMultipleLanguages: true
    };

    // Load overrides from localStorage (for testing)
    try {
      const savedFlags = localStorage.getItem('featureFlags');
      if (savedFlags) {
        const parsedFlags = JSON.parse(savedFlags);
        return { ...defaultFlags, ...parsedFlags };
      }
    } catch (error) {
      console.warn('Failed to load feature flags from localStorage:', error);
    }

    return defaultFlags;
  }

  initialize() {
    // Set global configuration
    window.ENV_CONFIG = this.config;
    window.FEATURE_FLAGS = this.featureFlags;

    // Configure logging level
    if (window.Logger) {
      localStorage.setItem('logLevel', this.config.logLevel);
    }

    // Apply environment-specific settings
    this.applyEnvironmentSettings();

    this.logInfo('Environment configuration loaded', {
      environment: this.environment,
      config: this.config,
      featureFlags: this.featureFlags
    });
  }

  applyEnvironmentSettings() {
    // Debug mode
    if (this.config.debug) {
      window.DEBUG = true;
      document.body.classList.add('debug-mode');
    }

    // Performance monitoring
    if (!this.config.enablePerformanceMonitoring && window.PerformanceMonitor) {
      window.PerformanceMonitor.destroy();
    }

    // Health checks
    if (!this.config.enableHealthChecks && window.HealthChecker) {
      window.HealthChecker.destroy();
    }

    // Error reporting
    if (!this.config.enableErrorReporting && window.ErrorHandler) {
      window.ErrorHandler.destroy();
    }

    // Analytics
    if (!this.config.enableAnalytics) {
      window[`ga-disable-${window.GA_ID || 'G-HKSKJJB4DJ'}`] = true;
    }

    // Feature-specific CSS classes
    if (this.featureFlags.enableHighContrast) {
      document.body.classList.add('high-contrast-available');
    }

    if (this.featureFlags.enableKeyboardNavigation) {
      document.body.classList.add('keyboard-navigation-enabled');
    }
  }

  // Public API methods
  isProduction() {
    return this.environment === 'production';
  }

  isDevelopment() {
    return this.environment === 'development';
  }

  isFeatureEnabled(flagName) {
    return this.featureFlags[flagName] === true;
  }

  getConfig(key) {
    return this.config[key];
  }

  setFeatureFlag(flagName, enabled) {
    this.featureFlags[flagName] = enabled;

    // Save to localStorage
    try {
      localStorage.setItem('featureFlags', JSON.stringify(this.featureFlags));
    } catch (error) {
      console.warn('Failed to save feature flags:', error);
    }

    this.logInfo('Feature flag updated', { flagName, enabled });
  }

  toggleFeatureFlag(flagName) {
    const currentValue = this.featureFlags[flagName];
    this.setFeatureFlag(flagName, !currentValue);
    return !currentValue;
  }

  // Environment-specific utilities
  shouldEnableAnalytics() {
    return this.config.enableAnalytics &&
           this.isFeatureEnabled('enableUserBehaviorTracking') &&
           localStorage.getItem('cookieConsent') === 'granted';
  }

  shouldUseCache() {
    return this.config.cacheEnabled && this.isFeatureEnabled('enableLocalStorage');
  }

  getApiTimeout() {
    return this.config.apiTimeout;
  }

  getMaxRetries() {
    return this.config.maxRetries;
  }

  // Development helpers
  showDebugInfo() {
    if (!this.isDevelopment()) {return;}

    const debugInfo = {
      environment: this.environment,
      config: this.config,
      featureFlags: this.featureFlags,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      performance: window.performance ? {
        now: performance.now(),
        memory: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
        } : 'Not available'
      } : 'Not available'
    };

    console.table(debugInfo);
    return debugInfo;
  }

  createDebugPanel() {
    if (!this.isDevelopment()) {return;}

    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 11px;
      max-width: 300px;
      z-index: 9999;
      display: none;
    `;

    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Debug';
    toggleButton.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: #2196f3;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      z-index: 10000;
    `;

    toggleButton.onclick = () => {
      if (panel.style.display === 'none') {
        panel.style.display = 'block';
        toggleButton.style.display = 'none';
        this.updateDebugPanel(panel);
      }
    };

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      float: right;
      background: transparent;
      color: white;
      border: none;
      cursor: pointer;
      margin-left: 10px;
    `;

    closeButton.onclick = () => {
      panel.style.display = 'none';
      toggleButton.style.display = 'block';
    };

    panel.appendChild(closeButton);
    document.body.appendChild(panel);
    document.body.appendChild(toggleButton);

    return panel;
  }

  updateDebugPanel(panel) {
    const info = this.showDebugInfo();
    panel.innerHTML = `
      <button style="float: right; background: transparent; color: white; border: none; cursor: pointer;" onclick="this.parentElement.style.display='none'; document.querySelector('button').style.display='block';">×</button>
      <h3 style="margin: 0 0 10px 0;">Debug Info</h3>
      <div><strong>Environment:</strong> ${info.environment}</div>
      <div><strong>Debug Mode:</strong> ${info.config.debug}</div>
      <div><strong>Log Level:</strong> ${info.config.logLevel}</div>
      <div><strong>Analytics:</strong> ${info.config.enableAnalytics}</div>
      <div><strong>Performance:</strong> ${info.config.enablePerformanceMonitoring}</div>
      <div style="margin-top: 10px;"><strong>Memory:</strong> ${info.performance.memory.used}</div>
      <div><strong>Viewport:</strong> ${info.viewport.width}x${info.viewport.height}</div>
    `;
  }

  // Export configuration
  exportConfiguration() {
    const exportData = {
      environment: this.environment,
      config: this.config,
      featureFlags: this.featureFlags,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)],
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `environment-config-${this.environment}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  // Logging helper
  logInfo(message, data) {
    if (window.Logger) {
      window.Logger.info(`[Environment] ${message}`, data);
    }
  }
}

// Create global environment configuration
window.EnvironmentConfig = new EnvironmentConfig();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnvironmentConfig;
}
