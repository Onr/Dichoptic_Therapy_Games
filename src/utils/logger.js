/**
 * Production Logger System
 * Provides structured logging with different levels, performance monitoring,
 * and error tracking for the Dichoptic Therapy Games
 */

class Logger {
  constructor() {
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      TRACE: 4
    };

    this.currentLevel = this.getLevelFromEnvironment();
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.logs = [];
    this.maxLogs = 1000; // Prevent memory overflow

    // Performance monitoring
    this.performanceMetrics = {
      gameLoads: 0,
      errors: 0,
      warnings: 0,
      averageGameDuration: 0,
      totalPlayTime: 0
    };

    this.initializeLogger();
  }

  getLevelFromEnvironment() {
    const envLevel = localStorage.getItem('logLevel') || 'INFO';
    return this.levels[envLevel.toUpperCase()] || this.levels.INFO;
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  initializeLogger() {
    // Listen for unhandled errors
    window.addEventListener('error', (event) => {
      this.error('Unhandled Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : 'No stack trace'
      });
    });

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });

    // Performance observer for monitoring
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              this.info('Page Load Performance', {
                loadTime: entry.loadEventEnd - entry.loadEventStart,
                domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                ttfb: entry.responseStart - entry.requestStart
              });
            }
          }
        });
        observer.observe({ entryTypes: ['navigation'] });
      } catch (e) {
        this.warn('Performance Observer not supported', e);
      }
    }

    this.info('Logger initialized', {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      }
    });
  }

  log(level, message, data = {}) {
    if (this.levels[level] > this.currentLevel) {return;}

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent.substring(0, 100) // Truncate for storage
    };

    // Add to in-memory logs
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console output with styling
    this.outputToConsole(level, message, data);

    // Store critical logs in localStorage
    if (level === 'ERROR' || level === 'WARN') {
      this.persistLog(logEntry);
    }

    // Update metrics
    this.updateMetrics(level);
  }

  outputToConsole(level, message, data) {
    const styles = {
      ERROR: 'color: #ff6b6b; font-weight: bold;',
      WARN: 'color: #ffa726; font-weight: bold;',
      INFO: 'color: #42a5f5;',
      DEBUG: 'color: #66bb6a;',
      TRACE: 'color: #bdbdbd;'
    };

    const timestamp = new Date().toLocaleTimeString();
    console.log(
      `%c[${timestamp}] ${level}: ${message}`,
      styles[level],
      data
    );
  }

  persistLog(logEntry) {
    try {
      const persistedLogs = JSON.parse(localStorage.getItem('therapy_logs') || '[]');
      persistedLogs.push(logEntry);

      // Keep only last 100 critical logs
      if (persistedLogs.length > 100) {
        persistedLogs.splice(0, persistedLogs.length - 100);
      }

      localStorage.setItem('therapy_logs', JSON.stringify(persistedLogs));
    } catch (e) {
      console.error('Failed to persist log:', e);
    }
  }

  updateMetrics(level) {
    if (level === 'ERROR') {this.performanceMetrics.errors++;}
    if (level === 'WARN') {this.performanceMetrics.warnings++;}
  }

  // Public logging methods
  error(message, data) { this.log('ERROR', message, data); }
  warn(message, data) { this.log('WARN', message, data); }
  info(message, data) { this.log('INFO', message, data); }
  debug(message, data) { this.log('DEBUG', message, data); }
  trace(message, data) { this.log('TRACE', message, data); }

  // Game-specific logging methods
  gameStart(difficulty, settings) {
    this.performanceMetrics.gameLoads++;
    this.info('Game Started', {
      difficulty,
      settings,
      timestamp: Date.now()
    });
  }

  gameEnd(stats) {
    const duration = stats.time;
    this.performanceMetrics.totalPlayTime += duration;
    this.performanceMetrics.averageGameDuration =
      this.performanceMetrics.totalPlayTime / this.performanceMetrics.gameLoads;

    this.info('Game Completed', stats);
  }

  userAction(action, details) {
    this.debug('User Action', { action, details });
  }

  performance(metric, value, unit = 'ms') {
    this.info('Performance Metric', { metric, value, unit });
  }

  // Export logs for analysis
  exportLogs() {
    const exportData = {
      sessionInfo: {
        sessionId: this.sessionId,
        startTime: new Date(this.startTime).toISOString(),
        exportTime: new Date().toISOString(),
        duration: Date.now() - this.startTime
      },
      metrics: this.performanceMetrics,
      logs: this.logs
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)],
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `therapy-logs-${this.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Clear logs (for privacy compliance)
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('therapy_logs');
    this.info('Logs cleared by user request');
  }

  // Get current status
  getStatus() {
    return {
      sessionId: this.sessionId,
      uptime: Date.now() - this.startTime,
      logCount: this.logs.length,
      metrics: this.performanceMetrics
    };
  }
}

// Create global logger instance
window.Logger = new Logger();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Logger;
}
