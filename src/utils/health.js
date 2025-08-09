/**
 * Production Health Check System
 * Monitors application health and provides system status information
 * Includes connectivity checks, browser compatibility, and resource availability
 */

class HealthChecker {
  constructor() {
    this.healthStatus = {
      overall: 'unknown',
      browser: 'unknown',
      connectivity: 'unknown',
      localStorage: 'unknown',
      performance: 'unknown',
      webgl: 'unknown',
      analytics: 'unknown'
    };

    this.lastCheck = null;
    this.checkInterval = 30000; // 30 seconds
    this.intervalId = null;

    this.initialize();
  }

  initialize() {
    this.performHealthCheck();
    this.startPeriodicChecks();
    this.setupEventListeners();

    this.logInfo('Health Checker initialized');
  }

  async performHealthCheck() {
    this.lastCheck = new Date();

    try {
      // Check browser compatibility
      await this.checkBrowserCompatibility();

      // Check local storage
      await this.checkLocalStorage();

      // Check connectivity
      await this.checkConnectivity();

      // Check WebGL support
      await this.checkWebGLSupport();

      // Check performance metrics
      await this.checkPerformance();

      // Check analytics availability
      await this.checkAnalytics();

      // Calculate overall health
      this.calculateOverallHealth();

      this.logInfo('Health check completed', this.healthStatus);

    } catch (error) {
      this.logError('Health check failed', error);
      this.healthStatus.overall = 'critical';
    }
  }

  async checkBrowserCompatibility() {
    const checks = {
      es6: typeof Symbol !== 'undefined',
      localStorage: typeof Storage !== 'undefined',
      canvas: !!document.createElement('canvas').getContext,
      webgl: !!document.createElement('canvas').getContext('webgl'),
      performanceAPI: 'performance' in window,
      requestAnimationFrame: 'requestAnimationFrame' in window,
      fetch: 'fetch' in window,
      promises: 'Promise' in window
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const compatibility = passedChecks / totalChecks;

    if (compatibility >= 0.9) {
      this.healthStatus.browser = 'healthy';
    } else if (compatibility >= 0.7) {
      this.healthStatus.browser = 'warning';
    } else {
      this.healthStatus.browser = 'critical';
    }

    this.logInfo('Browser compatibility check', {
      checks,
      compatibility: `${Math.round(compatibility * 100)}%`
    });
  }

  async checkLocalStorage() {
    try {
      const testKey = 'health_check_test';
      const testValue = 'test_value_' + Date.now();

      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (retrieved === testValue) {
        this.healthStatus.localStorage = 'healthy';
      } else {
        this.healthStatus.localStorage = 'warning';
      }
    } catch (error) {
      this.healthStatus.localStorage = 'critical';
      this.logError('Local storage check failed', error);
    }
  }

  async checkConnectivity() {
    if (!navigator.onLine) {
      this.healthStatus.connectivity = 'critical';
      return;
    }

    try {
      const startTime = performance.now();
      const response = await fetch('data:text/plain,', {
        method: 'HEAD',
        cache: 'no-cache'
      });

      const latency = performance.now() - startTime;

      if (response.ok) {
        if (latency < 100) {
          this.healthStatus.connectivity = 'healthy';
        } else if (latency < 500) {
          this.healthStatus.connectivity = 'warning';
        } else {
          this.healthStatus.connectivity = 'degraded';
        }
      } else {
        this.healthStatus.connectivity = 'warning';
      }

    } catch (error) {
      this.healthStatus.connectivity = 'critical';
      this.logWarning('Connectivity check failed', error);
    }
  }

  async checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      if (gl) {
        // Test basic WebGL functionality
        const renderer = gl.getParameter(gl.RENDERER);
        const vendor = gl.getParameter(gl.VENDOR);

        this.healthStatus.webgl = 'healthy';
        this.logInfo('WebGL support detected', { renderer, vendor });
      } else {
        this.healthStatus.webgl = 'warning';
        this.logWarning('WebGL not supported');
      }

    } catch (error) {
      this.healthStatus.webgl = 'critical';
      this.logError('WebGL check failed', error);
    }
  }

  async checkPerformance() {
    try {
      if (window.PerformanceMonitor) {
        const metrics = window.PerformanceMonitor.getCurrentMetrics();

        let performanceScore = 0;
        let checks = 0;

        // Frame rate check
        if (metrics.frameRate >= 45) {performanceScore++;}
        else if (metrics.frameRate >= 30) {performanceScore += 0.5;}
        checks++;

        // Memory usage check
        if (metrics.memoryUsage < 50) {performanceScore++;}
        else if (metrics.memoryUsage < 100) {performanceScore += 0.5;}
        checks++;

        // Load time check
        if (metrics.loadTime < 2000) {performanceScore++;}
        else if (metrics.loadTime < 5000) {performanceScore += 0.5;}
        checks++;

        const performanceRatio = performanceScore / checks;

        if (performanceRatio >= 0.8) {
          this.healthStatus.performance = 'healthy';
        } else if (performanceRatio >= 0.5) {
          this.healthStatus.performance = 'warning';
        } else {
          this.healthStatus.performance = 'critical';
        }

        this.logInfo('Performance check completed', { metrics, performanceRatio });

      } else {
        this.healthStatus.performance = 'warning';
        this.logWarning('Performance Monitor not available');
      }

    } catch (error) {
      this.healthStatus.performance = 'critical';
      this.logError('Performance check failed', error);
    }
  }

  async checkAnalytics() {
    try {
      // Check if Google Analytics is loaded
      if (typeof gtag === 'function') {
        this.healthStatus.analytics = 'healthy';
      } else if (localStorage.getItem('cookieConsent') === 'denied') {
        this.healthStatus.analytics = 'disabled';
      } else {
        this.healthStatus.analytics = 'warning';
      }

    } catch (error) {
      this.healthStatus.analytics = 'critical';
      this.logError('Analytics check failed', error);
    }
  }

  calculateOverallHealth() {
    const statuses = Object.values(this.healthStatus);
    const healthyCount = statuses.filter(s => s === 'healthy').length;
    const warningCount = statuses.filter(s => s === 'warning').length;
    const criticalCount = statuses.filter(s => s === 'critical').length;

    if (criticalCount > 0) {
      this.healthStatus.overall = 'critical';
    } else if (warningCount > healthyCount) {
      this.healthStatus.overall = 'warning';
    } else {
      this.healthStatus.overall = 'healthy';
    }
  }

  startPeriodicChecks() {
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, this.checkInterval);
  }

  stopPeriodicChecks() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setupEventListeners() {
    // Online/offline events
    window.addEventListener('online', () => {
      this.logInfo('Connection restored');
      this.checkConnectivity();
    });

    window.addEventListener('offline', () => {
      this.logWarning('Connection lost');
      this.healthStatus.connectivity = 'critical';
    });

    // Visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Tab became visible, perform quick health check
        setTimeout(() => this.performHealthCheck(), 1000);
      }
    });
  }

  // Get health status for display
  getHealthStatus() {
    return {
      ...this.healthStatus,
      lastCheck: this.lastCheck,
      uptime: this.getUptime()
    };
  }

  getUptime() {
    if (window.Logger) {
      const status = window.Logger.getStatus();
      return status.uptime;
    }
    return 0;
  }

  // Create health dashboard
  createHealthDashboard() {
    const dashboard = document.createElement('div');
    dashboard.id = 'health-dashboard';
    dashboard.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9998;
      min-width: 200px;
      display: none;
    `;

    this.updateDashboard(dashboard);
    document.body.appendChild(dashboard);

    return dashboard;
  }

  updateDashboard(dashboard) {
    const status = this.getHealthStatus();
    const getStatusColor = (status) => {
      switch (status) {
      case 'healthy': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'critical': return '#f44336';
      case 'disabled': return '#9e9e9e';
      default: return '#2196f3';
      }
    };

    dashboard.innerHTML = `
      <div style="margin-bottom: 8px; font-weight: bold;">
        System Health: <span style="color: ${getStatusColor(status.overall)}">${status.overall.toUpperCase()}</span>
      </div>
      <div>Browser: <span style="color: ${getStatusColor(status.browser)}">${status.browser}</span></div>
      <div>Connectivity: <span style="color: ${getStatusColor(status.connectivity)}">${status.connectivity}</span></div>
      <div>Storage: <span style="color: ${getStatusColor(status.localStorage)}">${status.localStorage}</span></div>
      <div>Performance: <span style="color: ${getStatusColor(status.performance)}">${status.performance}</span></div>
      <div>WebGL: <span style="color: ${getStatusColor(status.webgl)}">${status.webgl}</span></div>
      <div>Analytics: <span style="color: ${getStatusColor(status.analytics)}">${status.analytics}</span></div>
      <div style="margin-top: 8px; font-size: 10px; opacity: 0.7;">
        Last check: ${status.lastCheck ? status.lastCheck.toLocaleTimeString() : 'Never'}<br>
        Uptime: ${Math.round(status.uptime / 1000)}s
      </div>
    `;
  }

  // Toggle dashboard visibility
  toggleDashboard() {
    let dashboard = document.getElementById('health-dashboard');
    if (!dashboard) {
      dashboard = this.createHealthDashboard();
    }

    if (dashboard.style.display === 'none') {
      dashboard.style.display = 'block';
      this.updateDashboard(dashboard);
    } else {
      dashboard.style.display = 'none';
    }
  }

  // Generate health report
  generateHealthReport() {
    const status = this.getHealthStatus();
    const recommendations = this.generateHealthRecommendations();

    return {
      timestamp: new Date().toISOString(),
      status,
      recommendations,
      systemInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency
      }
    };
  }

  generateHealthRecommendations() {
    const recommendations = [];

    if (this.healthStatus.browser === 'critical') {
      recommendations.push('Update your browser to the latest version for optimal performance');
    }

    if (this.healthStatus.connectivity === 'critical') {
      recommendations.push('Check your internet connection');
    }

    if (this.healthStatus.localStorage === 'critical') {
      recommendations.push('Enable cookies and local storage in your browser settings');
    }

    if (this.healthStatus.performance === 'critical') {
      recommendations.push('Close other applications or tabs to improve performance');
    }

    if (this.healthStatus.webgl === 'critical') {
      recommendations.push('Update your graphics drivers or try a different browser');
    }

    return recommendations;
  }

  // Logging helpers
  logInfo(message, data) {
    if (window.Logger) {
      window.Logger.info(`[Health] ${message}`, data);
    }
  }

  logWarning(message, data) {
    if (window.Logger) {
      window.Logger.warn(`[Health] ${message}`, data);
    }
  }

  logError(message, error) {
    if (window.Logger) {
      window.Logger.error(`[Health] ${message}`, error);
    }
  }

  // Cleanup
  destroy() {
    this.stopPeriodicChecks();
    const dashboard = document.getElementById('health-dashboard');
    if (dashboard) {
      dashboard.remove();
    }
    this.logInfo('Health Checker destroyed');
  }
}

// Create global health checker
window.HealthChecker = new HealthChecker();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HealthChecker;
}
