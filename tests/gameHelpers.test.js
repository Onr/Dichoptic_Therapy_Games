const GameHelpers = require('../src/utils/gameHelpers.js');

describe('GameHelpers', () => {
  test('green contrast changes the green channel around the 100% baseline', () => {
    expect(GameHelpers.applyColorTransforms('green', 100, 100)).toBe('rgb(0,255,0)');
    expect(GameHelpers.applyColorTransforms('green', 100, 50)).toBe('rgb(64,192,64)');
  });

  test('red and blue channels use the same predictable transform', () => {
    expect(GameHelpers.applyColorTransforms('red', 100, 100)).toBe('rgb(255,0,0)');
    expect(GameHelpers.applyColorTransforms('blue', 50, 100)).toBe('rgb(0,0,128)');
  });

  test('pointer coordinates preserve a valid zero client coordinate', () => {
    expect(GameHelpers.getPointerCoordinates(
      { clientX: 0, clientY: 0 },
      { left: 10, top: 20 }
    )).toEqual({ x: -10, y: -20 });
  });

  test('pointer coordinates fall back to touch data and tolerate missing data', () => {
    expect(GameHelpers.getPointerCoordinates(
      { touches: [{ clientX: 25, clientY: 30 }] },
      { left: 5, top: 10 }
    )).toEqual({ x: 20, y: 20 });
    expect(GameHelpers.getPointerCoordinates({}, { left: 0, top: 0 })).toBeNull();
  });

  test('safeJSONParse returns a fallback for corrupt input', () => {
    expect(GameHelpers.safeJSONParse('{bad', [])).toEqual([]);
    expect(GameHelpers.safeJSONParse('{"ok":true}', null)).toEqual({ ok: true });
  });
});
