/**
 * Production Alert and Notification System
 * Replaces browser alerts with professional UI components
 * Provides different types of notifications and system alerts
 */

class AlertSystem {
  constructor() {
    this.alerts = [];
    this.notifications = [];
    this.alertId = 0;
    this.initializeStyles();
    this.createContainer();
  }

  initializeStyles() {
    const styles = `
      .alert-system-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        width: 400px;
        max-width: 90vw;
        pointer-events: none;
      }

      .alert-item {
        background: rgba(0, 0, 0, 0.9);
        border-radius: 12px;
        padding: 16px 20px;
        margin-bottom: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border-left: 4px solid;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        pointer-events: auto;
        position: relative;
      }

      .alert-item.show {
        opacity: 1;
        transform: translateX(0);
      }

      .alert-item.success {
        border-left-color: #4caf50;
        background: rgba(76, 175, 80, 0.1);
      }

      .alert-item.error {
        border-left-color: #f44336;
        background: rgba(244, 67, 54, 0.1);
      }

      .alert-item.warning {
        border-left-color: #ff9800;
        background: rgba(255, 152, 0, 0.1);
      }

      .alert-item.info {
        border-left-color: #2196f3;
        background: rgba(33, 150, 243, 0.1);
      }

      .alert-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .alert-title {
        font-weight: 600;
        font-size: 14px;
        color: #fff;
      }

      .alert-close {
        background: none;
        border: none;
        color: #fff;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        opacity: 0.7;
        transition: opacity 0.2s;
      }

      .alert-close:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.1);
      }

      .alert-message {
        color: #e0e0e0;
        font-size: 13px;
        line-height: 1.4;
      }

      .alert-actions {
        margin-top: 12px;
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }

      .alert-button {
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .alert-button.primary {
        background: #2196f3;
        color: white;
      }

      .alert-button.primary:hover {
        background: #1976d2;
      }

      .alert-button.secondary {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .alert-button.secondary:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .system-status {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        backdrop-filter: blur(10px);
        z-index: 9999;
        display: none;
      }

      .system-status.show {
        display: block;
      }

      .system-status.error {
        background: rgba(244, 67, 54, 0.9);
      }

      .system-status.warning {
        background: rgba(255, 152, 0, 0.9);
      }

      .system-status.success {
        background: rgba(76, 175, 80, 0.9);
      }
    `;

    if (!document.getElementById('alert-system-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'alert-system-styles';
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'alert-system-container';
    document.body.appendChild(this.container);

    this.statusBar = document.createElement('div');
    this.statusBar.className = 'system-status';
    document.body.appendChild(this.statusBar);
  }

  show(type, title, message, options = {}) {
    const alertId = ++this.alertId;
    const autoClose = options.autoClose !== false;
    const duration = options.duration || (type === 'error' ? 8000 : 4000);

    const alertElement = document.createElement('div');
    alertElement.className = `alert-item ${type}`;
    alertElement.setAttribute('data-alert-id', alertId);

    const closeButton = document.createElement('button');
    closeButton.className = 'alert-close';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => this.close(alertId);

    const header = document.createElement('div');
    header.className = 'alert-header';

    const titleElement = document.createElement('div');
    titleElement.className = 'alert-title';
    titleElement.textContent = title;

    header.appendChild(titleElement);
    header.appendChild(closeButton);

    const messageElement = document.createElement('div');
    messageElement.className = 'alert-message';
    messageElement.textContent = message;

    alertElement.appendChild(header);
    alertElement.appendChild(messageElement);

    // Add action buttons if provided
    if (options.actions && options.actions.length > 0) {
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'alert-actions';

      options.actions.forEach(action => {
        const button = document.createElement('button');
        button.className = `alert-button ${action.type || 'secondary'}`;
        button.textContent = action.text;
        button.onclick = () => {
          if (action.callback) {action.callback();}
          this.close(alertId);
        };
        actionsContainer.appendChild(button);
      });

      alertElement.appendChild(actionsContainer);
    }

    this.container.appendChild(alertElement);

    // Animate in
    setTimeout(() => alertElement.classList.add('show'), 10);

    // Auto close
    if (autoClose) {
      setTimeout(() => this.close(alertId), duration);
    }

    // Log the alert
    if (window.Logger) {
      window.Logger.info('Alert Shown', { type, title, message });
    }

    return alertId;
  }

  close(alertId) {
    const alertElement = this.container.querySelector(`[data-alert-id="${alertId}"]`);
    if (alertElement) {
      alertElement.classList.remove('show');
      setTimeout(() => {
        if (alertElement.parentNode) {
          alertElement.parentNode.removeChild(alertElement);
        }
      }, 300);
    }
  }

  // Convenience methods
  success(title, message, options) {
    return this.show('success', title, message, options);
  }

  error(title, message, options) {
    return this.show('error', title, message, options);
  }

  warning(title, message, options) {
    return this.show('warning', title, message, options);
  }

  info(title, message, options) {
    return this.show('info', title, message, options);
  }

  // System status indicator
  showStatus(type, message, duration = 3000) {
    this.statusBar.className = `system-status show ${type}`;
    this.statusBar.textContent = message;

    setTimeout(() => {
      this.statusBar.classList.remove('show');
    }, duration);
  }

  // Confirmation dialog
  confirm(title, message, onConfirm, onCancel) {
    return this.show('info', title, message, {
      autoClose: false,
      actions: [
        {
          text: 'Cancel',
          type: 'secondary',
          callback: onCancel
        },
        {
          text: 'Confirm',
          type: 'primary',
          callback: onConfirm
        }
      ]
    });
  }

  // Game over dialog
  gameOver(stats, onRestart, onMenu) {
    const message = `Time: ${stats.time}s | Moves: ${stats.moves} | Score: ${stats.score}`;
    return this.show('success', 'Game Complete!', message, {
      autoClose: false,
      actions: [
        {
          text: 'Menu',
          type: 'secondary',
          callback: onMenu
        },
        {
          text: 'Play Again',
          type: 'primary',
          callback: onRestart
        }
      ]
    });
  }

  // Connection status
  connectionError() {
    return this.error(
      'Connection Error',
      'Unable to connect to analytics services. Your game progress is saved locally.',
      { duration: 6000 }
    );
  }

  // Performance warning
  performanceWarning(metric, value) {
    return this.warning(
      'Performance Notice',
      `${metric} is higher than expected (${value}). Consider adjusting quality settings.`,
      { duration: 5000 }
    );
  }

  // Clear all alerts
  clearAll() {
    const alerts = this.container.querySelectorAll('.alert-item');
    alerts.forEach(alert => {
      alert.classList.remove('show');
      setTimeout(() => {
        if (alert.parentNode) {
          alert.parentNode.removeChild(alert);
        }
      }, 300);
    });
  }
}

// Create global alert system
window.AlertSystem = new AlertSystem();

// Replace native alert function
window.originalAlert = window.alert;
window.alert = function(message, title = 'Alert') {
  window.AlertSystem.info(title, message);
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AlertSystem;
}
