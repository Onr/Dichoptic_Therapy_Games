/**
 * Test file for User Counter functionality
 */

// Import UserCounter
const UserCounter = require('../src/utils/userCounter');

describe('UserCounter', () => {
  let userCounter;
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock necessary browser APIs for testing
    global.navigator = {
      userAgent: 'Mozilla/5.0 (Test Browser)',
      language: 'en-US'
    };
    
    global.screen = {
      width: 1920,
      height: 1080,
      colorDepth: 24
    };
    
    global.Intl = {
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: 'UTC' })
      })
    };
    
    userCounter = new UserCounter();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('should initialize with correct default values', () => {
    expect(userCounter.currentSession).toBeDefined();
    expect(userCounter.currentSession.sessionId).toMatch(/^user_\d+_[a-z0-9]+$/);
    expect(userCounter.currentSession.isNewUser).toBe(true);
  });

  test('should track total user count', () => {
    const initialCount = userCounter.getTotalUserCount();
    expect(initialCount).toBe(1); // First user
  });

  test('should track session count', () => {
    const sessionCount = userCounter.getTotalSessionCount();
    expect(sessionCount).toBe(1); // First session
  });

  test('should generate unique session IDs', () => {
    const id1 = userCounter.generateSessionId();
    const id2 = userCounter.generateSessionId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^user_\d+_[a-z0-9]+$/);
  });

  test('should save and load statistics', () => {
    const stats = userCounter.getStats();
    expect(stats.totalSessions).toBe(1);
    expect(stats.totalUniqueUsers).toBe(1);
    expect(stats.sessions).toHaveLength(1);
  });

  test('should track daily statistics', () => {
    const today = userCounter.getTodaysStats();
    expect(today.sessions).toBe(1);
    expect(today.newUsers).toBe(1);
    expect(today.returningUsers).toBe(0);
  });

  test('should end session and update duration', () => {
    const initialSession = userCounter.currentSession;

    initialSession.startTime = new Date(Date.now() - 1000).toISOString();
    userCounter.endSession();

    const stats = userCounter.getStats();
    const session = stats.sessions.find(s => s.sessionId === initialSession.sessionId);

    expect(session.endTime).toBeDefined();
    expect(session.duration).toBeGreaterThan(0);
  });

  test('should generate comprehensive report', () => {
    const report = userCounter.generateReport();
    
    expect(report).toHaveProperty('overview');
    expect(report).toHaveProperty('today');
    expect(report).toHaveProperty('last7Days');
    expect(report).toHaveProperty('patterns');
    expect(report).toHaveProperty('technical');
    
    expect(report.overview.totalUsers).toBe(1);
    expect(report.overview.totalSessions).toBe(1);
  });

  test('should clear statistics', () => {
    // Add some data first
    userCounter.recordVisit();
    
    let stats = userCounter.getStats();
    expect(stats.totalSessions).toBeGreaterThan(0);
    
    // Clear stats
    userCounter.clearStats();
    
    stats = userCounter.getStats();
    expect(stats.totalSessions).toBe(0);
    expect(stats.totalUniqueUsers).toBe(0);
  });

  test('should track returning users correctly', () => {
    // Simulate a returning user
    const UserCounter = require('../src/utils/userCounter');
    const secondVisit = new UserCounter();
    
    const stats = secondVisit.getStats();
    expect(stats.totalSessions).toBe(2);
    expect(stats.totalUniqueUsers).toBe(1); // Still the same user
  });

  test('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = jest.fn(() => {
      throw new Error('Storage quota exceeded');
    });
    
    // Should not throw error
    expect(() => {
      userCounter.saveStats({ test: 'data' });
    }).not.toThrow();
    
    // Restore localStorage
    localStorage.setItem = originalSetItem;
  });
});
