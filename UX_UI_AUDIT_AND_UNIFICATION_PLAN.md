# Dichoptic Therapy Games — UI/UX Audit and Unification Plan

**Audit date:** 11 July 2026  
**Scope:** Home hub (`index.html`), Scanning / Memory (`memory_game.html`, `game.js`, `styles.css`), Tracking (`ball_game.html`), and Saccades (`static_ball_game.html`).  
**Purpose:** Make the games feel like one calm, trustworthy therapy product while keeping the visual stimulus clear, predictable, and appropriate for clinician-guided dichoptic practice.

> This is a product and interface audit, not medical advice. Any change to stimulus colour, contrast, size, speed, occlusion, or session dosage should be reviewed and signed off by the treating clinician before release.

## Executive summary

The project already has good foundations: bilingual support, in-game brightness/contrast controls, clear game categories, responsive work in the memory board, and local score/history features. The main experience problem is inconsistency. The hub looks like a light, clinical education site; each game switches to a separate dark, highly decorative arcade interface. Controls, language placement, success feedback, scoring, layouts, and input accessibility differ game by game.

The recommended direction is **one “therapy session” shell** shared by all games: a quiet neutral background, a fixed session header, one consistent settings drawer, a single progress/status strip, and a standard completion modal. Let the *dichoptic target* be the only strong colour on screen. This lowers visual noise and makes the therapeutic task easier to understand.

## Implementation status — 11 July 2026

Completed in this iteration:

- [x] Replaced the circular targets in Tracking and Saccades with a shared, single-solid-colour spaceship silhouette. Sequence numbers remain in the instruction/status text rather than on the therapeutic target.
- [x] Added mobile viewport metadata, semantic settings toggles, visible keyboard focus treatment, reduced-motion styles, and an assistive live region for the memory game.
- [x] Replaced Tracking's blocking wrong-target alert with inline feedback and its automatic post-win restart with an explicit completion dialog.
- [x] Added safe target-placement logic to keep Saccades targets away from visible controls and reserved a protected play corridor in Tracking.
- [x] Added Pause/Resume to Saccades and excluded paused time from its completion result.
- [x] Fixed Memory completion telemetry to use the actual timer and removed its duplicate leaderboard write.
- [x] Fixed the test-only `UserCounter` auto-initialisation side effect; automated test isolation now works reliably.

Still requiring clinical/product sign-off before release: target geometry/visual-angle defaults, therapeutic colour/filter defaults, task speed and duration, and the full visual-shell redesign described below.

## Highest-priority findings

| Priority | Finding | User impact | Recommended action |
|---|---|---|---|
| P0 | Game screens use unrelated dark blue gradients, glass panels, glow, pulsing, and celebration motion while the hub is light and clinical. | The product feels like several unrelated sites; decorative colour/motion competes with the red/right-eye stimulus. | Introduce shared design tokens and a common game shell; remove nonessential coloured effects from active play. |
| P0 | The tracking game uses numbered circles and white labels; the saccade game uses plain circles. | The target language is inconsistent and circles can be visually confused with decorative UI. | Replace tracking circles with a single solid, spaceship-shaped target; use the same target family in all target-based games. |
| P0 | Important controls can overlap or obscure the canvas on smaller screens; the canvas uses the full viewport. | Targets may appear behind controls or too close to them, making a trial unfair or frustrating. | Define a safe play area that excludes header, status, and control zones; never spawn targets there. |
| P0 | The games are pointer-only canvas interactions (`mousedown`/`touchstart`) with no keyboard or screen-reader equivalent. | Keyboard-only users cannot complete the games; accessibility state and instructions are incomplete. | Provide keyboard-operable alternatives or explicitly define a tested, clinically appropriate accessible mode; add semantic controls and live feedback. |
| P1 | Game settings vary in order, control labels, colour terminology, storage keys, and language-switch locations. | Users must relearn the interface for each exercise. | Standardize labels, default values, units, presets, persistence, and placement. |
| P1 | Immediate browser alerts are used for wrong-order tracking clicks. | A modal browser alert interrupts attention, is visually inconsistent, and can be stressful. | Replace with a brief inline, non-blocking error cue and reset/continue rule. |
| P1 | Completion experiences differ: auto-restart after a brief animation, a custom modal, and a fallback modal. | Users do not have a predictable end-of-session moment or chance to review progress. | Use one accessible completion modal with summary, replay, adjust settings, and return-to-hub actions. |
| P1 | There is no shared session goal, pause control, or clear indication of exercise duration. | Users and therapists cannot easily manage a short, intentional practice session. | Add configurable session goal, pause, elapsed time, and a concise “what this exercise trains” line. |
| P2 | Memory game scales to 8x8 and 12x12 on narrow screens, resulting in very small targets. | Tap accuracy and visual comfort may suffer. | Gate high densities behind device/viewport requirements and offer “recommended” difficulty. |
| P2 | Scores and leaderboards emphasize speed without enough context. | Users may rush rather than follow the intended visual-therapy technique. | Frame metrics as “personal practice record,” prioritize completion/accuracy, and make competitive framing optional. |

## Recommended unified experience

### 1. Shared therapy-session layout

Use this layout for Scanning, Tracking, and Saccades.

```
┌─────────────────────────────────────────────────────────────┐
│ ← Practice Hub   Exercise name     [EN/עברית] [Pause]        │
├─────────────────────────────────────────────────────────────┤
│ What to do: short, one-sentence instruction                 │
│ Session: 02:14   Progress: 4 / 7       [Settings]            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    SAFE PLAY AREA                           │
│      (only therapeutic targets and essential feedback)      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Settings drawer: target, difficulty, eye filters, help      │
└─────────────────────────────────────────────────────────────┘
```

Design rules:

- Use a neutral, low-distraction background (for example warm off-white or near-black only if clinician-tested). Do not use animated gradients, decorative geometric patterns, confetti, or unrelated saturated colours during play.
- Reserve red and the selected right-eye colour (green or blue) for eye-specific therapeutic targets. Do not reuse them as generic success, warning, progress, or decorative colours.
- Use one typeface, one 8px spacing scale, one radius, one shadow level, and shared button states across all pages.
- Keep target, instruction, progress, settings, and back navigation in the same place in every game.
- Provide `Pause`, `Restart`, `Settings`, and `How it works` consistently. Restart should require confirmation only when a session is already in progress.
- Make the settings drawer collapsed by default after setup, but always visible as a labelled button and fully keyboard operable.

### 2. Target redesign: tracking circles → a single-colour spaceship

Replace the moving numbered circles in **Tracking** with a simple, friendly spaceship silhouette. The user specifically requested a single, solid colour; this should be treated as a hard requirement.

**Target specification**

- Shape: a single compact spaceship silhouette, facing its direction of travel. Suggested geometry: rounded nose, small symmetric fins, and a short rectangular/triangular exhaust—not a detailed illustration.
- Fill: exactly one flat solid dichoptic colour per target: red for one eye; the selected green or blue for the other. No gradients, internal highlights, outlines, glow, shadow, texture, glass effect, or multicolour exhaust.
- Identifier: put the sequence number in the status strip (“Next: 3”), not as white text inside the target. This maintains the solid-colour requirement and removes a competing binocular cue.
- Size: start with a clinician-configurable visual-angle target size; use the same screen-relative fallback across devices. Keep a generous touch/click hit area that is invisible and does not change the visual stimulus.
- Motion: direction changes should be smooth and bounded; avoid abrupt speed spikes. The target must remain fully inside the safe play area and never under a control panel.
- Colour alternation: preserve the current red/right-eye colour assignment logic, but label it in the setup summary (for example, “Target colour: red / green”). Any eye mapping change must be explicit and persisted only with user consent.
- Reduced-motion behavior: reduce UI transitions, not the clinician-prescribed target motion. If a non-therapeutic animation is retained, it must respect `prefers-reduced-motion`.

**Apply the same visual language to Saccades**

Use a stationary spaceship target in Saccades too (optionally with a distinct but still solid silhouette, such as a small beacon ship). Avoid a generic circle in one exercise and a spaceship in another. Make the target identity consistent; vary only the movement rule and instruction.

**Acceptance criteria**

- [ ] Every tracking target is a spaceship silhouette with one solid fill colour.
- [ ] No number, gradient, outline, glow, texture, or second colour appears inside/on the target.
- [ ] The next sequence number is available outside the target in text and announced accessibly.
- [ ] Targets cannot spawn beneath controls, within the header/status zone, or partly outside the canvas.
- [ ] Red/green and red/blue modes render as expected through the intended glasses and are signed off by a clinician.
- [ ] Target size, speed, and hit area are tested on desktop, tablet, and phone.

## Game-by-game audit and recommendations

### A. Practice Hub

**What works**

- The home page establishes a calm, professional typography and information hierarchy.
- It explains the three exercise types and includes bilingual educational material and a medical caveat.

**Improve**

- Add a compact “Before you begin” card directly before game selection: glasses type, screen brightness guidance, seating/distance guidance supplied by clinician, and a clear stop rule (pain, dizziness, headache, worsening symptoms).
- Give each game card a consistent metadata row: estimated session length, target skill, equipment, and difficulty range. Avoid claiming outcomes; use clinician-approved wording.
- Add game preview illustrations that match the new solid spaceship/target family rather than generic cards.
- Persist language across every page with one storage key and read it before first paint to avoid a language flash.
- Rename labels consistently: **Scanning**, **Tracking**, **Saccades** everywhere. The current titles/roles are understandable but need a uniform “Exercise / goal / start” presentation.

### B. Scanning / Memory

**What works**

- Difficulty selection, brightness/contrast controls, responsive board calculation, keyboard activation on cards, timer/moves/score, and local leaderboard are already present.

**Improve**

- Place the instruction and status bar above the board; the leaderboard belongs behind a “Personal results” disclosure or on the completion modal, not in the main play path.
- Replace emoji symbols with a clinician-tested, consistent stimulus set. Emojis vary by operating system, can be multicolour, and may introduce unintended visual differences.
- Reconsider 8×8 and 12×12 grids for mobile. If they are clinically required, show a minimum screen-size message rather than shrinking cards to tiny dimensions. Otherwise offer smaller verified grids or paged rounds.
- Add visible focus states and use actual `<button>` elements for cards. When matched, retain an appropriate disabled state and announce progress (for example, “Pair found. 3 of 8 pairs.”).
- Fix completion data: the code tracks `timer`, but completion/analytics use `game.time`, which is not defined. The completion summary can show an incorrect/empty time.
- Avoid updating the local leaderboard twice on completion; the current flow calls it before and inside the completion handler.
- Add a real help trigger. Instruction copy exists in translations but is not exposed as a visible “How to play” interaction.

### C. Tracking

**What works**

- Difficulty, target count, text-size, eye-specific brightness/contrast, green/blue switch, bilingual labels, restart, and auto-collapse of settings are implemented.

**Improve**

- Implement the solid-colour spaceship target specification above and move sequence text to the status strip.
- Replace `alert()` feedback for a wrong target with a 1–2 second inline message such as “Try the next target: 4.” Use a non-colour cue (brief target scale or status text) without changing the therapeutic target’s colour.
- Do not auto-start a new game two seconds after success. Show a stable result state and wait for the user to choose “Play again” or “Back to hub.”
- Add a session timer/progress and accuracy metric (wrong taps) only if approved; distinguish the therapeutic goal from game score.
- Mark the controls header as a semantic button with `aria-expanded`, keyboard handling, and a visible focus indicator.
- Add `viewport` meta tag, `lang`/`dir` updates, and responsive layout rules. The page currently relies on absolute overlay controls at fixed offsets.
- Generate targets after calculating the protected UI rectangles; support safe margins so a moving target does not travel beneath overlays.

### D. Saccades

**What works**

- Clear one-target-at-a-time interaction, eye filter controls, localisation, a completion modal, and a local personal-results list.

**Improve**

- Replace the circle with the shared solid-colour target family and use a status label such as “Targets found: 12,” rather than an arcade “speed meter.”
- The red→green speed bar, green success flash, glow, and pulsing use colours that may conflict with the dichoptic stimulus and create visual distraction. Replace it with neutral monochrome progress (or hide it in therapeutic mode).
- The task is currently endless until the bar fills and drains continuously; use a clear clinician-configurable round length (for example number of targets or time) and predictable completion condition.
- Add a pause control; currently the interval continues behind the UI unless completion occurs.
- Use a modal dialog with focus management, Escape behavior, focus return, labelled title, and a keyboard-operable close button. Do the same for personal results.
- Keep personal results local and describe that clearly; include a “Clear my results” control.

## Accessibility and inclusive-design checklist

### Must fix before a broad release

- [ ] Add `meta name="viewport"` to every game page.
- [ ] Use semantic buttons for every clickable control; remove `onclick`-only interactions or add equivalent event handling.
- [ ] Add visible `:focus-visible` styles that meet contrast requirements.
- [ ] Give control-drawer toggles `aria-expanded`, `aria-controls`, and keyboard support.
- [ ] Make all dialogs true modal dialogs: `role="dialog"`, `aria-modal="true"`, labelled title, focus trap, Escape close where appropriate, and focus restoration.
- [ ] Provide an accessible alternative for canvas-only tasks or document/implement a clinically appropriate alternative interaction mode.
- [ ] Announce key state changes with a concise `aria-live="polite"` region: next target, match found, round complete, settings saved.
- [ ] Respect `prefers-reduced-motion` for decorative movement, transitions, pulsing, and celebrations.
- [ ] Verify contrast for all non-therapeutic text and controls at 200% zoom and in Windows High Contrast / forced-colors mode.
- [ ] Test both Hebrew RTL and English LTR layouts, including navigation order, icon direction, overlays, modals, and slider labels.

### Therapeutic-safety review

- [ ] Clinical owner approves all default target colours, contrast/brightness ranges, target sizes, speeds, spacing, and exercise duration.
- [ ] Generic UI colours never masquerade as eye-specific stimuli.
- [ ] A visible pause/stop route is always available.
- [ ] The pre-game screen tells users when to stop and seek clinical advice.
- [ ] No competitive score or time pressure is presented as a treatment result.
- [ ] All claims on the hub are reviewed against the intended clinical use and local regulatory requirements.

## Implementation checklist

### Phase 1 — Foundation (P0)

- [ ] Create shared `tokens.css` with semantic tokens: background, surface, text, muted text, border, focus, action, status, and dichoptic-left/right colours.
- [ ] Create shared `game-shell.css` and a minimal shared header/status/settings-drawer markup pattern.
- [ ] Move language preference to one consistent key and apply `lang`/`dir` on load.
- [ ] Add a shared protected-play-area helper for canvas games.
- [ ] Replace canvas target drawing with the solid-colour spaceship silhouette in Tracking and Saccades.
- [ ] Remove target-internal numbers; render “Next target” in the shared status area.
- [ ] Add Pause, Restart, Back, and Help in the same locations on every game.

### Phase 2 — Task clarity and feedback (P1)

- [ ] Standardize setup labels and order: exercise level, round goal, eye/filter settings, colour mode, accessibility options.
- [ ] Add named clinician-approved presets and “Reset to prescribed settings.”
- [ ] Replace `alert()` and auto-restart behavior with inline feedback and a common completion modal.
- [ ] Define a standard result summary: duration, progress/completion, optional accuracy, and “settings used.”
- [ ] Move leaderboards to optional “Personal bests”; avoid medical or cross-user interpretation.
- [ ] Add a minimal onboarding step for first-time users, then allow “Don’t show again.”

### Phase 3 — Quality and hardening (P2)

- [ ] Replace emoji memory content with consistent tested assets.
- [ ] Add responsive breakpoints and device support rules; do not silently make targets smaller than validated minimums.
- [ ] Add unit tests for progress, completion, target safe-area placement, language preference, and persistence.
- [ ] Add automated accessibility checks (for DOM screens) and a manual canvas accessibility test protocol.
- [ ] Fix the memory completion-time reference (`game.time` → the tracked timer) and duplicate leaderboard update.
- [ ] Add an explicit privacy/settings screen for clearing local game data.

## Verification plan

Use this checklist as release criteria. Test with at least Chrome, Safari on iOS/iPadOS, and Firefox; in English and Hebrew; with mouse, touch, and keyboard.

| Area | Verification |
|---|---|
| Visual unification | All three games use the same header, status strip, settings drawer, type scale, button hierarchy, and completion modal. |
| Tracking target | Screenshot/video inspection confirms a single solid-colour spaceship, no label inside, and sequence appears outside target. |
| Saccade target | Same target family, single solid fill, predictable stationary placement, and no decorative colour effects during the trial. |
| Safe area | At each viewport size, run 100 generated targets; none overlap header, controls, status, edge margin, or modal region. |
| Input | Mouse/touch activation works; non-canvas controls are fully keyboard operable; accessible alternative/mode is verified for the therapeutic task. |
| Language | English ↔ Hebrew switch changes visible labels, document `lang`, direction, navigation order, dialog layout, and persists through every game. |
| Settings | Eye settings and colour mode persist intentionally, reset correctly, and display their current values/units. |
| Completion | Result is accurate, stays visible until a user action, returns focus correctly, and never auto-starts another session unexpectedly. |
| Reduced motion | OS preference stops decorative pulses, flashing, and transitions without altering approved task parameters. |
| Mobile | No clipped controls; target hit area is usable; play area remains clear; high-density memory levels are blocked or adapted according to validation. |
| Clinical review | A clinician signs off the stimulus rendering through the intended glasses, including red–green and red–blue modes. |

## Technical notes observed during the audit

- The home page has an inline light design system, while the memory game uses `styles.css` and the two canvas games have separate inline CSS. Consolidating these is the fastest path to visual consistency.
- Tracking and Saccades currently use absolute overlay controls and create targets from the full canvas dimensions. A safe-area calculation is required, not only a responsive visual layout.
- Memory has useful responsive sizing but high-density boards can still produce very small cards. “Fits” should not be treated as “comfortable and clinically valid.”
- The test command cannot currently execute in this workspace because the Jest executable/dependencies are not installed (`jest: not found`). Run `npm install` (or the project’s chosen package-manager install command) before using automated test results as release evidence.

## Suggested success measures

- Users can start any exercise and identify the next action within 5 seconds without opening settings.
- A returning user can change language, colour mode, or eye filters once and sees the same behavior in every game.
- No target spawns in an obstructed area across the device matrix.
- Completion, pause, restart, and return-to-hub behavior are identical across games.
- Accessibility test pass rate covers all DOM controls and the approved alternative for canvas tasks.
- Clinical review confirms that the unified chrome and spaceship target do not compromise the intended dichoptic stimulus.
