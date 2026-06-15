import { test, expect } from '../fixtures/pageFixtures';
import { supabase } from '../../../helpers/db';

test.beforeEach(async ({ page, registerPage }) => {
  await registerPage.goto();
  await expect(page).toHaveURL(registerPage.RegisterPage_url);
});

test.afterEach(async ({ page }) => {
  await page.close();
});

test('Music App Register Flow - (Negative) Password must meet minimum length', async ({ registerPage }) => {
  await registerPage.Username.fill('Short Password User');
  await registerPage.EmailAddress.fill('short-password-user@example.com');
  await registerPage.Password.fill('Abc@12');
  await registerPage.ConfirmPassword.fill('Abc@12');
  await registerPage.ConfirmPassword.press('Enter');
  await expect(registerPage.PasswordMinimumLengthError).toBeVisible();
});

test('Music App Register Flow', async ({ page }, testInfo) => {

  
  const registerSubmittedScreenshot = await page.screenshot({ path: 'screenshots/step1-register-submitted.png' });
  await testInfo.attach('Step 1 - register submitted', {
    body: registerSubmittedScreenshot,
    contentType: 'image/png',
  });
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
