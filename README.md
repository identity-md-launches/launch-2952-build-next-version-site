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

1. **Receipt escaping.** Every value from the API is now passed through the existing `escHtml` helper before it goes into the end-of-run receipt HTML. That covers the round, block height, RPM and wheel status (`index.html:955-957`).
2. **Pause in the portal mini-games.** P or the Pause button now works in Cage Runner (`wheel`) and Bamboo Squeeze (`crush`):
   - `togglePause()` records the paused phase in `pausedFrom` and resumes into it (`index.html:2166-2171`).
   - `update()` returns at once while a mini-game is paused (`index.html:1073-1075`).
   - `draw()` renders the frozen mini-game scene with the same PAUSED overlay (`index.html:1784-1794`). The draw functions also stop adding particles and screen shake while paused.
   - Taps and Space do nothing while paused (`pressAction()` has no `paused` branch).
3. **Same seed, same map.**
   - Bamboo breathing and Boss drift/breathing are now driven by each pipe's distance travelled, `(W + 70 − x) / PIPE_NOMINAL_SPEED`, instead of elapsed time (`index.html:1207-1227`).
   - Pipes that start breathing at 30 Aura keep their seeded spawn phase instead of getting a `Math.random` one (`index.html:1118-1121`).
   - Cage Runner obstacles and Aura, and Bamboo Squeeze Aura, are now drawn from the seeded run RNG `rng()` (`index.html:1401-1403`, `1564-1578`).
   - `Math.random` is now used only for cosmetic effects (particles, clouds, shake) and the gift jackpot.
4. **Share metadata.** A `description`, `og:title`, `og:description`, `og:type`, `og:image` (`og-image.svg`) and an inline SVG favicon were added in `<head>`. The existing `<title>` is unchanged.

Nothing else was changed: no other gameplay, text, visuals, or anything about the live API connection.

## Validation record

**Environment limitation.** In this job's environment the shell sandbox failed to start ("Sandbox is required but failed to initialize: Failed to create bridge sockets") on every attempt. The browser tool reported "Browser chrome-for-testing is not installed", and installing it needs the shell. So **no command could be run**: no build, no test, no browser, and no `taste.mjs` probe. All checks below were done by reading source.

| Check | Result |
| --- | --- |
| Production build | Not applicable; there is no build tool. `dist/` was written as a copy of `index.html`. No byte diff was possible, but line counts and per-pattern line counts match exactly: 2183 lines; 1932 lines with `;{}()'"`; 2123 non-empty lines; 277 lines with non-ASCII; 55 lines with `rng()` / `Math.random` / `escHtml` / `pausedFrom` / `PIPE_NOMINAL_SPEED`; 324 lines with 6-space indent; no leftover chunk markers. |
| Typecheck | Not applicable (plain JavaScript, no TypeScript). `node --check` on the script was **not run**, because the shell was unavailable. |
| Interaction tests | **Not run.** The pause, receipt and determinism changes were reviewed by reading the code paths: `togglePause` → `update` → `draw` → `pressAction`, `endRun`, `startRun` and the spawn code. They were not exercised in a browser. |
| Design probe (`taste.mjs` at 320/390/1440) | **Not run** (needs the shell and Playwright). No screenshots exist. The first screen at 390 has not been confirmed visually. |
| Share tags | Present in the source: title, favicon, description, og:title, og:image. |

### Better Interface review (source-only)

Rendered checks (focus visibility, contrast measurement, reflow at 320, 200% zoom, screen-reader pass) are **Not verified**. The brief said to keep everything except the three fixes identical, so the findings below are recorded, not fixed.

| Domain | Coverage | Findings (severity, location) |
| --- | --- | --- |
| Accessibility | Checked (source only) | HIGH `index.html:5`: `maximum-scale=1.0, user-scalable=no` blocks pinch zoom. MEDIUM `index.html:150-151`: the name and challenge-code inputs have placeholders but no `<label>`. MEDIUM `index.html:133`: the game canvas has no accessible name. MEDIUM: canvas motion and screen shake ignore `prefers-reduced-motion`. LOW: live-panel updates have no `aria-live` region. Native `<button>`s are used throughout and there is no `outline:none`, so the browser's default focus ring stays. |
| Layout | Checked (source only) | MEDIUM (unverified render) `index.html:52-56`: the menu overlay centres a tall stack (copy, wallet, challenge box, skin grid) inside a fixed-ratio stage with `overflow:hidden`. On a ~555px-tall stage at 390 wide, the top lines and the bottom of the skin box are probably clipped. START sits mid-stack and is probably visible. A screenshot is needed to confirm. |
| Writing | Checked | LOW: many lines use emoji and em dashes (the design probe's glyph rule), and the Squeeze HUD shows untranslated `KHE {n}px` in English mode (`index.html:1483`). Left as-is per the brief. |
| Typography | Checked | LOW `index.html:13-110`: 12 distinct CSS font sizes against the 6-size guidance. MEDIUM `index.html:80`: 12px inputs trigger iOS focus zoom (currently masked by the zoom lock). MEDIUM `index.html:2`: `lang="vi"` although the default UI language is English. |
| Colors | Checked (tokens only) | `:root` tokens are documented in DESIGN.md. No contrast was measured. `--muted` `#cbbfe8` on `--panel` `#241a3f` is likely sufficient but unmeasured. Text over the translucent overlay scrim is unverified. |
| UI | Checked | MEDIUM `index.html:77`: `.skinbtn` (12px text, 3px vertical padding) is likely under the 24px minimum target. The Pause button now works in every gameplay phase (fixed in this release). There is no `transition: all`. |

**Completion: Incomplete.** The three requested fixes are implemented in `index.html` and copied into `dist/`. The share metadata and documentation are delivered. However, the required build, interaction and browser checks could not run on this machine. A follow-up should open `dist/index.html` at 390 and 1440 wide, enter each mini-game through a portal and press P, and replay a challenge code twice to confirm identical gaps.
