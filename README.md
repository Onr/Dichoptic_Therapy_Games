# Dichoptic Therapy Games

A bilingual (English/Hebrew), static collection of browser-based dichoptic
practice activities. The site is hosted on GitHub Pages and does not require a
server or user account.

Live site: <https://onr.github.io/Dichoptic_Therapy_Games/>

## Activities

- Scanning: a dichoptic matching game.
- Tracking: numbered moving targets.
- Saccades: single targets appearing across the visual field.
- Fusion Quest: complementary-eye alignment and stable-hold practice.
- Binocular Invaders: short dichoptic action practice using complementary
  target shapes and cores, with contrast calibration and visibility checks.
- My Progress: combined local history, performance trends, CSV export, and
  JSON backup/import.

These activities are intended only as a clinician-guided adjunct. They do not
diagnose or replace medical evaluation. Stop if symptoms are new or worsening,
or if significant discomfort occurs.

## Privacy and saved progress

Completed sessions are stored in the current browser under
`dtg_progress_v1`. No progress data is uploaded. Browser storage is specific to
that browser and device; use the progress page’s JSON backup to preserve or
move it. CSV export is designed for review with a clinician.

## Local development

Requirements: Node.js 22+ and npm.

```bash
npm ci
npm test -- --runInBand
node scripts/smoke_games.js
npm run serve
```

Then open <http://localhost:8080/>.

## Project structure

- `index.html`: bilingual landing page
- `memory_game.html`, `ball_game.html`, `static_ball_game.html`,
  `fusion_quest.html`, `space_invaders.html`: activities
- `progress.html`: combined local dashboard
- `reading-preferences.css` and `reading-preferences.js`: shared text-size controls for reading pages
- `src/utils/progressTracker.js`: shared progress schema and export/import
- `sw.js`: offline cache, scoped for GitHub Pages subdirectory hosting
- `tests/` and `scripts/smoke_games.js`: automated regression checks

## Deployment

The repository is a static site. Push validated changes to `master`; GitHub
Pages serves the repository content. The CI workflow runs lint, unit tests,
browser-simulation smoke checks, and a high-severity dependency audit.
