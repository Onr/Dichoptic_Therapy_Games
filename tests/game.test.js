const { getGridSize, shuffle } = require('../game.js');

describe('getGridSize', () => {
  test('returns 4 for easy', () => {
    expect(getGridSize('easy')).toBe(4);
  });

  test('returns 8 for medium', () => {
    expect(getGridSize('medium')).toBe(8);
  });

  test('returns 12 for hard', () => {
    expect(getGridSize('hard')).toBe(12);
  });
});

describe('shuffle', () => {
  test('returns array containing same elements', () => {
    const arr = [1, 2, 3, 4];
    const result = shuffle(arr.slice());
    expect(result).toHaveLength(arr.length);
    expect(result).toEqual(expect.arrayContaining(arr));
  });
});
