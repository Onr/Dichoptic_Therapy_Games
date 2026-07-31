const fs = require('fs');
const vm = require('vm');

describe('service worker subdirectory support', () => {
  test('precache URLs stay inside the GitHub Pages project scope', async () => {
    const listeners = {};
    let addedAssets = [];
    const context = {
      URL,
      Response: class Response {},
      console: { log() {}, warn() {}, error() {} },
      fetch: jest.fn(),
      caches: {
        open: jest.fn(async () => ({
          addAll: async (assets) => { addedAssets = assets; },
          put: jest.fn()
        })),
        keys: jest.fn(async () => []),
        match: jest.fn(),
        delete: jest.fn()
      },
      self: {
        location: { href: 'https://onr.github.io/Dichoptic_Therapy_Games/sw.js' },
        registration: { scope: 'https://onr.github.io/Dichoptic_Therapy_Games/' },
        clients: { claim: jest.fn(), matchAll: jest.fn(async () => []) },
        skipWaiting: jest.fn(),
        addEventListener: (name, handler) => { listeners[name] = handler; }
      },
      indexedDB: { open: jest.fn() },
      setTimeout,
      clearTimeout
    };
    vm.runInNewContext(fs.readFileSync('sw.js', 'utf8'), context);
    let installation;
    listeners.install({ waitUntil(promise) { installation = promise; } });
    await installation;
    expect(addedAssets).toContain('https://onr.github.io/Dichoptic_Therapy_Games/index.html');
    expect(addedAssets).toContain('https://onr.github.io/Dichoptic_Therapy_Games/fusion_quest.html');
    expect(addedAssets).toContain('https://onr.github.io/Dichoptic_Therapy_Games/space_invaders.html');
    expect(addedAssets).toContain('https://onr.github.io/Dichoptic_Therapy_Games/src/utils/invadersEngine.js');
    expect(addedAssets.every((url) => url.startsWith('https://onr.github.io/Dichoptic_Therapy_Games/'))).toBe(true);
  });

  test.each(['index.html', 'memory_game.html', 'ball_game.html', 'static_ball_game.html', 'fusion_quest.html', 'space_invaders.html', 'progress.html'])(
    '%s registers offline support',
    (file) => {
      expect(fs.readFileSync(file, 'utf8')).toContain('src/utils/registerServiceWorker.js');
    }
  );
});
