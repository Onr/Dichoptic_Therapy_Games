/**
 * Admin Panel for User Statistics
 * Accessible via Ctrl+Shift+A or by visiting ?admin=true
 */

class AdminPanel {
  constructor() {
    this.isVisible = false;
    this.initialize();
  }

  initialize() {
    // Check if admin mode is requested via URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      this.showPanel();
    }

    // Add keyboard shortcut (Ctrl+Shift+A)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        this.togglePanel();
      }
    });

    // Add hidden button for mobile access
    this.addHiddenButton();
  }

  addHiddenButton() {
    // Add a small, nearly invisible button in the corner
    const button = document.createElement('div');
    button.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 20px;
      height: 20px;
      background: rgba(0,0,0,0.1);
      border-radius: 50%;
      cursor: pointer;
      z-index: 9999;
      opacity: 0.3;
      transition: opacity 0.3s;
    `;

    button.onmouseover = () => button.style.opacity = '0.8';
    button.onmouseout = () => button.style.opacity = '0.3';
    button.onclick = () => this.togglePanel();

    document.body.appendChild(button);
  }

  togglePanel() {
    if (this.isVisible) {
      this.hidePanel();
    } else {
      this.showPanel();
    }
  }

  showPanel() {
    if (this.isVisible) {return;}

    this.isVisible = true;
    const report = window.UserCounter ? window.UserCounter.generateReport() : this.getEmptyReport();

    const panel = document.createElement('div');
    panel.id = 'admin-panel';
    panel.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      z-index: 10000;
      font-family: 'Courier New', monospace;
      color: #00ff00;
      overflow-y: auto;
      padding: 20px;
      box-sizing: border-box;
    `;

    panel.innerHTML = this.generatePanelHTML(report);

    // Add close button functionality
    panel.querySelector('#close-admin').onclick = () => this.hidePanel();
    panel.querySelector('#refresh-stats').onclick = () => this.refreshPanel();
    panel.querySelector('#download-report').onclick = () => this.downloadReport();
    panel.querySelector('#clear-stats').onclick = () => this.clearStats();

    // Close on ESC key
    const closeOnEsc = (e) => {
      if (e.key === 'Escape') {
        this.hidePanel();
        document.removeEventListener('keydown', closeOnEsc);
      }
    };
    document.addEventListener('keydown', closeOnEsc);

    document.body.appendChild(panel);
  }

  hidePanel() {
    const panel = document.getElementById('admin-panel');
    if (panel) {
      panel.remove();
      this.isVisible = false;
    }
  }

  refreshPanel() {
    this.hidePanel();
    setTimeout(() => this.showPanel(), 100);
  }

  downloadReport() {
    if (window.UserCounter) {
      window.UserCounter.downloadReport();
    }
  }

  clearStats() {
    if (confirm('Are you sure you want to clear all user statistics? This cannot be undone.')) {
      if (window.UserCounter) {
        window.UserCounter.clearStats();
        this.refreshPanel();
      }
    }
  }

  generatePanelHTML(report) {
    const formatTime = (ms) => {
      if (!ms) {return '0m';}
      const minutes = Math.round(ms / 60000);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
    };

    const formatDate = (dateStr) => {
      return dateStr ? new Date(dateStr).toLocaleString() : 'N/A';
    };

    return `
      <div style="max-width: 1200px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #00ff00; padding-bottom: 10px;">
          <h1 style="margin: 0; color: #00ff00; text-shadow: 0 0 10px #00ff00;">
            🔐 ADMIN PANEL - USER STATISTICS
          </h1>
          <div>
            <button id="refresh-stats" style="margin: 0 5px; padding: 5px 10px; background: #003300; color: #00ff00; border: 1px solid #00ff00; cursor: pointer;">
              🔄 Refresh
            </button>
            <button id="download-report" style="margin: 0 5px; padding: 5px 10px; background: #003300; color: #00ff00; border: 1px solid #00ff00; cursor: pointer;">
              📥 Download
            </button>
            <button id="clear-stats" style="margin: 0 5px; padding: 5px 10px; background: #330000; color: #ff0000; border: 1px solid #ff0000; cursor: pointer;">
              🗑️ Clear
            </button>
            <button id="close-admin" style="margin: 0 5px; padding: 5px 10px; background: #333; color: #fff; border: 1px solid #666; cursor: pointer;">
              ✖️ Close
            </button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
          
          <!-- Overview Card -->
          <div style="background: rgba(0,255,0,0.1); border: 1px solid #00ff00; padding: 15px; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #00ff00;">📊 OVERVIEW</h3>
            <div style="font-size: 14px; line-height: 1.8;">
              <div><strong>Total Users:</strong> <span style="color: #ffff00;">${report.overview.totalUsers}</span></div>
              <div><strong>Total Sessions:</strong> <span style="color: #ffff00;">${report.overview.totalSessions}</span></div>
              <div><strong>First Visit:</strong> ${formatDate(report.overview.firstVisit)}</div>
              <div><strong>Last Visit:</strong> ${formatDate(report.overview.lastVisit)}</div>
              <div><strong>Current Session:</strong> <span style="color: #00ffff;">${report.overview.currentSession}</span></div>
            </div>
          </div>

          <!-- Today's Stats -->
          <div style="background: rgba(255,255,0,0.1); border: 1px solid #ffff00; padding: 15px; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #ffff00;">📅 TODAY</h3>
            <div style="font-size: 14px; line-height: 1.8;">
              <div><strong>Sessions:</strong> <span style="color: #00ff00;">${report.today.sessions}</span></div>
              <div><strong>New Users:</strong> <span style="color: #00ff00;">${report.today.newUsers}</span></div>
              <div><strong>Returning:</strong> <span style="color: #00ff00;">${report.today.returningUsers}</span></div>
              <div><strong>Total Time:</strong> ${formatTime(report.today.totalTime)}</div>
              <div><strong>Avg Time:</strong> ${formatTime(report.today.averageTime)}</div>
            </div>
          </div>

          <!-- Last 7 Days -->
          <div style="background: rgba(0,255,255,0.1); border: 1px solid #00ffff; padding: 15px; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #00ffff;">📈 LAST 7 DAYS</h3>
            <div style="font-size: 14px; line-height: 1.8;">
              <div><strong>Sessions:</strong> <span style="color: #00ff00;">${report.last7Days.sessions}</span></div>
              <div><strong>New Users:</strong> <span style="color: #00ff00;">${report.last7Days.newUsers}</span></div>
              <div><strong>Avg Duration:</strong> ${formatTime(report.last7Days.averageDuration)}</div>
            </div>
          </div>

          <!-- Technical Info -->
          <div style="background: rgba(255,0,255,0.1); border: 1px solid #ff00ff; padding: 15px; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #ff00ff;">💻 TECHNICAL</h3>
            <div style="font-size: 14px; line-height: 1.8;">
              <div><strong>Language:</strong> ${report.technical.mostCommonLanguage}</div>
              <div><strong>Resolution:</strong> ${report.technical.mostCommonResolution}</div>
              <div><strong>Timezone:</strong> ${report.technical.mostCommonTimezone}</div>
            </div>
          </div>
        </div>

        <!-- Peak Hours -->
        <div style="background: rgba(255,255,255,0.05); border: 1px solid #666; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="color: #fff;">⏰ PEAK HOURS</h3>
          <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            ${report.patterns.peakHours.map(hour => `
              <div style="text-align: center;">
                <div style="color: #00ff00; font-size: 18px; font-weight: bold;">${hour.count}</div>
                <div style="color: #ccc; font-size: 12px;">${hour.hour}:00-${hour.hour + 1}:00</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Weekly Distribution -->
        <div style="background: rgba(255,255,255,0.05); border: 1px solid #666; padding: 15px; border-radius: 5px;">
          <h3 style="color: #fff;">📊 WEEKLY DISTRIBUTION</h3>
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; text-align: center;">
            ${report.patterns.weeklyDistribution.map(day => `
              <div>
                <div style="color: #00ff00; font-size: 16px; font-weight: bold;">${day.count}</div>
                <div style="color: #ccc; font-size: 10px;">${day.day.substring(0, 3)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
          Press ESC to close | Ctrl+Shift+A to toggle | All data stored locally
        </div>
      </div>
    `;
  }

  getEmptyReport() {
    return {
      overview: {
        totalUsers: 0,
        totalSessions: 0,
        firstVisit: null,
        lastVisit: null,
        currentSession: 'N/A'
      },
      today: {
        sessions: 0,
        newUsers: 0,
        returningUsers: 0,
        totalTime: 0,
        averageTime: 0
      },
      last7Days: {
        sessions: 0,
        newUsers: 0,
        averageDuration: 0
      },
      patterns: {
        peakHours: [],
        weeklyDistribution: [
          {day: 'Sunday', count: 0},
          {day: 'Monday', count: 0},
          {day: 'Tuesday', count: 0},
          {day: 'Wednesday', count: 0},
          {day: 'Thursday', count: 0},
          {day: 'Friday', count: 0},
          {day: 'Saturday', count: 0}
        ]
      },
      technical: {
        mostCommonLanguage: 'N/A',
        mostCommonResolution: 'N/A',
        mostCommonTimezone: 'N/A'
      }
    };
  }
}

// Initialize admin panel when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.AdminPanel = new AdminPanel();
    });
  } else {
    window.AdminPanel = new AdminPanel();
  }
}
