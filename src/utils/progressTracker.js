/**
 * Shared cross-game progress tracking.
 * Every game writes one record per completed session to a single
 * localStorage key so progress.html can build a combined summary/CSV
 * across all practice games without any backend.
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
    if (!entry || !entry.game) {return null;}

    const record = {
      id: this._generateId(),
      game: entry.game,
      gameLabel: entry.gameLabel || entry.game,
      date: new Date().toISOString(),
      difficulty: entry.difficulty !== null && entry.difficulty !== undefined ? entry.difficulty : null,
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
    const baseColumns = ['date', 'game', 'gameLabel', 'difficulty', 'score', 'accuracy', 'duration'];
    const extraColumns = [];
    rows.forEach((row) => {
      if (!row.extra || typeof row.extra !== 'object' || Array.isArray(row.extra)) {return;}
      Object.keys(row.extra).sort().forEach((key) => {
        const column = 'extra.' + key;
        if (!extraColumns.includes(column)) {extraColumns.push(column);}
      });
    });
    const columns = baseColumns.concat(extraColumns);
    const lines = [columns.join(',')];

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const line = columns.map((col) => {
        const value = col.indexOf('extra.') === 0
          ? row.extra && row.extra[col.slice(6)]
          : row[col];
        return this._csvEscape(value);
      });
      lines.push(line.join(','));
    }

    return lines.join('\r\n');
  }

  /** Creates a portable local backup. Nothing is uploaded. */
  exportJSON(records) {
    return JSON.stringify({
      format: 'dtg-progress',
      version: 1,
      exportedAt: new Date().toISOString(),
      records: records || this.getAll()
    }, null, 2);
  }

  /**
   * Imports a backup created by exportJSON(). Existing records are retained
   * unless replace is true. Duplicate ids are removed.
   */
  importJSON(text, replace) {
    let payload;
    try {
      payload = JSON.parse(text);
    } catch (_) {
      throw new Error('invalid-json');
    }
    if (!payload || payload.format !== 'dtg-progress' || payload.version !== 1 || !Array.isArray(payload.records)) {
      throw new Error('invalid-format');
    }
    const validGames = ['memory', 'ball', 'static_ball', 'fusion_quest', 'binocular_invaders'];
    const valid = payload.records.filter((record) => (
      record && typeof record === 'object' && validGames.includes(record.game)
      && typeof record.date === 'string' && !isNaN(new Date(record.date).getTime())
    ));
    if (valid.length !== payload.records.length) {throw new Error('invalid-record');}
    const combined = replace ? valid : valid.concat(this.getAll());
    const seen = new Set();
    const deduplicated = combined
      .filter((record) => {
        const key = record.id || [record.date, record.game, record.score, record.duration].join('|');
        if (seen.has(key)) {return false;}
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, this.maxRecords);
    localStorage.setItem(this.storageKey, JSON.stringify(deduplicated));
    return deduplicated.length;
  }

  _csvEscape(value) {
    if (value === null || value === undefined) {return '';}
    const str = String(value);
    if (/[",\r\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  _toNumberOrNull(value) {
    if (value === null || value === undefined || value === '') {return null;}
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
