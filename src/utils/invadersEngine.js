/**
 * Deterministic game-state engine for Binocular Invaders.
 * Rendering and input live in space_invaders.html so this module can be
 * exercised without a canvas or browser animation loop.
 */
class InvadersEngine {
  constructor(options) {
    const settings = options || {};
    this.width = 800;
    this.height = 500;
    this.random = settings.random || Math.random;
    this.onEvent = settings.onEvent || function () {};
    this.difficulty = settings.difficulty || 'calm';
    this.duration = Math.max(30, Number(settings.duration) || 120);
    this.reducedMotion = Boolean(settings.reducedMotion);
    this.elapsed = 0;
    this.score = 0;
    this.shots = 0;
    this.hits = 0;
    this.wave = 1;
    this.paused = true;
    this.finished = false;
    this.playerX = this.width / 2;
    this.playerDirection = 0;
    this.projectiles = [];
    this.formationX = 0;
    this.formationY = 0;
    this.formationDirection = 1;
    this.fireCooldown = 0;
    this.spawnWave();
  }

  config() {
    const presets = {
      calm: { rows: 2, cols: 5, speed: 18, bulletSpeed: 285, cooldown: 0.48 },
      standard: { rows: 3, cols: 6, speed: 27, bulletSpeed: 320, cooldown: 0.38 },
      challenge: { rows: 3, cols: 7, speed: 36, bulletSpeed: 350, cooldown: 0.3 }
    };
    const base = presets[this.difficulty] || presets.calm;
    const waveFactor = Math.min(1.35, 1 + (this.wave - 1) * 0.06);
    return Object.assign({}, base, {
      speed: base.speed * waveFactor * (this.reducedMotion ? 0.72 : 1)
    });
  }

  spawnWave() {
    const config = this.config();
    const spacingX = 76;
    const spacingY = 62;
    const startX = (this.width - (config.cols - 1) * spacingX) / 2;
    this.invaders = [];
    for (let row = 0; row < config.rows; row += 1) {
      for (let col = 0; col < config.cols; col += 1) {
        this.invaders.push({
          id: this.wave + '-' + row + '-' + col,
          x: startX + col * spacingX,
          y: 82 + row * spacingY,
          row,
          alive: true
        });
      }
    }
    this.formationX = 0;
    this.formationY = 0;
    this.formationDirection = this.random() < 0.5 ? -1 : 1;
    this.projectiles = [];
  }

  start() {
    if (!this.finished) {this.paused = false;}
  }

  setPaused(paused) {
    if (!this.finished) {this.paused = Boolean(paused);}
  }

  setDirection(direction) {
    this.playerDirection = Math.max(-1, Math.min(1, Number(direction) || 0));
  }

  fire() {
    if (this.paused || this.finished || this.fireCooldown > 0) {return false;}
    this.projectiles.push({ x: this.playerX, y: 434, active: true });
    this.shots += 1;
    this.fireCooldown = this.config().cooldown;
    this.onEvent('shot', { shots: this.shots });
    return true;
  }

  step(deltaSeconds) {
    if (this.paused || this.finished) {return;}
    const dt = Math.min(0.05, Math.max(0, Number(deltaSeconds) || 0));
    this.elapsed += dt;
    this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    this.playerX += this.playerDirection * 260 * dt;
    this.playerX = Math.max(38, Math.min(this.width - 38, this.playerX));

    const config = this.config();
    this.formationX += this.formationDirection * config.speed * dt;
    const alive = this.invaders.filter((invader) => invader.alive);
    const minX = alive.length ? Math.min.apply(null, alive.map((i) => i.x + this.formationX)) : 100;
    const maxX = alive.length ? Math.max.apply(null, alive.map((i) => i.x + this.formationX)) : 700;
    if (minX < 42 || maxX > this.width - 42) {
      this.formationDirection *= -1;
      this.formationX += this.formationDirection * config.speed * dt * 2;
      this.formationY = Math.min(82, this.formationY + 8);
    }

    this.projectiles.forEach((projectile) => {
      if (!projectile.active) {return;}
      projectile.y -= config.bulletSpeed * dt;
      if (projectile.y < -15) {projectile.active = false;}
      for (let index = 0; index < this.invaders.length; index += 1) {
        const invader = this.invaders[index];
        if (!invader.alive) {continue;}
        const x = invader.x + this.formationX;
        const y = invader.y + this.formationY;
        if (Math.abs(projectile.x - x) <= 25 && Math.abs(projectile.y - y) <= 23) {
          projectile.active = false;
          invader.alive = false;
          this.hits += 1;
          this.score += 100 + Math.max(0, 40 - invader.row * 10);
          this.onEvent('hit', { score: this.score, hits: this.hits });
          break;
        }
      }
    });
    this.projectiles = this.projectiles.filter((projectile) => projectile.active);

    if (this.invaders.every((invader) => !invader.alive)) {
      this.score += 250;
      this.wave += 1;
      this.spawnWave();
      this.onEvent('wave', { wave: this.wave, score: this.score });
    }
    if (this.elapsed >= this.duration) {this.finish('time');}
  }

  finish(reason) {
    if (this.finished) {return;}
    this.finished = true;
    this.paused = true;
    this.playerDirection = 0;
    this.onEvent('finish', { reason: reason || 'stopped', summary: this.summary() });
  }

  summary() {
    return {
      score: this.score,
      hits: this.hits,
      shots: this.shots,
      accuracy: this.shots ? Math.round(this.hits / this.shots * 100) : 0,
      waves: this.wave,
      duration: Math.round(Math.min(this.elapsed, this.duration))
    };
  }
}

if (typeof window !== 'undefined') {window.InvadersEngine = InvadersEngine;}
if (typeof module !== 'undefined' && module.exports) {module.exports = InvadersEngine;}
