class FusionScoring {
  static catchStars(bothVisible) {
    return bothVisible ? 1 : 0;
  }
}

if (typeof window !== 'undefined') {
  window.FusionScoring = FusionScoring;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FusionScoring;
}
