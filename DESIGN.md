# DESIGN.md — Squeek Flap: Run With Squeektoshi

This describes the design as implemented in `index.html`, which is the only source file. `dist/index.html` is a copy of it for static hosting. The values below come from the `<style>` block (`index.html` lines 13–110) and from the canvas drawing code in the `<script>`. Nothing here describes a planned redesign.

## Overview

Squeek Flap is a one-page browser game for the Squeekchain community. It is a Flappy-style runner with Squeektoshi the hamster. It has a dark-violet, playful arcade look: gold pixel-shadowed headings, rounded purple panels, a bright canvas playfield and chunky gold buttons. The page is a single narrow column (max 440px) with this order:

1. Header: the title `🐹 SQUEEK FLAP` and a one-line tagline.
2. Live panel: wheel status, RPM, Squeek Block, settled round and mode, read from `https://api.squeekchain.com/v1/status`.
3. Stage: a 420×640 `<canvas>`, with the menu and game-over overlays on top.
4. Controls row: Pause, Sound and Restart.
5. How-to panel, in Vietnamese or English depending on the language toggle.
6. Footer.

The main action (**▶ START**, or a tap/Space on the canvas) is in the menu overlay inside the stage. All gameplay art is drawn on the canvas. There are no image files apart from the share image `og-image.svg`.

## Colors

The tokens are CSS custom properties on `:root` (`index.html` lines 14–18), in hex:

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `#17102a` | Page background (radial gradient from `#3b2766` at the top) |
| `--panel` | `#241a3f` | Live panel, how-to panel, control buttons |
| `--panel2` | `#2e2150` | Ghost button fill; pressed state of control buttons |
| `--line` | `#4b367c` | 2px panel and button borders |
| `--gold` | `#facc15` | Headings, primary accent, skin buttons, receipt border, new-record text |
| `--orange` | `#fb923c` | Declared; the canvas uses the same hue for chains and breathing columns |
| `--green` | `#4ade80` | "Wheel spinning" status dot (with glow) |
| `--pink` | `#fda4af` | "Wheel idle / offline" status dot |
| `--text` | `#fff7e6` | Body text |
| `--muted` | `#cbbfe8` | Secondary text: tagline, notes, `.small`, footer |
| `--red` | `#f87171` | Declared; the canvas uses the same value for danger, Boss and squeeze warnings |

Other fixed values in the CSS:
- Primary button gradient: `#fde047` → `#f59e0b`, text `#451a03`, ledge shadow `#92400e`.
- Heading text-shadow: `#7c2d12`.
- Stage border: `#0d0918`. Stage background: `#79c7e3`.
- Overlay scrim: `rgba(16,8,32,.45)`.
- How-to text: `#efe9ff`.

Canvas scene colors are literals in the draw functions:
- Day sky palettes rotate every 10 points (`draw()`); night sky is `#1e1b4b` → `#43357a`.
- Bamboo greens, golden-column ambers and Boss mossy greens are in `drawBamboo()`.
- Aura violet runs `#f5d0fe` → `#c084fc` → `#7c3aed`.
- Portal styles are in `PORTAL_STYLES`.

No contrast ratios were measured for this release (see the README's validation section).

## Typography

- **Display face:** `"Courier New", monospace`, weight 900. Used for `h1` and the overlay `h2`. Canvas score and PAUSED text use `Courier`.
- **UI/body face:** `"Segoe UI", system-ui, -apple-system, Arial, sans-serif`. Canvas text uses `Segoe UI`.
- No web fonts are loaded; everything uses system fonts.

CSS sizes in use:

| Role | Size | Weight / line-height |
| --- | --- | --- |
| `h1` page title | 30px | 900, line-height 1.1, letter-spacing 1px |
| `.overlay h2` | 27px | bold (h2 default) |
| Final score (inline) | 22px | bold |
| `.btn` primary | 17px | 900 |
| `.skincard .lock` | 15px | — |
| `.overlay p`, `.controls button`, `.btn.ghost`, `.howto h3` | 14px | 700 for buttons |
| `.howto` | 13.5px | line-height 1.55 |
| `.sub`, `.live`, `.receipt` | 13px | — |
| `.skincard .nm` | 12.5px | 700 |
| `.overlay .small`, `.skinbtn`, inputs | 12px | 700 for `.skinbtn` |
| `.live .note`, footer, `.skincard .eqb` | 11.5px | footer line-height 1.5 |
| `.skincard .st` | 10.5px | — |

That is 12 distinct sizes. This is more than the six-size scale the design review recommends. It is recorded as a finding and was left unchanged because the brief asked for identical visuals.

## Layout

- **Column:** `.wrap { width:100%; max-width:440px }`, centred by `body { display:flex; flex-direction:column; align-items:center; padding:14px 10px 28px }`.
- **Stage:** `.stage` is `position:relative; overflow:hidden; touch-action:none`. The canvas is fixed at 420×640 internally and scales with `width:100%; height:auto`, so the playfield keeps a 21:32 ratio at every width.
- **Overlays:** `.overlay` is absolutely positioned over the canvas (`inset:0`), with a centred flex column, `padding:20px` and `z-index:5`. `.hidden` sets `display:none`. The skin picker scrolls inside it (`.skinbox { max-height:330px; overflow-y:auto }`).
- **Rows:** `.live .row`, `.toprow`, `.walletbox` and `.chalrow` are wrapping flex rows with 6–8px gaps. `.controls` is a 3-column flex row where each button has `flex:1`.
- **Spacing:** ad-hoc pixel values. Panels use 9–14px padding, and gaps between sections are 10px (`margin-top:10px` / `margin-bottom:10px`).
- **Breakpoints:** none. The single column fills widths below 460px (440px + 20px padding). At wider widths it stays 440px and centred.
- **Viewport meta:** `maximum-scale=1.0, user-scalable=no` (pre-existing; see validation findings).

## Elevation & Depth

- The stage has a deep drop shadow: `0 18px 40px rgba(0,0,0,.45)`.
- Primary buttons use a solid "ledge" shadow, `0 5px 0 #92400e`, plus a soft `0 10px 18px rgba(0,0,0,.35)`. When pressed (`:active`), the button moves down 3px and the ledge shrinks to 2px.
- Ghost buttons use a `0 4px 0 #17102a` ledge.
- The equipped skin card gets a gold glow: `0 0 10px rgba(250,204,21,.35)`.
- Panels are flat, with a 2px `--line` border and no shadow.

## Shapes

| Element | Radius |
| --- | --- |
| Stage | 16px |
| Panels (`.live`, `.howto`) | 14px |
| `.receipt`, control buttons | 12px |
| Skin cards | 10px |
| `.skinbtn`, inputs | 6px |
| `.btn` | pill (999px) |
| `.dot` status indicator | 9px circle |

The `.receipt` uses a dashed 2px gold border, which marks it as a "ticket".

## Components

All of these are in `index.html`; none is a separate module.

- **Primary button** `.btn`: START, PLAY AGAIN. Gold gradient pill with the ledge shadow and a press state.
- **Ghost button** `.btn.ghost`: Create challenge code, Back to main menu.
- **Small pill button** `.skinbtn`: language, wallet connect/switch/disconnect, challenge Accept/Clear. `.skinbtn.wide` is the full-width "Equip" button in a skin card.
- **Control bar** `.controls button`: Pause/Resume (`#pauseBtn`), Sound (`#soundBtn`), Restart (`#restartBtn`). Keyboard equivalents are P, M and R; Space or ↑ flaps or jumps.
- **Live panel** `.live`: a status `.dot` (`.on` / `.off`) plus labelled values, filled by `renderLivePanel()`.
- **Skin card** `.skincard`: preview image, lock badge, name, progress bar `.pbar`, status `.st`, and an equipped marker `.eqb` or `.eq` border. Rendered by `renderSkins()`.
- **Run receipt** `.receipt`: label/value rows (`div` > `span` + `b`). Rendered by `endRun()`. Every value that comes from the API (round, block, RPM, wheel status) and every player-supplied value goes through `escHtml()` before being inserted as HTML.
- **Canvas overlays:**
  - PAUSED: `drawPausedOverlay()`, a `rgba(10,5,25,.55)` scrim with 26px bold Courier text. It is drawn over the main run and, from this release, over a paused Cage Runner (`drawWheel()`) or Bamboo Squeeze (`drawCrush()`) scene.
  - Also drawn on the canvas: HUD bar (58px, translucent black), floaters, achievement toast, portals (`drawPortal()`), gifts (`drawGift()`) and skill badges (`drawSkillItem()`).

**Game states:** `menu | playing | paused | over | dying | wheel | crush`. `pausedFrom` remembers which of `playing`, `wheel` or `crush` was paused. While paused, a mini-game's `update` is frozen and taps/Space are ignored (`pressAction()` has no `paused` branch).

## Do's and Don'ts

- Do reuse the `:root` tokens for any new DOM UI. Use `--panel` with a 2px `--line` border and a 14px radius for a new panel.
- Do use `.btn` for the one main action on a screen and `.btn.ghost` or `.skinbtn` for secondary actions.
- Do pass any API or player-supplied string through `escHtml()` before putting it into `innerHTML`.
- Do draw run-affecting randomness (obstacles, Aura, mini-game spawns) from the seeded `rng()`. Use `Math.random` only for cosmetic effects (particles, clouds, screen shake) and the gift jackpot. Pipe animation must stay a function of the pipe's own x position (`PIPE_NOMINAL_SPEED`), not of elapsed time.
- Don't add new font sizes. Pick from the existing ones.
- Don't add a second gold-filled action next to START.
- **Adding a page or panel:** put a new `<div class="howto">`-style panel inside `.wrap`, keep it in the same single column, and add its strings to both `STR.en` and `STR.vi` with a `data-i18n` key.
