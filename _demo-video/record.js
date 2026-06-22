// Records a smooth, high-res walkthrough of the RapidFlow demo site using
// the installed Chrome. Drives the scroll itself (eased, rAF-based) so the
// browser paints every frame — far smoother than scrollIntoView jumps.
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const fileUrl = 'file://' + path.resolve(__dirname, '..', 'index.html');
  const videoDir = path.resolve(__dirname, 'out');
  const outFile = path.resolve(videoDir, 'walkthrough.webm');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    // Video is captured at the CSS viewport size, so viewport must equal the
    // recordVideo size or Playwright pads the difference with grey. Native 1080p.
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    recordVideo: { dir: videoDir, size: { width: 1920, height: 1080 } },
  });
  const page = await context.newPage();
  const video = page.video();

  // domcontentloaded (not 'load') so we don't block ~5s on the Google Maps
  // iframe — it keeps loading in the background and is ready by #areas.
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });

  // Proceed the moment Tailwind has compiled (amber CTA gets its background)
  // and web fonts are ready — no fixed dead-air wait.
  await page.waitForFunction(() => {
    const el = document.querySelector('a[href^="tel:"]');
    if (!el) return false;
    const bg = getComputedStyle(el).backgroundColor;
    return bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
  }, { timeout: 8000 }).catch(() => {});
  try { await page.evaluate(() => document.fonts.ready); } catch (_) {}

  // Take scrolling away from the page's CSS `scroll-behavior: smooth` so our
  // eased scroll is the only motion (otherwise the two fight and it stutters).
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); });

  // Eased scroll to an absolute Y over `duration` ms (easeInOutCubic), one
  // paint per animation frame.
  const scrollTo = (targetY, duration) =>
    page.evaluate(({ targetY, duration }) => new Promise((resolve) => {
      const startY = window.scrollY;
      const dist = targetY - startY;
      const t0 = performance.now();
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const step = (now) => {
        const t = Math.min(1, (now - t0) / duration);
        window.scrollTo(0, startY + dist * ease(t));
        if (t < 1) requestAnimationFrame(step); else resolve();
      };
      requestAnimationFrame(step);
    }), { targetY, duration });

  const yOf = (sel) =>
    page.evaluate((s) => {
      const el = document.querySelector(s);
      return el ? el.getBoundingClientRect().top + window.scrollY - 8 : 0;
    }, sel);

  // Brief hold so the hero entrance animation plays, then move.
  await page.waitForTimeout(1100);

  // Eased glide through each section with a short dwell to read it.
  const plan = [
    ['#services', 1700, 1100],
    ['#how',      1600, 1000],
    ['#reviews',  1700, 1100],
    ['#areas',    1700, 2600], // a little extra so the map is settled
    ['#quote',    1700, 600],
  ];
  for (const [sel, scrollMs, dwellMs] of plan) {
    await scrollTo(await yOf(sel), scrollMs);
    await page.waitForTimeout(dwellMs);
  }

  // The money shot: fill + submit the lead form, then hold on the success
  // state (which carries the "instantly texts the business owner" note).
  const type = async (sel, val) => {
    await page.fill('#quoteForm ' + sel, val);
    await page.waitForTimeout(420);
  };
  await type('[name="name"]', 'Jane Citizen');
  await type('[name="phone"]', '0412 345 678');
  await type('[name="suburb"]', 'New Farm');
  await type('[name="problem"]', 'Hot water died overnight — need it looked at today if possible.');
  await page.waitForTimeout(800);
  await page.click('#quoteForm button[type="submit"]');
  await page.waitForTimeout(3400);

  await context.close();        // flushes the video to disk
  await video.saveAs(outFile);  // copy to a deterministic path (browser still open)
  await browser.close();
  console.log('VIDEO_PATH=' + outFile);
})();
