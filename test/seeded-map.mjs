// Optional browser regression test. No dependencies are added to the website.
// Use an existing Playwright install via IMD_PLAYWRIGHT (path to its index.mjs).
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(process.env.IMD_PLAYWRIGHT
  ? pathToFileURL(process.env.IMD_PLAYWRIGHT).href : 'playwright');
const html = await readFile(process.argv[2] || 'dist/index.html');
const server = createServer((req, res) => res.setHeader('Content-Type', 'text/html').end(html));
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  // Exercise the actual inline game, with manual simulation steps and no live API dependency.
  await page.route('https://api.squeekchain.com/**', route => route.fulfill({ status: 503, body: '' }));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(() => wheel.status === 'OFFLINE');
  const result = await page.evaluate(() => {
    soundOn = false;
    const checks = [];
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    function check(ok, label) { checks.push({ label, passed: ok }); }
    function reset(seed = 123456) {
      pendingChallenge = { name: 'RNG regression', score: 0, meters: 0, seed };
      startRun();
      // Skill alternation is existing session state, unrelated to map RNG consumption.
      lastSkillType = 'shield';
    }
    function nextGaps() { return Array.from({ length: 5 }, () => nextGapY()); }
    function cage(long) {
      reset(); enterWheel();
      for (let frame = 0; frame < 1201 && state === 'wheel'; frame++) {
        W2.invuln = 20; update(1 / 120);
        if (!long && frame === 359) {
          // End through the real three-hit path after three simulated seconds.
          for (let hit = 0; hit < 3; hit++) {
            W2.invuln = 0; W2.h = 0;
            W2.blocks = [{ a: Math.PI / 2, hgt: 40 }]; update(0);
          }
        }
      }
      return nextGaps();
    }
    function squeeze(seconds) {
      reset(); enterCrush();
      for (let i = 0; i < seconds * 120; i++) { CR.invuln = 20; update(1 / 120); }
      return nextGaps();
    }
    reset(); const skipped = nextGaps(), short = cage(false), long = cage(true);
    check(equal(short, long), '3-second/full Cage Runner cannot shift next gaps');
    check(equal(skipped, long), 'Skipping Cage Runner cannot shift next gaps');
    check(equal(skipped, squeeze(2)) && equal(skipped, squeeze(6)), 'Squeeze duration cannot shift next gaps');

    function columns(seed, mode) {
      reset(seed); const out = [];
      for (let i = 0; i < 100; i++) {
        // Match progression to isolate randomness from existing score-based difficulty.
        score = Math.floor(i / 2);
        if (i >= 12) {
          if (mode === 'super') superLeft = 10;
          if (mode === 'big') bigQueue = 1;
          if (mode === 'cooldown') giftCd = portalCd = crushCd = skillCooldown = 100;
          if (mode === 'portal-cap') portalsSpawned = 2;
          if (mode === 'mixed') { superLeft = i % 2 ? 10 : 0; bigQueue = i % 3 ? 0 : 1; }
        }
        spawnDist = 196; update(0);
        const p = pipes.at(-1);
        out.push([p.gapY, p.phase, p.golden, p.boss, p.baseGap]);
      }
      return out;
    }
    const seeds = [1, 7, 42, 123456, 0x12345678, 0x80000000, 0xffffffff];
    for (const seed of seeds) {
      const normal = columns(seed, 'normal');
      for (const mode of ['normal', 'super', 'big', 'cooldown', 'portal-cap', 'mixed'])
        check(equal(normal, columns(seed, mode)), `Seed ${seed}, ${mode}: 100 columns match`);
    }
    check(!equal(columns(1, 'normal'), columns(42, 'normal')), 'Different seeds produce different maps');
    for (const mode of ['normal', 'boss', 'big', 'super', 'cooldown']) {
      reset(); let draws = 0; const original = rng;
      rng = () => { draws++; return original(); };
      if (mode === 'boss') score = 30;
      if (mode === 'big') bigQueue = 1;
      if (mode === 'super') superLeft = 10;
      if (mode === 'cooldown') giftCd = portalCd = crushCd = skillCooldown = 100;
      spawnDist = 196; update(0);
      check(draws === 9, `${mode}: exactly nine map draws`);
    }
    function mini(seed, kind, priorColumns) {
      reset(seed);
      for (let i = 0; i < priorColumns; i++) { spawnDist = 196; update(0); }
      if (kind === 'wheel') enterWheel(); else enterCrush();
      for (let i = 0; i < 360; i++) {
        if (W2) W2.invuln = 20; if (CR) CR.invuln = 20; update(1 / 120);
      }
      return kind === 'wheel' ? W2 : CR;
    }
    for (const kind of ['wheel', 'crush']) {
      check(equal(mini(42, kind, 0), mini(42, kind, 20)), `${kind}: mini-game RNG resets and is independent of bamboo`);
      check(!equal(mini(42, kind, 0), mini(1, kind, 0)), `${kind}: different seeds affect spawns`);
    }
    return { checks, sample: { skipped, short, long } };
  });
  const failed = result.checks.filter(c => !c.passed);
  console.log(JSON.stringify({ passed: result.checks.length - failed.length, total: result.checks.length, failed, sample: result.sample }, null, 2));
  assert.equal(failed.length, 0, 'Seeded-map regression failed');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
