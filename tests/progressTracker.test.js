const ProgressTracker = require('../src/utils/progressTracker.js');

describe('ProgressTracker', () => {
  let tracker;

  beforeEach(() => {
    localStorage.clear();
    tracker = new ProgressTracker();
  });

  test('loads as a module and exposes a global instance', () => {
    expect(ProgressTracker).toBeDefined();
    expect(window.DTGProgress).toBeInstanceOf(ProgressTracker);
  });

  test('record() stores a session with a generated id and ISO date', () => {
    const stored = tracker.record({ game: 'memory', gameLabel: 'Memory Game (Scanning)', score: 320, difficulty: 'hard', duration: 42 });
    expect(stored).not.toBeNull();
    expect(stored.id).toBeTruthy();
    expect(new Date(stored.date).toString()).not.toBe('Invalid Date');

    const all = tracker.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].game).toBe('memory');
    expect(all[0].score).toBe(320);
  });

  test('record() returns null and stores nothing when game is missing', () => {
    const stored = tracker.record({ score: 10 });
    expect(stored).toBeNull();
    expect(tracker.getAll()).toHaveLength(0);
  });

  test('record() coerces numeric-ish values and nulls out invalid ones', () => {
    const stored = tracker.record({ game: 'ball', score: '15', accuracy: 'not-a-number', duration: undefined });
    expect(stored.score).toBe(15);
    expect(stored.accuracy).toBeNull();
    expect(stored.duration).toBeNull();
  });

  test('getAll() returns newest-first order', () => {
    tracker.record({ game: 'memory', score: 1 });
    tracker.record({ game: 'memory', score: 2 });
    const all = tracker.getAll();
    expect(all[0].score).toBe(2);
    expect(all[1].score).toBe(1);
  });

  test('getAll() tolerates corrupted storage', () => {
    localStorage.setItem('dtg_progress_v1', '{not valid json');
    expect(tracker.getAll()).toEqual([]);
  });

  test('getAll() tolerates a non-array value in storage', () => {
    localStorage.setItem('dtg_progress_v1', JSON.stringify({ oops: true }));
    expect(tracker.getAll()).toEqual([]);
  });

  test('records are capped at maxRecords, dropping the oldest', () => {
    tracker.maxRecords = 3;
    tracker.record({ game: 'memory', score: 1 });
    tracker.record({ game: 'memory', score: 2 });
    tracker.record({ game: 'memory', score: 3 });
    tracker.record({ game: 'memory', score: 4 });
    const all = tracker.getAll();
    expect(all).toHaveLength(3);
    expect(all.map((r) => r.score)).toEqual([4, 3, 2]);
  });

  test('clear() removes all stored records', () => {
    tracker.record({ game: 'memory', score: 1 });
    tracker.clear();
    expect(tracker.getAll()).toEqual([]);
  });

  test('toCSV() produces a header row plus one row per record', () => {
    tracker.record({ game: 'memory', gameLabel: 'Memory Game (Scanning)', difficulty: 'hard', score: 320, accuracy: 90, duration: 42 });
    const csv = tracker.toCSV();
    const lines = csv.split('\r\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('date,game,gameLabel,difficulty,score,accuracy,duration');
    expect(lines[1]).toContain('memory');
    expect(lines[1]).toContain('320');
  });

  test('toCSV() quotes values containing commas or quotes', () => {
    const csv = tracker.toCSV([{ date: '2026-01-01', game: 'fusion_quest', gameLabel: 'Fusion Quest, V3 "Gold"', difficulty: null, score: 5, accuracy: null, duration: null }]);
    const lines = csv.split('\r\n');
    expect(lines[1]).toContain('"Fusion Quest, V3 ""Gold"""');
  });

  test('toCSV() renders null/undefined fields as empty strings', () => {
    const csv = tracker.toCSV([{ date: '2026-01-01', game: 'ball', gameLabel: 'Ball', difficulty: null, score: null, accuracy: undefined, duration: 5 }]);
    const lines = csv.split('\r\n');
    expect(lines[1]).toBe('2026-01-01,ball,Ball,,,,5');
  });

  test('toCSV() defaults to all stored records when none are passed', () => {
    tracker.record({ game: 'memory', score: 1 });
    tracker.record({ game: 'ball', score: 2 });
    const csv = tracker.toCSV();
    expect(csv.split('\r\n')).toHaveLength(3);
  });
});
