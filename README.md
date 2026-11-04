# 🐹 Squeek Flap — Run With Squeektoshi

A Flappy-style browser game starring Squeektoshi the hamster, powered by **live Squeekchain data** (Sepolia testnet).

**Play:** just open `index.html` in any browser — the game is a single self-contained HTML file (no build step, no dependencies). Tap / click / Space to flap.

## What makes it more than a Flappy clone

- **Live Wheel Sync** — polls the public Squeekchain API (`https://api.squeekchain.com/v1/status`): when the real Squeektoshi is SPINNING the sky is bright and the game speeds up; when IDLE it is night and slower. A giant background wheel spins at the real RPM.
- **Round-seeded maps** — obstacle layouts are generated from the settled SqueekCore round number, so every player in the same round plays the identical map.
- **Verifiable run receipts** — every run logs the Squeek Block, round and RPM at start.
- Gameplay: bamboo + golden columns, a Boss column every 30 points, Aura orbs & chains, Super and Shield power-ups, gift boxes (2% win a permanent skin), 11 unlockable fur skins, a Cage Runner mini-game and a Bamboo Squeeze phase behind opt-in portals, friend challenges by code, Connect Wallet (Sepolia) in the menu.
- Languages: English by default, Vietnamese toggle. Progress saves in localStorage.

In-game "Aura" is this game's own points — **not** official Genesis Aura.

Fan-made community prototype.
