import { test, expect } from '@playwright/test';

test('Music App E2E Flow', async ({ page }) => {

  await page.goto('http://localhost:3000/login.html');

  await page.fill('#email', 'admin@admin.sg');
  await page.fill('#password', 'Admin@123');
  await page.click('text=Login');



  await expect(page).toHaveURL(/music.html/);

  await expect(page.locator('text=LOVE DIVE')).toBeVisible();
}); 