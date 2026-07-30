const FusionScoring = require('../src/utils/fusionScoring.js');

describe('Fusion Quest check-gate scoring', () => {
  test('awards one star only when both eye targets are visible', () => {
    expect(FusionScoring.catchStars(true)).toBe(1);
    expect(FusionScoring.catchStars(false)).toBe(0);
  });
});
