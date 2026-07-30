/**
 * Shared, dependency-free helpers used by the canvas games.
 */
class GameHelpers {
  static clampChannel(value) {
    return Math.round(Math.max(0, Math.min(255, value)));
  }

  /**
   * Apply brightness and contrast percentages to a dichoptic channel.
   * Contrast is centred on 128, matching the browser's CSS contrast filter:
   * 100% is unchanged, 0% is neutral grey, and 200% doubles separation.
   */
  static applyColorTransforms(color, brightness, contrast) {
    const channels = color === 'red'
      ? [255, 0, 0]
      : color === 'blue'
        ? [0, 0, 255]
        : [0, 255, 0];
    const brightnessFactor = Number(brightness) / 100;
    const contrastFactor = Number(contrast) / 100;
    const adjusted = channels.map((channel) => {
      const brightened = channel * brightnessFactor;
      return GameHelpers.clampChannel((brightened - 128) * contrastFactor + 128);
    });
    return `rgb(${adjusted.join(',')})`;
  }

  static getPointerCoordinates(event, rect) {
    const source = event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)
      ? event
      : event && event.touches && event.touches[0];
    if (!source) {return null;}
    return {
      x: source.clientX - rect.left,
      y: source.clientY - rect.top
    };
  }

  static safeJSONParse(raw, fallback) {
    if (!raw) {return fallback;}
    try {
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  }
}

if (typeof window !== 'undefined') {window.GameHelpers = GameHelpers;}
if (typeof module !== 'undefined' && module.exports) {module.exports = GameHelpers;}
