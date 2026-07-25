/**
 * Shared cross-game progress tracking.
 * Every game writes one record per completed session to a single
 * localStorage key so progress.html can build a combined summary/CSV
 * across Memory (Scanning), Ball Tracking, Static Ball (Saccades) and
 * Fusion Quest without any backend.
 */

class ProgressTracker {
  constructor() {
    this.storageKey = 'dtg_progress_v1';
    this.maxRecords = 500;
  }

  /**
   * Records one completed game session.
   * entry: { game, gameLabel, difficulty, score, accuracy, duration, extra }
   * Only `game` is required; everything else may be null/omitted.
   * Returns the stored record (with id/date filled in), or null on failure.
   */
  record(entry) {
    if (!entry || !entry.game) return null;

    const record = {
      id: this._generateId(),
      game: entry.game,
      gameLabel: entry.gameLabel || entry.game,
      date: new Date().toISOString(),
      difficulty: entry.difficulty != null ? entry.difficulty : null,
      score: this._toNumberOrNull(entry.score),
      accuracy: this._toNumberOrNull(entry.accuracy),
      duration: this._toNumberOrNull(entry.duration),
      extra: entry.extra || null
    };

    try {
      const all = this.getAll();
      all.unshift(record);
      const trimmed = all.slice(0, this.maxRecords);
      localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
      return record;
    } catch (ignore) {
      return null;
    }
  }

  /** Returns all stored records, newest first. Never throws. */
  getAll() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return parsed instanceof Array ? parsed : [];
    } catch (ignore) {
      return [];
    }
  }

  /** Removes all stored progress records. */
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (ignore) {
      // ignore storage failures (e.g. private-browsing quota)
    }
  }

  /**
   * Converts records to CSV text (header + rows). Values containing
   * commas, quotes or newlines are quoted per RFC 4180.
   */
  toCSV(records) {
    const rows = records || this.getAll();
    const columns = ['date', 'game', 'gameLabel', 'difficulty', 'score', 'accuracy', 'duration'];
    const lines = [columns.join(',')];

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const line = columns.map((col) => this._csvEscape(row[col]));
      lines.push(line.join(','));
    }

    return lines.join('\r\n');
  }

  _csvEscape(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/[",\r\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  _toNumberOrNull(value) {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
}

// Create global instance for use across game pages
window.DTGProgress = new ProgressTracker();

// Export for module systems (tests)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProgressTracker;
}
