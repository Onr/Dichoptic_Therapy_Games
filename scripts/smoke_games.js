/* Smoke-test the four games in jsdom: init without errors + exercise the
   new pause / feedback / visibility logic. Run from the repo root. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require(path.join(process.cwd(), 'node_modules', 'jsdom'));

let failures = 0;
function check(name, cond) {
  if (cond) { console.log('  PASS', name); }
  else { console.log('  FAIL', name); failures++; }
}

function mockCanvas(window) {
  const noop = () => {};
  const ctxMock = new Proxy({}, {
    get: (t, prop) => {
      if (prop === 'canvas') return null;
      return noop;
    },
    set: () => true
  });
  window.HTMLCanvasElement.prototype.getContext = () => ctxMock;
  let rafId = 0;
  const scheduled = new Map();
  window.requestAnimationFrame = (cb) => { rafId++; scheduled.set(rafId, cb); return rafId; };
  window.cancelAnimationFrame = (id) => { scheduled.delete(id); };
  window.__runFrames = (n, startTs) => {
    let ts = startTs || 1000;
    for (let i = 0; i < n; i++) {
      const cbs = [...scheduled.values()];
      scheduled.clear();
      ts += 16.7;
      cbs.forEach(cb => cb(ts));
    }
  };
  return scheduled;
}

function loadGame(file, { withCanvas } = { withCanvas: true }) {
  const html = fs.readFileSync(file, 'utf8')
    // Drop external production utils; they are optional (window.X guards).
    .replace(/<script src="src\/[^"]+"><\/script>/g, '');
  const virtualConsole = new (require(path.join(process.cwd(), 'node_modules', 'jsdom')).VirtualConsole)();
  const errors = [];
  virtualConsole.on('jsdomError', e => errors.push(e.detail || e));
  virtualConsole.sendTo(console, { omitJSDOMErrors: true });
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'https://onr.github.io/Dichoptic_Therapy_Games/' + path.basename(file),
    pretendToBeVisual: false,
    virtualConsole,
    beforeParse(window) {
      if (withCanvas) mockCanvas(window);
      window.addEventListener('error', ev => errors.push(ev.error || ev.message));
    }
  });
  return { dom, errors };
}

console.log('== Tracking (ball_game.html) ==');
{
  const { dom, errors } = loadGame('ball_game.html');
  const w = dom.window;
  check('no script errors on init', errors.length === 0);
  errors.forEach(e => console.log('   error:', e && e.message || e));
  check('pause button labelled', /השהה|Pause/.test(w.document.getElementById('pauseButton').textContent));
  const g = expr => w.eval(expr);
  const ballsBefore = g('JSON.stringify(balls.map(b => [b.x, b.y]))');
  g('togglePause()');
  check('pause sets aria-pressed', w.document.getElementById('pauseButton').getAttribute('aria-pressed') === 'true');
  check('paused message shown', /מושהה|paused/i.test(w.document.getElementById('message').textContent));
  w.__runFrames(5);
  check('balls frozen while paused', g('JSON.stringify(balls.map(b => [b.x, b.y]))') === ballsBefore);
  g('togglePause()');
  check('resume restores aria-pressed', w.document.getElementById('pauseButton').getAttribute('aria-pressed') === 'false');
  w.__runFrames(5);
  const moved = g('JSON.stringify(balls.map(b => [b.x, b.y]))') !== ballsBefore;
  check('balls move after resume (speed>0)', g('SPEED') === 0 ? true : moved);
  // Spread the balls out deterministically so each click unambiguously hits
  // one ball (random spawns may overlap, which is fine in-game but makes
  // click assertions flaky).
  g('balls.forEach((b, i) => { b.x = BALL_RADIUS + 5 + (i % 7) * (2 * BALL_RADIUS + 8); b.y = BALL_RADIUS + 5 + Math.floor(i / 7) * (2 * BALL_RADIUS + 8); b.vx = 0; b.vy = 0; })');
  // Wrong-click feedback: click the ball numbered != 1
  const wrongBall = g('balls.find(b => b.num !== 1)');
  w.__click = wrongBall; g('handlePointerDown({ preventDefault(){}, clientX: window.__click.x, clientY: window.__click.y })');
  check('wrong click shows inline error', w.document.getElementById('message').classList.contains('error'));
  const rightBall = g('balls.find(b => b.num === 1)');
  w.__click = rightBall; g('handlePointerDown({ preventDefault(){}, clientX: window.__click.x, clientY: window.__click.y })');
  check('correct click clears error + advances', !w.document.getElementById('message').classList.contains('error') && g('nextNumber') === 2 && rightBall.clicked === true);
  // finish the game: click all balls in order, ensure completion happens once
  for (let n = 2; n <= g('numBalls'); n++) {
    w.__n = n;
    g('(function(){ const b = balls.find(x => x.num === window.__n); handlePointerDown({ preventDefault(){}, clientX: b.x, clientY: b.y }); })()');
  }
  w.__runFrames(2);
  check('game finishes', g('gameFinished') === true);
  g('loop()'); // direct redraw call after finish must not re-celebrate (guard)
  g('togglePause()');
  check('togglePause no-op after finish', g('isPaused') === false);
  dom.window.close();
}

console.log('== Saccades (static_ball_game.html) ==');
{
  const { dom, errors } = loadGame('static_ball_game.html');
  const w = dom.window;
  check('no script errors on init', errors.length === 0);
  errors.forEach(e => console.log('   error:', e && e.message || e));
  const g = expr => w.eval(expr);
  check('togglePause defined', g("typeof togglePause") === 'function');
  check('pause button labelled', /השהה|Pause/.test(w.document.getElementById('pauseButton').textContent));
  const clicksBefore = g('clickCount');
  g('togglePause()');
  check('paused: isGameActive false', g('isPaused') === true && g('isGameActive') === false);
  // clicking the ball while paused must be ignored
  g('handlePointerDown({ preventDefault(){}, clientX: currentBall.x, clientY: currentBall.y })');
  check('clicks ignored while paused', g('clickCount') === clicksBefore);
  g('togglePause()');
  check('resume reactivates', g('isPaused') === false && g('isGameActive') === true);
  g('handlePointerDown({ preventDefault(){}, clientX: currentBall.x, clientY: currentBall.y })');
  check('click counts after resume', g('clickCount') === clicksBefore + 1);
  check('progressbar aria-valuenow updated', w.document.getElementById('colorBar').getAttribute('aria-valuenow') !== '0');
  // visibility auto-pause
  Object.defineProperty(w.document, 'hidden', { configurable: true, get: () => true });
  w.document.dispatchEvent(new w.Event('visibilitychange'));
  check('auto-pauses when hidden', g('isPaused') === true);
  dom.window.close();
}

console.log('== Fusion Quest (fusion_quest.html) ==');
{
  const { dom, errors } = loadGame('fusion_quest.html');
  const w = dom.window;
  const d = w.document;
  check('no script errors on init', errors.length === 0);
  errors.forEach(e => console.log('   error:', e && e.message || e));
  check('setup opens before play', d.getElementById('setupOverlay').hidden === false);
  check('mobile setup reports ready', !d.getElementById('startButton').disabled && /Both visible/.test(d.getElementById('startButton').textContent));
  d.getElementById('startButton').click();
  check('guided tutorial opens', !d.getElementById('tutorialOverlay').hidden && /Step 1/.test(d.getElementById('tutorialProgress').textContent));
  d.getElementById('tutorialNext').click();
  check('tutorial advances', /Step 2/.test(d.getElementById('tutorialProgress').textContent));
  d.getElementById('tutorialSkip').click();
  check('starts a 12-round session', d.getElementById('setupOverlay').hidden && d.getElementById('roundStat').textContent.trim() === '1 / 12');
  check('alignment controls enabled', !d.getElementById('leftButton').disabled && !d.getElementById('lockButton').disabled);
  d.getElementById('pauseButton').click();
  check('pause disables alignment', !d.getElementById('pauseOverlay').hidden && d.getElementById('leftButton').disabled);
  d.getElementById('resumeButton').click();
  check('resume restores alignment', d.getElementById('pauseOverlay').hidden && !d.getElementById('leftButton').disabled);
  const transform = d.getElementById('greenLayer').style.transform;
  const offsetMatch = transform.match(/([+-]?\d+)px/);
  const offset = offsetMatch ? Number(offsetMatch[1]) : NaN;
  check('round begins with visible separation', Number.isFinite(offset) && Math.abs(offset) >= 32);
  const step = Number(d.getElementById('stepSize').value);
  const button = offset > 0 ? d.getElementById('leftButton') : d.getElementById('rightButton');
  for (let i = 0; i < Math.round(Math.abs(offset) / step); i++) button.click();
  d.getElementById('lockButton').click();
  check('aligned portal is accepted', d.getElementById('portal').classList.contains('locked'));
  check('stable fusion hold begins', d.getElementById('holdMeter').classList.contains('active'));
  // V3: journey, remembered settings, and active drift-correction holds
  check('gate path renders 12 dots', d.getElementById('gatePath').querySelectorAll('.gate-dot').length === 12);
  check('sound/vibration opt-in exists and is off by default', d.getElementById('enableFeedback') && !w.eval("JSON.parse(localStorage.getItem('fusionQuestSettings')).feedback"));
  check('settings remembered after start', w.eval("localStorage.getItem('fusionQuestSettings') !== null"));
  check('arrows stay active during the hold', !d.getElementById('leftButton').disabled && d.getElementById('lockButton').disabled);
  w.__runFrames(12);
  const heldTransform = d.getElementById('greenLayer').style.transform;
  check('portal drifts during the hold', d.getElementById('portal').classList.contains('locked') === false || !/\+ 0px/.test(heldTransform));
  d.getElementById('leftButton').click();
  check('arrow taps correct drift during hold', d.getElementById('greenLayer').style.transform !== heldTransform);
  dom.window.close();
}

console.log('== Scanning (memory_game.html + game.js) ==');
(async () => {
  const html = fs.readFileSync('memory_game.html', 'utf8')
    .replace(/<script src="src\/[^"]+"><\/script>/g, '')
    .replace(/<script[^>]*src="game\.js[^"]*"[^>]*><\/script>/g, '');
  const gameJs = fs.readFileSync('game.js', 'utf8');
  const htmlWithGame = html.replace('</body>', '<script>' + gameJs + '</scr' + 'ipt></body>');
  const errors = [];
  const dom = new JSDOM(htmlWithGame, {
    runScripts: 'dangerously',
    url: 'https://onr.github.io/Dichoptic_Therapy_Games/memory_game.html',
    beforeParse(window) {
      window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener(){}, removeListener(){} }));
      window.addEventListener('error', ev => errors.push(ev.error || ev.message));
    }
  });
  const w = dom.window;
  // jsdom fires DOMContentLoaded asynchronously; wait for the board to build.
  await new Promise(r => setTimeout(r, 100));
  check('no script errors on init', errors.length === 0);
  errors.forEach(e => console.log('   error:', e && e.message || e));
  const cards = [...w.document.querySelectorAll('.card')];
  check('board built (16 cards easy)', cards.length === 16);
  // find two mismatching cards
  const sym = c => c.querySelector('.face-layer').textContent;
  const a = cards[0];
  const b = cards.find(c => c !== a && sym(c) !== sym(a));
  a.click(); b.click();
  check('mismatch flips both', a.classList.contains('flipped') && b.classList.contains('flipped'));
  // board must stay locked during the 1s reveal: a third card cannot flip
  const c3 = cards.find(c => c !== a && c !== b && !c.classList.contains('flipped'));
  c3.click();
  check('third card blocked during mismatch reveal (bug fix)', !c3.classList.contains('flipped'));
  // after the 1s reveal the board unlocks and the third card can flip
  await new Promise(r => setTimeout(r, 1100));
  c3.click();
  check('board unlocks after reveal', c3.classList.contains('flipped'));
  // c3 is now the pending first card; clicking its partner should match both
  const partner = cards.find(c => c !== c3 && sym(c) === sym(c3));
  partner.click();
  check('matching pair marked matched', c3.classList.contains('matched') && partner.classList.contains('matched'));
  dom.window.close();

  console.log(failures === 0 ? '\nALL SMOKE TESTS PASSED' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})();
