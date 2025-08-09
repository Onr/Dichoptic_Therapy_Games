/**
 * User Counter Utility
 * Tracks local user visits and session statistics
 * Data is stored locally and never sent to external servers
 */

class UserCounter {
  constructor() {
    this.storageKey = 'therapy_user_stats';
    this.currentSession = null;
    this.initialize();
  }

  initialize() {
    this.currentSession = {
      sessionId: this.generateSessionId(),
      startTime: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 100),
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isNewUser: this.isNewUser()
    };

    this.recordVisit();
    this.logSessionStart();
  }

  generateSessionId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  detectCurrentGame() {
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop();
    
    if (filename.includes('memory_game')) return 'Memory Game (Scanning)';
    if (filename.includes('ball_game')) return 'Ball Game (Tracking)';
    if (filename.includes('static_ball_game')) return 'Static Ball Game (Saccades)';
    if (filename.includes('index')) return 'Main Hub';
    return 'Other Page';
  }

  // Track when a user starts playing a specific game
  recordGameStart(gameName, difficulty = null) {
    const stats = this.getStats();
    const sessionIndex = stats.sessions.findIndex(s => s.sessionId === this.currentSession.sessionId);
    
    if (sessionIndex !== -1) {
      const gameEntry = {
        game: gameName,
        difficulty: difficulty,
        startTime: new Date().toISOString(),
        endTime: null,
        completed: false,
        score: null,
        moves: null,
        time: null
      };
      
      if (!stats.sessions[sessionIndex].gamesPlayed) {
        stats.sessions[sessionIndex].gamesPlayed = [];
      }
      
      stats.sessions[sessionIndex].gamesPlayed.push(gameEntry);
      this.saveStats(stats);
      
      console.log(`[UserCounter] Game started: ${gameName}${difficulty ? ` (${difficulty})` : ''}`);
    }
  }

  // Track when a user completes a game
  recordGameCompletion(gameName, gameData = {}) {
    const stats = this.getStats();
    const sessionIndex = stats.sessions.findIndex(s => s.sessionId === this.currentSession.sessionId);
    
    if (sessionIndex !== -1) {
      const session = stats.sessions[sessionIndex];
      if (session.gamesPlayed) {
        // Find the most recent game entry for this game type
        const gameIndex = session.gamesPlayed.findLastIndex(g => g.game === gameName && !g.completed);
        
        if (gameIndex !== -1) {
          session.gamesPlayed[gameIndex].completed = true;
          session.gamesPlayed[gameIndex].endTime = new Date().toISOString();
          session.gamesPlayed[gameIndex].score = gameData.score || null;
          session.gamesPlayed[gameIndex].moves = gameData.moves || null;
          session.gamesPlayed[gameIndex].time = gameData.time || null;
          
          session.gameCompletions = (session.gameCompletions || 0) + 1;
          
          // Calculate game duration
          const startTime = new Date(session.gamesPlayed[gameIndex].startTime);
          const endTime = new Date(session.gamesPlayed[gameIndex].endTime);
          const gameDuration = endTime - startTime;
          session.totalGameTime = (session.totalGameTime || 0) + gameDuration;
          
          this.saveStats(stats);
          
          console.log(`[UserCounter] Game completed: ${gameName}`, gameData);
        }
      }
    }
  }

  isNewUser() {
    const stats = this.getStats();
    return stats.totalSessions === 0;
  }

  recordVisit() {
    const stats = this.getStats();
    const now = new Date();
    const todayKey = now.toDateString();

    // Update overall statistics
    stats.totalSessions += 1;
    stats.lastVisit = now.toISOString();
    
    if (this.currentSession.isNewUser) {
      stats.totalUniqueUsers += 1;
      stats.firstVisit = stats.firstVisit || now.toISOString();
    }

    // Detect which game page the user is on
    this.currentSession.currentGame = this.detectCurrentGame();
    this.currentSession.referrer = document.referrer;

    // Update daily statistics
    if (!stats.dailyStats[todayKey]) {
      stats.dailyStats[todayKey] = {
        date: todayKey,
        sessions: 0,
        newUsers: 0,
        returningUsers: 0,
        totalTime: 0,
        averageTime: 0
      };
    }

    stats.dailyStats[todayKey].sessions += 1;
    if (this.currentSession.isNewUser) {
      stats.dailyStats[todayKey].newUsers += 1;
    } else {
      stats.dailyStats[todayKey].returningUsers += 1;
    }

    // Update hourly distribution
    const hour = now.getHours();
    stats.hourlyDistribution[hour] = (stats.hourlyDistribution[hour] || 0) + 1;

    // Record the session
    stats.sessions.push({
      sessionId: this.currentSession.sessionId,
      startTime: this.currentSession.startTime,
      userAgent: this.currentSession.userAgent,
      language: this.currentSession.language,
      screenResolution: this.currentSession.screenResolution,
      timezone: this.currentSession.timezone,
      isNewUser: this.currentSession.isNewUser,
      currentGame: this.currentSession.currentGame,
      referrer: this.currentSession.referrer,
      endTime: null,
      duration: null,
      gamesPlayed: [],
      gameCompletions: 0,
      totalGameTime: 0
    });

    // Keep only last 1000 sessions to prevent storage bloat
    if (stats.sessions.length > 1000) {
      stats.sessions = stats.sessions.slice(-1000);
    }

    this.saveStats(stats);
    this.logUserCount();
  }

  endSession() {
    const stats = this.getStats();
    const endTime = new Date().toISOString();
    const duration = Date.now() - new Date(this.currentSession.startTime).getTime();

    // Update current session
    const sessionIndex = stats.sessions.findIndex(s => s.sessionId === this.currentSession.sessionId);
    if (sessionIndex !== -1) {
      stats.sessions[sessionIndex].endTime = endTime;
      stats.sessions[sessionIndex].duration = duration;

      // Update daily stats
      const todayKey = new Date().toDateString();
      if (stats.dailyStats[todayKey]) {
        stats.dailyStats[todayKey].totalTime += duration;
        stats.dailyStats[todayKey].averageTime = 
          stats.dailyStats[todayKey].totalTime / stats.dailyStats[todayKey].sessions;
      }
    }

    this.saveStats(stats);
    this.logSessionEnd(duration);
  }

  getStats() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load user stats:', error);
    }

    // Default structure
    return {
      totalSessions: 0,
      totalUniqueUsers: 0,
      firstVisit: null,
      lastVisit: null,
      sessions: [],
      dailyStats: {},
      hourlyDistribution: {},
      weeklyDistribution: {
        0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 // Sunday = 0
      }
    };
  }

  saveStats(stats) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save user stats:', error);
    }
  }

  // Public methods for getting statistics
  getTotalUserCount() {
    return this.getStats().totalUniqueUsers;
  }

  getTotalSessionCount() {
    return this.getStats().totalSessions;
  }

  getTodaysStats() {
    const stats = this.getStats();
    const todayKey = new Date().toDateString();
    return stats.dailyStats[todayKey] || {
      date: todayKey,
      sessions: 0,
      newUsers: 0,
      returningUsers: 0,
      totalTime: 0,
      averageTime: 0
    };
  }

  getRecentSessions(days = 7) {
    const stats = this.getStats();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return stats.sessions.filter(session => 
      new Date(session.startTime) >= cutoff
    );
  }

  getPeakHours() {
    const stats = this.getStats();
    const hourlyData = Object.entries(stats.hourlyDistribution)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count);

    return hourlyData.slice(0, 3);
  }

  getWeeklyDistribution() {
    const stats = this.getStats();
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return weekDays.map((day, index) => ({
      day,
      count: stats.weeklyDistribution[index] || 0
    }));
  }

  // Generate a comprehensive report
  generateReport() {
    const stats = this.getStats();
    const today = this.getTodaysStats();
    const recent = this.getRecentSessions();
    const peakHours = this.getPeakHours();

    return {
      overview: {
        totalUsers: stats.totalUniqueUsers,
        totalSessions: stats.totalSessions,
        firstVisit: stats.firstVisit,
        lastVisit: stats.lastVisit,
        currentSession: this.currentSession.sessionId
      },
      today: today,
      last7Days: {
        sessions: recent.length,
        newUsers: recent.filter(s => s.isNewUser).length,
        averageDuration: recent.length > 0 ? 
          recent.reduce((sum, s) => sum + (s.duration || 0), 0) / recent.length : 0
      },
      patterns: {
        peakHours: peakHours,
        weeklyDistribution: this.getWeeklyDistribution()
      },
      technical: {
        mostCommonLanguage: this.getMostCommon(stats.sessions.map(s => s.language)),
        mostCommonResolution: this.getMostCommon(stats.sessions.map(s => s.screenResolution)),
        mostCommonTimezone: this.getMostCommon(stats.sessions.map(s => s.timezone))
      }
    };
  }

  getMostCommon(array) {
    const frequency = {};
    array.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
  }

  // Download stats as JSON
  downloadReport() {
    const report = this.generateReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Export detailed user data as CSV
  exportUserCSV() {
    const stats = this.getStats();
    const csvData = this.generateUserCSV(stats);
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('[UserCounter] User CSV data exported');
  }

  // Generate CSV data with detailed user information
  generateUserCSV(stats) {
    const headers = [
      'Session ID',
      'User Type',
      'Start Time',
      'End Time',
      'Session Duration (minutes)',
      'Current Game Page',
      'Games Played',
      'Games Completed',
      'Total Game Time (minutes)',
      'Best Score',
      'Language',
      'Screen Resolution',
      'Timezone',
      'User Agent',
      'Referrer',
      'Date',
      'Hour of Day',
      'Day of Week'
    ];

    let csvContent = headers.join(',') + '\n';

    stats.sessions.forEach(session => {
      const startTime = new Date(session.startTime);
      const endTime = session.endTime ? new Date(session.endTime) : null;
      const duration = endTime ? Math.round((endTime - startTime) / 60000) : 'Ongoing';
      
      const gamesPlayedList = session.gamesPlayed ? 
        session.gamesPlayed.map(g => `${g.game}${g.difficulty ? `(${g.difficulty})` : ''}`).join(';') : 
        'None';
      
      const totalGameTime = session.totalGameTime ? 
        Math.round(session.totalGameTime / 60000) : 0;
      
      const bestScore = session.gamesPlayed ? 
        Math.max(...session.gamesPlayed.filter(g => g.score).map(g => g.score), 0) || 'N/A' : 
        'N/A';

      const row = [
        this.escapeCsvField(session.sessionId),
        session.isNewUser ? 'New User' : 'Returning User',
        startTime.toISOString(),
        endTime ? endTime.toISOString() : 'Ongoing',
        duration,
        this.escapeCsvField(session.currentGame || 'Unknown'),
        this.escapeCsvField(gamesPlayedList),
        session.gameCompletions || 0,
        totalGameTime,
        bestScore,
        this.escapeCsvField(session.language || 'Unknown'),
        this.escapeCsvField(session.screenResolution || 'Unknown'),
        this.escapeCsvField(session.timezone || 'Unknown'),
        this.escapeCsvField(session.userAgent || 'Unknown'),
        this.escapeCsvField(session.referrer || 'Direct'),
        startTime.toDateString(),
        startTime.getHours(),
        startTime.toLocaleDateString('en-US', { weekday: 'long' })
      ];

      csvContent += row.join(',') + '\n';
    });

    return csvContent;
  }

  // Helper function to escape CSV fields
  escapeCsvField(field) {
    if (field === null || field === undefined) return '';
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      return '"' + stringField.replace(/"/g, '""') + '"';
    }
    return stringField;
  }

  // Export game-specific CSV
  exportGameCSV() {
    const stats = this.getStats();
    const csvData = this.generateGameCSV(stats);
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('[UserCounter] Game CSV data exported');
  }

  // Generate CSV for individual game sessions
  generateGameCSV(stats) {
    const headers = [
      'Session ID',
      'Game Name',
      'Difficulty',
      'Start Time',
      'End Time',
      'Duration (minutes)',
      'Completed',
      'Score',
      'Moves',
      'Game Time (seconds)',
      'User Language',
      'Screen Resolution',
      'Date',
      'Hour of Day'
    ];

    let csvContent = headers.join(',') + '\n';

    stats.sessions.forEach(session => {
      if (session.gamesPlayed && session.gamesPlayed.length > 0) {
        session.gamesPlayed.forEach(game => {
          const startTime = new Date(game.startTime);
          const endTime = game.endTime ? new Date(game.endTime) : null;
          const duration = endTime ? Math.round((endTime - startTime) / 60000) : 'Ongoing';

          const row = [
            this.escapeCsvField(session.sessionId),
            this.escapeCsvField(game.game),
            this.escapeCsvField(game.difficulty || 'Not specified'),
            startTime.toISOString(),
            endTime ? endTime.toISOString() : 'Ongoing',
            duration,
            game.completed ? 'Yes' : 'No',
            game.score || 'N/A',
            game.moves || 'N/A',
            game.time || 'N/A',
            this.escapeCsvField(session.language || 'Unknown'),
            this.escapeCsvField(session.screenResolution || 'Unknown'),
            startTime.toDateString(),
            startTime.getHours()
          ];

          csvContent += row.join(',') + '\n';
        });
      }
    });

    return csvContent;
  }

  // Clear all statistics
  clearStats() {
    localStorage.removeItem(this.storageKey);
    console.log('User statistics cleared');
  }

  // Logging methods
  logUserCount() {
    const stats = this.getStats();
    console.log(`[UserCounter] Total Users: ${stats.totalUniqueUsers}, Total Sessions: ${stats.totalSessions}`);
  }

  logSessionStart() {
    console.log(`[UserCounter] Session started: ${this.currentSession.sessionId} (New User: ${this.currentSession.isNewUser})`);
  }

  logSessionEnd(duration) {
    const minutes = Math.round(duration / 60000);
    console.log(`[UserCounter] Session ended: ${this.currentSession.sessionId} (Duration: ${minutes}m)`);
  }

  // Display user statistics in a modal
  showStatsModal() {
    const report = this.generateReport();
    
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); z-index: 10000; display: flex;
      align-items: center; justify-content: center; font-family: Arial, sans-serif;
    `;

    modal.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 10px; max-width: 600px; max-height: 80%; overflow-y: auto;">
        <h2 style="margin-top: 0; color: #333;">📊 User Statistics</h2>
        
        <div style="margin-bottom: 20px;">
          <h3>📈 Overview</h3>
          <p><strong>Total Users:</strong> ${report.overview.totalUsers}</p>
          <p><strong>Total Sessions:</strong> ${report.overview.totalSessions}</p>
          <p><strong>First Visit:</strong> ${report.overview.firstVisit ? new Date(report.overview.firstVisit).toLocaleString() : 'N/A'}</p>
          <p><strong>Last Visit:</strong> ${report.overview.lastVisit ? new Date(report.overview.lastVisit).toLocaleString() : 'N/A'}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3>📅 Today</h3>
          <p><strong>Sessions:</strong> ${report.today.sessions}</p>
          <p><strong>New Users:</strong> ${report.today.newUsers}</p>
          <p><strong>Returning Users:</strong> ${report.today.returningUsers}</p>
          <p><strong>Avg Session Time:</strong> ${Math.round(report.today.averageTime / 60000)}m</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3>⏰ Peak Hours</h3>
          ${report.patterns.peakHours.map(h => 
            `<p><strong>${h.hour}:00-${h.hour + 1}:00:</strong> ${h.count} visits</p>`
          ).join('')}
        </div>

        <div style="margin-bottom: 20px;">
          <h3>💻 Technical Info</h3>
          <p><strong>Most Common Language:</strong> ${report.technical.mostCommonLanguage}</p>
          <p><strong>Most Common Resolution:</strong> ${report.technical.mostCommonResolution}</p>
          <p><strong>Most Common Timezone:</strong> ${report.technical.mostCommonTimezone}</p>
        </div>

        <div style="text-align: center;">
          <button onclick="window.UserCounter.downloadReport()" style="margin: 5px; padding: 10px 15px; background: #007cba; color: white; border: none; border-radius: 5px; cursor: pointer;">
            📥 Download Report
          </button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="margin: 5px; padding: 10px 15px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">
            ✖️ Close
          </button>
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
  }
}

// Initialize the user counter when the script loads
if (typeof window !== 'undefined') {
  window.UserCounter = new UserCounter();
  
  // End session when user leaves
  window.addEventListener('beforeunload', () => {
    if (window.UserCounter) {
      window.UserCounter.endSession();
    }
  });

  // Also track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && window.UserCounter) {
      window.UserCounter.endSession();
    }
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserCounter;
}
