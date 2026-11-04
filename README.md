# 🐹 Squeek Flap — Run With Squeektoshi

A Flappy-style browser game starring Squeektoshi the hamster, powered by **live Squeekchain data** (Sepolia testnet).

**Play:** just open `index.html` in any browser. The game is a single self-contained HTML file with no build step and no dependencies. Tap, click or press Space to flap.

## What makes it more than a Flappy clone

- **Live Wheel Sync:** the game polls the public Squeekchain API (`https://api.squeekchain.com/v1/status`). When the real Squeektoshi is SPINNING, the sky is bright and the game speeds up. When IDLE, it is night and slower. A giant background wheel spins at the real RPM.
- **Round-seeded maps:** obstacle layouts are generated from the settled SqueekCore round number, so every player in the same round plays the identical map.
- **Verifiable run receipts:** every run logs the Squeek Block, round and RPM at start.
- **Gameplay:** bamboo and golden columns, a Boss column every 30 points, Aura orbs and chains, Super and Shield power-ups, and gift boxes (2% chance of a permanent skin). There are 11 unlockable fur skins, a Cage Runner mini-game and a Bamboo Squeeze phase behind opt-in portals, friend challenges by code, and Connect Wallet (Sepolia) in the menu.
- **Languages:** English by default, with a Vietnamese toggle. Progress saves in localStorage.

In-game "Aura" is this game's own points. It is **not** official Genesis Aura.

Fan-made community prototype.

## Install, preview, rebuild

There is nothing to install. The project has no npm dependencies, so it has no `package.json` or lockfile. All code, styles and sprites are in `index.html`: the sprites are drawn on canvas, and sound uses WebAudio.

| Task | Command (from the repository root) |
| --- | --- |
| Preview the source | Open `index.html` in a browser, or run `python3 -m http.server 8000` and visit `http://localhost:8000/` |
| Preview the static export | `python3 -m http.server 8000 --directory dist`, then visit `http://localhost:8000/` |
| Rebuild the export | `mkdir -p dist && cp index.html og-image.svg dist/` |

`dist/` is the static export the host serves. It contains `index.html` (identical to the source) and `og-image.svg`. All asset URLs are relative (`og-image.svg`, and an inline `data:` favicon), so the export works under an IPFS gateway subpath or an ENS name. There are no routes; it is a single page.

## Changes in this version

This revision fixes the remaining RNG coupling in item 3. The accepted receipt escaping, pause handling, page markup, CSS, copy and live API connection are retained.

1. **Receipt escaping.** Every value from the API is passed through the existing `escHtml` helper before it goes into the end-of-run receipt HTML. That covers the round, block height, RPM and wheel status (`endRun()`).
2. **Pause in the portal mini-games.** P or the Pause button now works in Cage Runner (`wheel`) and Bamboo Squeeze (`crush`):
   - `togglePause()` records the paused phase in `pausedFrom` and resumes into it.
   - `update()` returns at once while a mini-game is paused.
   - `draw()` renders the paused mini-game with the same PAUSED overlay. The draw functions stop adding particles and screen shake while paused; existing cosmetic twinkles and pulses still use wall-clock time.
   - Taps and Space do nothing while paused (`pressAction()` has no `paused` branch).
3. **Same seed, same map.**
   - Bamboo breathing and Boss drift/breathing are driven by each pipe's distance travelled, `(W + 70 − x) / PIPE_NOMINAL_SPEED`, instead of elapsed time.
   - Pipes that start breathing at 30 Aura keep their seeded spawn phase instead of getting a `Math.random` one.
   - Cage Runner obstacles and Aura, and Bamboo Squeeze Aura, use `miniRng`, reset in `startRun()` with `mulberry32(runSeed ^ 0x9e3779b9)`. Entering, skipping or spending longer in a portal cannot advance the bamboo RNG.
   - Each bamboo column consumes exactly nine `rng()` draws: gap, golden roll, pipe phase, five pickup rolls, and pickup phase. Rolls happen before eligibility checks, including Boss, Big Aura and no-item branches. Superman, cooldowns and pickup collection cannot shift later map randomness. Existing probabilities, priorities, rewards and difficulty rules remain unchanged.
   - `Math.random` is now used only for cosmetic effects (particles, clouds, shake) and the gift jackpot.
4. **Share metadata.** A `description`, `og:title`, `og:description`, `og:type`, `og:image` (`og-image.svg`) and an inline SVG favicon were added in `<head>`. The existing `<title>` is unchanged.

Nothing else was changed: no other gameplay, text, visuals, or anything about the live API connection.

## Validation record

The revision was checked on 2026-11-04. These results replace the previous source-only review. Full reproduction, six-domain Better Interface coverage and limitations are in [artifacts/validation.md](artifacts/validation.md). The review response is in [.imd-responses.json](.imd-responses.json).

| Check | Result |
| --- | --- |
| Production export | Passed: ran `mkdir -p dist && cp index.html og-image.svg dist/`; `cmp index.html dist/index.html` and `cmp og-image.svg dist/og-image.svg` both exit 0. No dependency installation is required for this static HTML site. |
| JavaScript syntax | Passed: extracted the inline script to scratch and ran `node --check test/scratch/after.js` (exit 0). |
| Typecheck | Ran TypeScript 5.9.3 with `--allowJs --checkJs --noEmit --target es2022 --lib es2022,dom` on the extracted script. Exit 2, with the same 25 existing DOM/provider/JavaScript typing diagnostics as before the patch; no new diagnostics. This is not a clean project-wide typecheck. |
| RNG regression | Reproduced before editing, passed after. `node test/seeded-map.mjs` passes **55/55 assertions** using an installed Playwright module. Compared 3-second/full Cage Runner and short/long Squeeze sessions, then tested seven seeds, six replay/branch scenarios and 100 columns per scenario. Fixed draw counts include Boss and pickup-suppression paths. |
| Browser interactions | Passed in Chromium: start/flap/restart, sound, challenge create/invalid/accept/replay, both portal collision entries, P/button pause/resume, ignored Space/Up/touch while paused, frozen mini-game state, receipt escaping, retained breathing phases and position-based animation. |
| Responsive/visual regression | Rendered at 320, 390, 768 and 1440 wide. No horizontal overflow; game and START visible on the first 390×844 screen. Before/after menu screenshots are byte-identical with fixed cosmetic time/randomness and status data. |
| Design probe | Ran `node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste` using installed Playwright. Completed (exit 0), **9/16 checks pass**. Existing clipping, typography, copy and decorative-style findings are documented; the explicit requirement to preserve visuals takes precedence over redesign. |
| Assets/metadata | Title, favicon, description, og:title and og:image present; share image loads relative to `/preview/`. No missing local resources or script errors in the probe. |
| Live service | Unmodified endpoint attempted in Chromium: `net::ERR_EMPTY_RESPONSE`; the game displayed its existing offline fallback and remained playable. Live status parsing was also tested with a clearly isolated network fixture. |

WebKit was unavailable (browser executable not installed). Physical mobile devices, native 200% zoom, screen readers, a full keyboard-focus audit, and wallet connection/signing were not tested. Temporary fixtures and downloaded check tooling stayed in disposable `test/scratch/`; they are not runtime dependencies or part of the export. The RNG revision is complete within its stated scope; inherited typecheck and design limitations remain documented.

The retained RNG regression test uses an existing Playwright installation and Chromium. Set `IMD_PLAYWRIGHT` to that installation's `index.mjs` if it is not importable as `playwright`, then run `node test/seeded-map.mjs`. An optional argument selects another HTML file for comparison. The test serves the file temporarily, replaces the API response only in its browser context, runs the actual game functions, and closes its browser/server. It never changes the production connection or installs website dependencies.
