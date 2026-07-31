const InvadersEngine = require('../src/utils/invadersEngine.js');

describe('InvadersEngine', () => {
  test('starts paused and moves only after start', () => {
    const engine = new InvadersEngine({ random: () => 0.8 });
    const initialX = engine.formationX;
    engine.step(0.05);
    expect(engine.formationX).toBe(initialX);
    engine.start();
    engine.step(0.05);
    expect(engine.formationX).toBeGreaterThan(initialX);
  });

  test('clamps the player to the arena', () => {
    const engine = new InvadersEngine();
    engine.start();
    engine.setDirection(-1);
    for (let i = 0; i < 100; i += 1) engine.step(0.05);
    expect(engine.playerX).toBe(38);
    engine.setDirection(1);
    for (let i = 0; i < 200; i += 1) engine.step(0.05);
    expect(engine.playerX).toBe(engine.width - 38);
  });

  test('fires with a cooldown and counts shots', () => {
    const engine = new InvadersEngine({ difficulty: 'calm' });
    engine.start();
    expect(engine.fire()).toBe(true);
    expect(engine.fire()).toBe(false);
    expect(engine.shots).toBe(1);
    for (let i = 0; i < 10; i += 1) engine.step(0.05);
    expect(engine.fire()).toBe(true);
    expect(engine.shots).toBe(2);
  });

  test('projectile collision clears a target and updates accuracy', () => {
    const engine = new InvadersEngine({ random: () => 0.8 });
    engine.start();
    const target = engine.invaders[0];
    engine.projectiles.push({ x: target.x, y: target.y + 5, active: true });
    engine.shots = 1;
    engine.step(0.01);
    expect(target.alive).toBe(false);
    expect(engine.hits).toBe(1);
    expect(engine.score).toBeGreaterThan(0);
    expect(engine.summary().accuracy).toBe(100);
  });

  test('clearing a formation advances the wave', () => {
    const events = [];
    const engine = new InvadersEngine({ onEvent: (name) => events.push(name) });
    engine.start();
    engine.invaders.forEach((target) => { target.alive = false; });
    engine.step(0.01);
    expect(engine.wave).toBe(2);
    expect(engine.invaders.some((target) => target.alive)).toBe(true);
    expect(events).toContain('wave');
  });

  test('finishes once at the session time limit', () => {
    const finishes = [];
    const engine = new InvadersEngine({ duration: 30, onEvent: (name) => { if (name === 'finish') finishes.push(name); } });
    engine.start();
    for (let i = 0; i < 601; i += 1) engine.step(0.05);
    engine.finish('again');
    expect(engine.finished).toBe(true);
    expect(finishes).toHaveLength(1);
    expect(engine.summary().duration).toBe(30);
  });

  test('reduced-motion setting lowers formation speed', () => {
    const normal = new InvadersEngine({ reducedMotion: false });
    const reduced = new InvadersEngine({ reducedMotion: true });
    expect(reduced.config().speed).toBeLessThan(normal.config().speed);
  });
});
