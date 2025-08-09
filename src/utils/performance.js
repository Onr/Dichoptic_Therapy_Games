/**
 * Production Performance Monitor
 * Tracks and analyzes application performance metrics
 * Provides alerts for performance issues and optimization suggestions
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      // Timing metrics
      loadTime: 0,
      renderTime: 0,
      gameInitTime: 0,

      // Resource metrics
      memoryUsage: 0,
      frameRate: 0,

      // User interaction metrics
      inputLag: [],
      clickResponsiveness: [],

      // Game-specific metrics
      cardFlipTime: [],
      matchingTime: [],
      gameMetrics: {},

      // Network metrics
      analyticsLatency: [],

      // Error metrics
      errors: 0,
      warnings: 0
    };

    this.thresholds = {
      maxLoadTime: 3000,      // 3 seconds
      minFrameRate: 30,       // 30 FPS
      maxInputLag: 100,       // 100ms
      maxMemoryUsage: 100,    // 100MB
      maxRenderTime: 16       // 16ms (60 FPS)
    };

    this.isMonitoring = false;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.frameRates = [];

    this.initialize();
  }

  initialize() {
    // Performance observer for various metrics
    if ('PerformanceObserver' in window) {
      this.setupPerformanceObserver();
    }

    // Memory monitoring
    if ('memory' in performance) {
      this.startMemoryMonitoring();
    }

    // Frame rate monitoring
    this.startFrameRateMonitoring();

    // Input lag monitoring
    this.setupInputMonitoring();

    this.logInfo('Performance Monitor initialized');
  }

  setupPerformanceObserver() {
    try {
      // Navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.loadTime = entry.loadEventEnd - entry.loadEventStart;

          if (this.metrics.loadTime > this.thresholds.maxLoadTime) {
            this.alertPerformanceIssue('Load Time', this.metrics.loadTime, 'ms');
          }

          this.logInfo('Page load time recorded', { loadTime: this.metrics.loadTime });
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });

      // Resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.responseEnd - entry.startTime > 1000) {
            this.logWarning('Slow resource loading', {
              resource: entry.name,
              duration: entry.responseEnd - entry.startTime
            });
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Measure timing
      const measureObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.startsWith('game-')) {
            this.recordGameMetric(entry.name, entry.duration);
          }
        }
      });
      measureObserver.observe({ entryTypes: ['measure'] });

    } catch (error) {
      this.logError('Performance Observer setup failed', error);
    }
  }

  // Record game-specific metrics
  recordGameMetric(metricName, duration) {
    this.logInfo('Game metric recorded', { metricName, duration });

    // Store the metric for analysis
    if (!this.metrics.gameMetrics) {
      this.metrics.gameMetrics = {};
    }

    if (!this.metrics.gameMetrics[metricName]) {
      this.metrics.gameMetrics[metricName] = [];
    }

    this.metrics.gameMetrics[metricName].push(duration);

    // Keep only last 50 measurements per metric
    if (this.metrics.gameMetrics[metricName].length > 50) {
      this.metrics.gameMetrics[metricName].shift();
    }
  }

  startMemoryMonitoring() {
    setInterval(() => {
      if (performance.memory) {
        const memoryMB = performance.memory.usedJSHeapSize / 1024 / 1024;
        this.metrics.memoryUsage = memoryMB;

        if (memoryMB > this.thresholds.maxMemoryUsage) {
          this.alertPerformanceIssue('Memory Usage', memoryMB, 'MB');
        }
      }
    }, 10000); // Check every 10 seconds
  }

  startFrameRateMonitoring() {
    const measureFrameRate = () => {
      if (!this.isMonitoring) {return;}

      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;

      const fps = 1000 / deltaTime;
      this.frameRates.push(fps);

      // Keep only last 60 measurements (1 second at 60fps)
      if (this.frameRates.length > 60) {
        this.frameRates.shift();
      }

      // Calculate average FPS
      const avgFps = this.frameRates.reduce((a, b) => a + b, 0) / this.frameRates.length;
      this.metrics.frameRate = avgFps;

      // Check for low frame rate
      if (avgFps < this.thresholds.minFrameRate && this.frameRates.length >= 60) {
        this.alertPerformanceIssue('Frame Rate', avgFps, 'FPS');
      }

      requestAnimationFrame(measureFrameRate);
    };

    this.isMonitoring = true;
    requestAnimationFrame(measureFrameRate);
  }

  setupInputMonitoring() {
    let inputStartTime = 0;

    // Mouse click monitoring
    document.addEventListener('mousedown', () => {
      inputStartTime = performance.now();
    });

    document.addEventListener('mouseup', () => {
      if (inputStartTime > 0) {
        const responsiveness = performance.now() - inputStartTime;
        this.metrics.clickResponsiveness.push(responsiveness);

        // Keep only last 10 measurements
        if (this.metrics.clickResponsiveness.length > 10) {
          this.metrics.clickResponsiveness.shift();
        }

        if (responsiveness > this.thresholds.maxInputLag) {
          this.alertPerformanceIssue('Input Lag', responsiveness, 'ms');
        }
      }
    });

    // Touch monitoring for mobile
    document.addEventListener('touchstart', () => {
      inputStartTime = performance.now();
    });

    document.addEventListener('touchend', () => {
      if (inputStartTime > 0) {
        const responsiveness = performance.now() - inputStartTime;
        this.metrics.clickResponsiveness.push(responsiveness);
      }
    });
  }

  // Game-specific performance tracking
  startGamePerformance(difficulty) {
    performance.mark('game-start');
    this.currentGameStart = performance.now();
    this.logInfo('Game performance tracking started', { difficulty });
  }

  endGamePerformance(stats) {
    performance.mark('game-end');
    performance.measure('game-duration', 'game-start', 'game-end');

    const gameDuration = performance.now() - this.currentGameStart;
    this.metrics.gameInitTime = gameDuration;

    this.logInfo('Game performance tracking ended', {
      duration: gameDuration,
      stats
    });
  }

  measureCardFlip() {
    const startTime = performance.now();

    return () => {
      const flipTime = performance.now() - startTime;
      this.metrics.cardFlipTime.push(flipTime);

      if (this.metrics.cardFlipTime.length > 100) {
        this.metrics.cardFlipTime.shift();
      }

      if (flipTime > this.thresholds.maxRenderTime * 2) {
        this.logWarning('Slow card flip animation', { flipTime });
      }
    };
  }

  measureMatching() {
    const startTime = performance.now();

    return (isMatch) => {
      const matchTime = performance.now() - startTime;
      this.metrics.matchingTime.push(matchTime);

      if (this.metrics.matchingTime.length > 50) {
        this.metrics.matchingTime.shift();
      }

      this.logInfo('Match processing time', { matchTime, isMatch });
    };
  }

  // Analytics performance tracking
  trackAnalyticsCall(startTime) {
    const latency = performance.now() - startTime;
    this.metrics.analyticsLatency.push(latency);

    if (this.metrics.analyticsLatency.length > 20) {
      this.metrics.analyticsLatency.shift();
    }

    if (latency > 2000) { // 2 seconds
      this.logWarning('Slow analytics call', { latency });
    }
  }

  // Performance issue alerting
  alertPerformanceIssue(metric, value, unit) {
    // Only show performance warnings in development mode
    if (window.AlertSystem && window.EnvironmentConfig && window.EnvironmentConfig.isDevelopment()) {
      window.AlertSystem.performanceWarning(metric, `${value.toFixed(1)}${unit}`);
    }

    this.logWarning('Performance threshold exceeded', { metric, value, unit });
  }

  // Generate performance report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),

      // Summary metrics
      summary: {
        loadTime: this.metrics.loadTime,
        averageFrameRate: this.metrics.frameRate,
        memoryUsage: this.metrics.memoryUsage,
        totalErrors: this.metrics.errors,
        totalWarnings: this.metrics.warnings
      },

      // Detailed metrics
      detailed: {
        cardFlipTimes: this.getStatistics(this.metrics.cardFlipTime),
        matchingTimes: this.getStatistics(this.metrics.matchingTime),
        inputResponsiveness: this.getStatistics(this.metrics.clickResponsiveness),
        analyticsLatency: this.getStatistics(this.metrics.analyticsLatency),
        gameMetrics: this.metrics.gameMetrics
      },

      // Performance recommendations
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  getStatistics(array) {
    if (array.length === 0) {return null;}

    const sorted = [...array].sort((a, b) => a - b);
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average: array.reduce((a, b) => a + b, 0) / array.length,
      median: sorted[Math.floor(sorted.length / 2)],
      count: array.length
    };
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.metrics.frameRate < this.thresholds.minFrameRate) {
      recommendations.push('Consider reducing visual effects or lowering game difficulty for better performance');
    }

    if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      recommendations.push('Memory usage is high - consider refreshing the page');
    }

    if (this.metrics.loadTime > this.thresholds.maxLoadTime) {
      recommendations.push('Page load time is slow - check network connection');
    }

    const avgInputLag = this.metrics.clickResponsiveness.length > 0
      ? this.metrics.clickResponsiveness.reduce((a, b) => a + b, 0) / this.metrics.clickResponsiveness.length
      : 0;

    if (avgInputLag > this.thresholds.maxInputLag) {
      recommendations.push('Input responsiveness is slow - consider closing other applications');
    }

    return recommendations;
  }

  // Export performance data
  exportReport() {
    const report = this.generateReport();
    const blob = new Blob([JSON.stringify(report, null, 2)],
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    this.logInfo('Performance report exported');
  }

  // Get current metrics for display
  getCurrentMetrics() {
    return {
      frameRate: Math.round(this.metrics.frameRate),
      memoryUsage: Math.round(this.metrics.memoryUsage),
      loadTime: Math.round(this.metrics.loadTime),
      errors: this.metrics.errors,
      warnings: this.metrics.warnings
    };
  }

  // Logging helpers
  logInfo(message, data) {
    if (window.Logger) {
      window.Logger.info(`[Performance] ${message}`, data);
    }
  }

  logWarning(message, data) {
    this.metrics.warnings++;
    if (window.Logger) {
      window.Logger.warn(`[Performance] ${message}`, data);
    }
  }

  logError(message, error) {
    this.metrics.errors++;
    if (window.Logger) {
      window.Logger.error(`[Performance] ${message}`, error);
    }
  }

  // Cleanup
  destroy() {
    this.isMonitoring = false;
    this.logInfo('Performance Monitor destroyed');
  }
}

// Create global performance monitor
window.PerformanceMonitor = new PerformanceMonitor();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}
