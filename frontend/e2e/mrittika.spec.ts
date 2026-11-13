import { test, expect } from '@playwright/test';

test.describe('Mrittika AI End-to-End User Journeys', () => {
  test('1. Guest Flow: Crop -> Fertilizer -> Assistant unified flow', async ({ page }) => {
    // Navigate to Crop Recommendation
    await page.goto('/crop');
    await expect(page).toHaveTitle(/মৃত্তিকা এআই|Mrittika AI/);

    // Fill crop input form
    await page.fill('input[type="number"] >> nth=0', '80'); // N
    await page.fill('input[type="number"] >> nth=1', '40'); // P
    await page.fill('input[type="number"] >> nth=2', '40'); // K
    await page.fill('input[type="number"] >> nth=3', '6.5'); // pH

    // Select District
    await page.selectOption('select >> nth=0', 'bogura');

    // Click Auto-fill weather if available, or fill weather manually
    await page.fill('input[type="number"] >> nth=4', '28'); // Temp
    await page.fill('input[type="number"] >> nth=5', '75'); // Humidity
    await page.fill('input[type="number"] >> nth=6', '180'); // Rainfall

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for recommendation results
    await expect(page.locator('text=শীর্ষ প্রস্তাবিত ফসল')).toBeVisible({ timeout: 10000 });

    // Click first "সারের পরামর্শ দেখুন" button
    const fertilizerBtn = page.locator('button:has-text("সারের পরামর্শ দেখুন")').first();
    await expect(fertilizerBtn).toBeVisible();
    await fertilizerBtn.click();

    // Verify redirected to /fertilizer with crop preselected
    await expect(page).toHaveURL(/\/fertilizer/);
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Calculate Fertilizer Plan
    await page.click('button[type="submit"]');

    // Verify fertilizer results table and schedule appear
    await expect(page.locator('text=ইউরিয়া')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=প্রয়োগের সময়সূচী')).toBeVisible();

    // Click "সহকারীর সাথে আলোচনা করুন"
    const assistantBtn = page.locator('button:has-text("সহকারীর সাথে আলোচনা করুন")');
    await expect(assistantBtn).toBeVisible();
    await assistantBtn.click();

    // Verify redirected to /assistant
    await expect(page).toHaveURL(/\/assistant/);
    await expect(page.locator('textarea')).toBeVisible();

    // Send a message
    await page.fill('textarea', 'ধান চাষে ইউরিয়ার ব্যবহার কিভাবে করব?');
    await page.click('button:has-text("পাঠান")');

    // Wait for Assistant response
    await expect(page.locator('text=মৃত্তিকা সহকারী')).toBeVisible({ timeout: 15000 });
  });

  test('2. Auth Flow: Register -> Recommendation -> History -> PDF Report', async ({ page }) => {
    const testPhone = '017' + Math.floor(10000000 + Math.random() * 90000000);

    // Register as Farmer
    await page.goto('/register');
    await page.fill('input[type="tel"]', testPhone);
    await page.fill('input[type="text"] >> nth=0', 'মো: কালাম');
    await page.fill('input[type="password"] >> nth=0', 'Pass@123456');
    await page.fill('input[type="password"] >> nth=1', 'Pass@123456');
    await page.click('button[type="submit"]');

    // After registration, redirected to home or crop
    await page.waitForTimeout(2000);

    // Run a recommendation to save in history
    await page.goto('/crop');
    await page.fill('input[type="number"] >> nth=0', '70');
    await page.fill('input[type="number"] >> nth=1', '35');
    await page.fill('input[type="number"] >> nth=2', '35');
    await page.fill('input[type="number"] >> nth=3', '6.2');
    await page.fill('input[type="number"] >> nth=4', '26');
    await page.fill('input[type="number"] >> nth=5', '70');
    await page.fill('input[type="number"] >> nth=6', '120');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=শীর্ষ প্রস্তাবিত ফসল')).toBeVisible({ timeout: 10000 });

    // Navigate to History
    await page.goto('/history');
    await expect(page.locator('text=পরামর্শের ইতিহাস')).toBeVisible();

    // Verify PDF download button exists
    const pdfBtn = page.locator('a:has-text("PDF রিপোর্ট")').first();
    await expect(pdfBtn).toBeVisible({ timeout: 10000 });
  });
});
