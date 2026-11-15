const path = require('path');
const fs = require('fs');
const { chromium } = require(path.resolve(__dirname, '../frontend/node_modules/playwright'));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function smoothScroll(page, targetY, durationMs = 600) {
  try {
    await page.evaluate(
      async ({ targetY, durationMs }) => {
        const startY = window.scrollY;
        const distance = targetY - startY;
        const startTime = performance.now();

        return new Promise((resolve) => {
          function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            const ease =
              progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            window.scrollTo(0, startY + distance * ease);
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              resolve();
            }
          }
          requestAnimationFrame(step);
        });
      },
      { targetY, durationMs }
    );
    await sleep(durationMs + 20);
  } catch (e) {
    await sleep(durationMs);
  }
}

async function injectVisualCursor(page) {
  try {
    await page.evaluate(() => {
      if (document.getElementById('playwright-custom-cursor')) return;
      const cursor = document.createElement('div');
      cursor.id = 'playwright-custom-cursor';
      cursor.style.position = 'fixed';
      cursor.style.width = '18px';
      cursor.style.height = '18px';
      cursor.style.borderRadius = '50%';
      cursor.style.backgroundColor = 'rgba(22, 163, 74, 0.85)';
      cursor.style.border = '2px solid #ffffff';
      cursor.style.boxShadow = '0 2px 10px rgba(0,0,0,0.4)';
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = '9999999';
      cursor.style.transform = 'translate(-50%, -50%)';
      cursor.style.transition = 'transform 0.1s ease, background-color 0.1s ease';
      document.body.appendChild(cursor);

      window.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      });
      window.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.75)';
        cursor.style.backgroundColor = 'rgba(234, 88, 12, 0.95)';
      });
      window.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.backgroundColor = 'rgba(22, 163, 74, 0.85)';
      });
    });
  } catch (e) {}
}

async function smoothMoveAndClick(page, selector, text = null, clickDelay = 120) {
  try {
    let element;
    if (text) {
      element = page.locator(selector, { hasText: text }).first();
    } else {
      element = page.locator(selector).first();
    }

    await element.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});
    const box = await element.boundingBox({ timeout: 1200 }).catch(() => null);
    if (box) {
      const targetX = box.x + box.width / 2;
      const targetY = box.y + box.height / 2;
      await page.mouse.move(targetX, targetY, { steps: 6 });
      await sleep(clickDelay);
      await page.mouse.down();
      await sleep(50);
      await page.mouse.up();
      await sleep(100);
    } else {
      await element.click({ timeout: 1500 }).catch(() => {});
    }
  } catch (err) {}
}

async function recordPresentation() {
  console.log('🎬 Starting Mrittika AI Calibrated Exact 2m 30s (150s) Screen Recording...');
  const recordingsDir = path.resolve(__dirname, '../recordings');
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: recordingsDir,
      size: { width: 1920, height: 1080 },
    },
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  page.on('load', async () => {
    await injectVisualCursor(page).catch(() => {});
  });

  const startTime = Date.now();

  async function syncToTime(targetSec, label) {
    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = targetSec - elapsed;
    if (remaining > 0) {
      console.log(`⏱️  [Sync ${label}] Holding ${remaining.toFixed(1)}s until target ${targetSec}s (Elapsed: ${elapsed.toFixed(1)}s)...`);
      await sleep(remaining * 1000);
    } else {
      console.log(`⏱️  [Sync ${label}] Target ${targetSec}s reached at ${elapsed.toFixed(1)}s.`);
    }
  }

  try {
    // =========================================================================
    // SCENE 1: THE EDITORIAL HOMEPAGE & INTERACTIVE CALIBRATION [0s -> 16s]
    // =========================================================================
    console.log('📍 [Scene 1] Homepage & Live Soil Calibration (0s - 16s)...');
    await page.goto('http://127.0.0.1:5173/');
    await sleep(400);
    await injectVisualCursor(page);
    await page.mouse.move(960, 360, { steps: 6 });
    await sleep(500);

    // Click Dinajpur Maize scenario
    await smoothMoveAndClick(page, 'button:has-text("দিনাজপুর")');
    await sleep(600);

    // Click Bogra Boro Rice scenario
    await smoothMoveAndClick(page, 'button:has-text("বগুড়া")');
    await sleep(600);

    // Scroll to Brand Narrative
    await smoothScroll(page, 750, 500);
    await sleep(600);

    // Scroll to 24-Crops Gallery & filter vegetables
    await smoothScroll(page, 3200, 600);
    await sleep(500);
    await smoothMoveAndClick(page, 'button:has-text("শাকসবজি"), button:has-text("Vegetables")');
    await sleep(600);

    // Scroll back to Navbar
    await smoothScroll(page, 0, 500);
    await syncToTime(16, 'Scene 1 Complete');

    // =========================================================================
    // SCENE 2: 1-CLICK FARMER LOGIN & FARMER PORTAL [16s -> 32s]
    // =========================================================================
    console.log('📍 [Scene 2] Farmer Login & Portal Work (16s - 32s)...');
    await smoothMoveAndClick(page, '#quick-login-toggle');
    await sleep(200);
    await smoothMoveAndClick(page, '#quick-role-farmer');
    await page.waitForURL('**/farmer/overview', { timeout: 8000 }).catch(() => {});
    await sleep(400);
    await injectVisualCursor(page);

    // Examine Farmer Greeting Banner & Weather
    await page.mouse.move(960, 260, { steps: 6 });
    await sleep(1000);

    // Scroll down through Priority Regional Crops
    await smoothScroll(page, 450, 600);
    await sleep(1000);

    // Scroll down to Soil Nutrient Profile Meters & Seasonal Tips
    await smoothScroll(page, 950, 600);
    await syncToTime(32, 'Scene 2 Complete');

    // =========================================================================
    // SCENE 3: LIVE CROP RECOMMENDATION MODULE [32s -> 50s]
    // =========================================================================
    console.log('📍 [Scene 3] Live Crop Recommendation Module (32s - 50s)...');
    await smoothScroll(page, 0, 400);
    await sleep(200);
    await smoothMoveAndClick(page, 'a[href="/farmer/crop-recommend"]');
    await page.waitForURL('**/farmer/crop-recommend', { timeout: 8000 }).catch(() => {});
    await sleep(400);
    await injectVisualCursor(page);

    // Scroll to Soil Parameters & Weather
    await smoothScroll(page, 320, 500);
    await sleep(800);

    // Click Recommend Best Crops Submit Button
    await smoothMoveAndClick(page, 'button[type="submit"]');
    await sleep(2000);

    // Inspect Result (Aman Rice 96.4%, Wheat, Maize)
    await smoothScroll(page, 650, 600);
    await syncToTime(50, 'Scene 3 Complete');

    // =========================================================================
    // SCENE 4: SMART FERTILIZER PLAN & SPLIT APPLICATION [50s -> 68s]
    // =========================================================================
    console.log('📍 [Scene 4] Smart Fertilizer Recommendation (50s - 68s)...');
    await smoothMoveAndClick(page, 'button:has-text("এই ফসলের সার সুপারিশ দেখুন"), button:has-text("Calculate Fertilizer")');
    await sleep(500);
    if (!page.url().includes('fertilizer')) {
      await smoothMoveAndClick(page, 'a[href*="fertilizer"]');
    }
    await page.waitForURL('**/*fertilizer*', { timeout: 8000 }).catch(() => {});
    await sleep(400);
    await injectVisualCursor(page);

    // Inspect prefilled crop & land input
    await smoothScroll(page, 250, 400);
    await sleep(600);

    // Fill Land Area 33 Decimal (1 Bigha)
    const landInput = page.locator('input[type="number"]').first();
    if (await landInput.isVisible()) {
      await smoothMoveAndClick(page, 'input[type="number"]');
      await landInput.fill('33');
      await sleep(400);
    }

    // Click Calculate Fertilizer
    await smoothMoveAndClick(page, 'button[type="submit"]');
    await sleep(2000);

    // Inspect Dosage Table & 3-Stage Split Schedule
    await smoothScroll(page, 650, 600);
    await sleep(1000);

    // Hover PDF Button
    await page.mouse.move(960, 550, { steps: 6 });
    await syncToTime(68, 'Scene 4 Complete');

    // =========================================================================
    // SCENE 5: BANGLA AI ASSISTANT CHATBOT [68s -> 92s]
    // =========================================================================
    console.log('📍 [Scene 5] Bangla AI Assistant Chatbot (68s - 92s)...');
    await smoothMoveAndClick(page, 'a[href="/farmer/assistant"]');
    await page.waitForURL('**/*assistant*', { timeout: 8000 }).catch(() => {});
    await sleep(400);
    await injectVisualCursor(page);

    // Click Starter chip: "আমন ধানের ইউরিয়া উপরিপ্রয়োগের নিয়ম"
    await smoothMoveAndClick(page, 'button:has-text("আমন ধানের ইউরিয়া উপরিপ্রয়োগের নিয়ম"), button:has-text("বোরো ধান")');
    await sleep(2500);

    // Scroll to bottom of chat
    await smoothScroll(page, 99999, 400);
    await sleep(500);

    // Live typing of a second farmer question
    const chatInput = page.locator('textarea[placeholder*="আপনার প্রশ্নটি বাংলায় লিখুন"], textarea[placeholder*="Write your agricultural question"]').first();
    if (await chatInput.isVisible()) {
      await smoothMoveAndClick(page, 'textarea');
      await chatInput.type('আলুর নাভিধসা রোগ হলে কোন ছত্রাকনাশক সঠিক ডোজে দিতে হবে?', { delay: 25 });
      await sleep(400);
      await page.keyboard.press('Enter');
      await sleep(2500);
    }
    await smoothScroll(page, 99999, 300);
    await syncToTime(92, 'Scene 5 Complete');

    // =========================================================================
    // SCENE 6: EXTENSION OFFICER PORTAL WORK [92s -> 112s]
    // =========================================================================
    console.log('📍 [Scene 6] Extension Officer Portal Work (92s - 112s)...');
    // Logout to return to homepage
    await smoothMoveAndClick(page, 'button:has-text("লগআউট"), button:has-text("Logout")');
    await page.waitForURL('**/', { timeout: 8000 }).catch(() => {});
    await sleep(400);

    // Quick Login as Officer
    await smoothMoveAndClick(page, '#quick-login-toggle');
    await sleep(200);
    await smoothMoveAndClick(page, '#quick-role-officer');
    await page.waitForURL('**/officer/overview', { timeout: 8000 }).catch(() => {});
    await sleep(400);
    await injectVisualCursor(page);

    // Highlight Officer Jurisdiction & Pending Reviews (33)
    await page.mouse.move(960, 300, { steps: 6 });
    await sleep(1000);

    // Inspect Flagged QA Audit Center
    await smoothMoveAndClick(page, 'a[href="/officer/review"]');
    await page.waitForURL('**/officer/review', { timeout: 8000 }).catch(() => {});
    await sleep(400);
    await injectVisualCursor(page);
    await smoothScroll(page, 320, 500);
    await sleep(1000);

    // Inspect Regional Telemetry
    await smoothMoveAndClick(page, 'a[href="/officer/analytics"]');
    await page.waitForURL('**/officer/analytics', { timeout: 8000 }).catch(() => {});
    await sleep(400);
    await injectVisualCursor(page);
    await smoothScroll(page, 450, 500);
    await syncToTime(112, 'Scene 6 Complete');

    // =========================================================================
    // SCENE 7: SYSTEM ADMIN PORTAL WORK [112s -> 132s]
    // =========================================================================
    console.log('📍 [Scene 7] System Admin Portal Work (112s - 132s)...');
    // Logout to return to homepage
    await smoothMoveAndClick(page, 'button:has-text("লগআউট"), button:has-text("Logout")');
    await page.waitForURL('**/', { timeout: 8000 }).catch(() => {});
    await sleep(400);

    // Quick Login as Admin
    await smoothMoveAndClick(page, '#quick-login-toggle');
    await sleep(200);
    await smoothMoveAndClick(page, '#quick-role-admin');
    await page.waitForURL('**/admin-portal/overview', { timeout: 8000 }).catch(() => {});
    await sleep(400);
    await injectVisualCursor(page);

    // Highlight Executive Overview Stats
    await page.mouse.move(960, 300, { steps: 6 });
    await sleep(1000);

    // Inspect RAG Knowledge Base
    await smoothMoveAndClick(page, 'a[href="/admin-portal/knowledge"]');
    await page.waitForURL('**/admin-portal/knowledge', { timeout: 8000 }).catch(() => {});
    await sleep(400);
    await injectVisualCursor(page);
    await smoothScroll(page, 400, 500);
    await sleep(1000);

    // Inspect AI Response Cache
    await smoothMoveAndClick(page, 'a[href="/admin-portal/cache"]');
    await page.waitForURL('**/admin-portal/cache', { timeout: 8000 }).catch(() => {});
    await sleep(400);
    await injectVisualCursor(page);
    await smoothScroll(page, 400, 500);
    await syncToTime(132, 'Scene 7 Complete');

    // =========================================================================
    // SCENE 8: GRAND OUTRO ON HOMEPAGE [132s -> 150s]
    // =========================================================================
    console.log('📍 [Scene 8] Grand Outro on Homepage (132s - 150s)...');
    await smoothMoveAndClick(page, 'a:has-text("পাবলিক হোমপেজ"), a[href="/"]');
    await page.waitForURL('**/', { timeout: 8000 }).catch(() => {});
    await sleep(400);
    await injectVisualCursor(page);
    await smoothScroll(page, 99999, 1200);
    await syncToTime(150, 'Outro Complete');

    const totalSeconds = Math.round((Date.now() - startTime) / 1000);
    console.log(`✅ Presentation Recording Finished! Total Duration: ${totalSeconds}s (${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s)`);
  } catch (err) {
    console.error('❌ Error during presentation recording:', err);
  } finally {
    const video = page.video();
    await context.close();
    await browser.close();

    if (video) {
      const rawVideoPath = await video.path();
      const finalDestPath = path.resolve(recordingsDir, 'Mrittika_AI_Presentation_Demo_FullHD.webm');
      if (fs.existsSync(rawVideoPath)) {
        fs.copyFileSync(rawVideoPath, finalDestPath);
        console.log(`🎉 Final High-Definition Presentation Video Saved:`);
        console.log(`📁 File Path: ${finalDestPath}`);
        console.log(`📊 Size: ${(fs.statSync(finalDestPath).size / (1024 * 1024)).toFixed(2)} MB`);
      }
    }
  }
}

recordPresentation().catch((err) => {
  console.error('Fatal presentation error:', err);
  process.exit(1);
});
