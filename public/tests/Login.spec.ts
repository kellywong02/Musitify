import { test, expect } from '@playwright/test';
import { supabase } from 'D:/Programming Projects/Musitify/helpers/db';
import { Musitify_Login } from './pageObjects/Musitify-Login';

let LoginPage: Musitify_Login;

test.beforeEach(async ({ page }) => {
  LoginPage = new Musitify_Login(page);
  await LoginPage.goto();
  await expect(page).toHaveURL(LoginPage.LoginPage_url);
});

test.afterEach(async ({ page }) => {
  await page.close();
});
test('Music App Login Flow', async ({ page }) => {
  await page.goto('http://localhost:3000/login.html');

  await page.fill('#email', 'admin@admin.sg');
  await page.fill('#password', 'Admin@123');
  await page.getByRole('button',{name:'Login'}).click();
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/step1-login-submitted.png' });
  await expect(page).toHaveURL(/home.html/);

  await test.step('Step 2: Verify data in Supabase', async()=>{
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@admin.sg')
      .maybeSingle();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
  });

  await expect(page.locator('text=LOVE DIVE')).toBeVisible();
  await page.locator('.song-card').filter({ hasText: 'LOVE DIVE' }).click();
  await expect(page).toHaveURL(/#music/);
  await expect(page.locator('text=You are listening to')).toBeVisible();
  await page.locator('.upcoming-song').filter({ hasText: 'After Like' }).click();
  await expect(page.locator('#songTitle')).toHaveText(/After Like/i);
  await expect(page.locator('.upcoming-song').filter({ hasText: 'Love Dive' })).toBeVisible();
}); 
