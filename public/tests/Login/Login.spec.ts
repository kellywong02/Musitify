import { supabase } from '../../../helpers/db';
import { Musitify_Login } from '../pageObjects/Musitify-Login';
import User from '../../Json/Login.json'
import { test, expect } from '../fixtures/pageFixtures';

let LoginPage: Musitify_Login;
const NormalUser = User[1];
const AdminUser = User[0];

test.beforeEach(async ({ page }) => {
  LoginPage = new Musitify_Login(page);
  await LoginPage.goto();
  await expect(page).toHaveURL(LoginPage.LoginPage_url);
});

test.afterEach(async ({ page }) => {
  await page.close();
});

test('Login Tool Shop', async ({ page, loginPage }) => {
  await loginPage.login('admin@admin.sg', 'Admin@123');
  await expect(page).toHaveURL(/home.html/);
});


//POSITIVE TESTCASES
test('Music App Login Flow - (Positive) Login with valid email and password-Normal User', async ({ page }, testInfo) => {
  
  await LoginPage.EmailAddress.fill(NormalUser.email);
  await LoginPage.Password.fill(NormalUser.password);
  await LoginPage.LoginButton.click();
  await page.waitForLoadState('networkidle');
  const loginSubmittedScreenshot = await page.screenshot({ path: 'screenshots/step1-login-submitted.png' });
  await testInfo.attach('Step 1 - login submitted', {
    body: loginSubmittedScreenshot,
    contentType: 'image/png',
  });
  await expect(page).toHaveURL(/home.html/);
  await expect(LoginPage.WelcomeBackHeading(NormalUser.username)).toBeVisible();
}); 

test('Music App Login Flow - (Positive) Login with valid email and password-Admin', async ({ page }, testInfo) => {
  
  await LoginPage.EmailAddress.fill(AdminUser.email);
  await LoginPage.Password.fill(AdminUser.password);
  await LoginPage.LoginButton.click();
  await page.waitForLoadState('networkidle');
  const loginSubmittedScreenshot = await page.screenshot({ path: 'screenshots/step1-login-submitted.png' });
  await testInfo.attach('Step 1 - login submitted', {
    body: loginSubmittedScreenshot,
    contentType: 'image/png',
  });
  await expect(page).toHaveURL(/home.html/);
  await expect(LoginPage.WelcomeBackHeading(AdminUser.username)).toBeVisible();
}); 

test('Music App Login Flow - (Positive) Submit login with Enter key', async ({ page }) => {
  await LoginPage.EmailAddress.fill(NormalUser.email);
  await LoginPage.Password.fill(NormalUser.password);
  await LoginPage.Password.press('Enter');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/home.html/);
});

test('Music App Login Flow - (Positive) Login with capitalize email', async ({ page }, testInfo) => {
  
  await LoginPage.EmailAddress.fill(NormalUser.email.toUpperCase());
  await LoginPage.Password.fill(NormalUser.password);
  await LoginPage.LoginButton.click();
  await page.waitForLoadState('networkidle');
  const loginSubmittedScreenshot = await page.screenshot({ path: 'screenshots/step1-login-submitted.png' });
  await testInfo.attach('Step 1 - login submitted', {
    body: loginSubmittedScreenshot,
    contentType: 'image/png',
  });
  await expect(page).toHaveURL(/home.html/);

  const headingLocator = page.getByRole('heading', {
  name: /Welcome back, [A-Za-z]+/
  });
  await expect(headingLocator).toBeVisible();
});

test('Music App Login Flow - (Positive) Email with leading/trailing spaces is trimmed before login', async ({ page }, testInfo) => {

  await LoginPage.EmailAddress.fill(" " + NormalUser.email + " ");
  await LoginPage.Password.fill(NormalUser.password);
  await LoginPage.LoginButton.click();
  await page.waitForLoadState('networkidle');
  const loginSubmittedScreenshot = await page.screenshot({ path: 'screenshots/step1-login-submitted.png' });
  await testInfo.attach('Step 1 - login submitted', {
    body: loginSubmittedScreenshot,
    contentType: 'image/png',
  });
  await expect(page).toHaveURL(/home.html/);

  const headingLocator = page.getByRole('heading', {
  name: /Welcome back, [A-Za-z]+/
  });
  await expect(headingLocator).toBeVisible();
});

test('Music App Login Flow - (Positive) Password with valid special characters logs in', async ({ page }, testInfo) => {
  await LoginPage.EmailAddress.fill(NormalUser.email);
  expect(NormalUser.password).toMatch(/[!@#$%^&*(),.?":{}|<>]/);
  await LoginPage.Password.fill(NormalUser.password);
  await LoginPage.LoginButton.click();
  await page.waitForLoadState('networkidle');
  const loginSubmittedScreenshot = await page.screenshot({ path: 'screenshots/step1-login-submitted.png' });
  await testInfo.attach('Step 1 - login submitted', {
    body: loginSubmittedScreenshot,
    contentType: 'image/png',
  });
  await expect(page).toHaveURL(/home.html/);

  const headingLocator = page.getByRole('heading', {
  name: /Welcome back, [A-Za-z]+/
  });
  await expect(headingLocator).toBeVisible();
});

test('Music App Login Flow - (Positive) Successful login redirects to home/dashboard page', async ({ page }, testInfo) => {
  
  await LoginPage.EmailAddress.fill(NormalUser.email);
  await LoginPage.Password.fill(NormalUser.password);
  await LoginPage.LoginButton.click();
  await page.waitForLoadState('networkidle');
  const loginSubmittedScreenshot = await page.screenshot({ path: 'screenshots/step1-login-submitted.png' });
  await testInfo.attach('Step 1 - login submitted', {
    body: loginSubmittedScreenshot,
    contentType: 'image/png',
  });
  await expect(page).toHaveURL(/home.html/);

  const headingLocator = page.getByRole('heading', {
  name: /Welcome back, [A-Za-z]+/
  });
  await expect(headingLocator).toBeVisible();
}); 

test('Music App Login Flow - (Positive) Register link redirects to register page', async ({ page }, testInfo) => {
  await LoginPage.ToRegister.click();
  await expect (LoginPage.RegisterPage).toBeVisible();
  const toRegisterScreenshot = await page.screenshot({ path: 'screenshots/step1-To-Register.png' });
  await testInfo.attach('Step 1 - Click Register', {
    body: toRegisterScreenshot,
    contentType: 'image/png',
  });

}); 

//NEGATIVE TESTCASES
test('Music App Login Flow - (Negative) Empty email and empty password', async({ page }, testInfo)=>{
  await LoginPage.EmailAddress.fill("");
  await LoginPage.Password.fill("");
  const loginSubmittedScreenshot = await page.screenshot({ path: 'screenshots/step1-login-submitted.png' });
  await testInfo.attach('Step 1 - login submitted', {
    body: loginSubmittedScreenshot,
    contentType: 'image/png',
  });
  await LoginPage.LoginButton.click();
  await page.waitForLoadState('networkidle');
  await expect (LoginPage.MissingEmailOrPassword).toBeVisible();
});

test('Music App Login Flow - (Negative) Empty email field with password entered', async({ page }, testInfo)=>{
  await LoginPage.EmailAddress.fill("");
  await LoginPage.Password.fill(NormalUser.password);
  const loginSubmittedScreenshot = await page.screenshot({ path: 'screenshots/step1-login-submitted.png' });
  await testInfo.attach('Step 1 - login submitted', {
    body: loginSubmittedScreenshot,
    contentType: 'image/png',
  });
  await LoginPage.LoginButton.click();
  await page.waitForLoadState('networkidle');
  await expect (LoginPage.MissingEmailOrPassword).toBeVisible();
});

test('Music App Login Flow - (Negative) Empty password field with email entered', async({ page }, testInfo)=>{
  await LoginPage.EmailAddress.fill(NormalUser.email);
  await LoginPage.Password.fill("");
  const loginSubmittedScreenshot = await page.screenshot({ path: 'screenshots/step1-login-submitted.png' });
  await testInfo.attach('Step 1 - login submitted', {
    body: loginSubmittedScreenshot,
    contentType: 'image/png',
  });
  await LoginPage.LoginButton.click();
  await page.waitForLoadState('networkidle');
  await expect (LoginPage.MissingEmailOrPassword).toBeVisible();
});

test('Music App Login Flow - (Negative) Invalid email format, without @', async({ page }, testInfo)=>{
  await LoginPage.EmailAddress.fill("abc");
  await LoginPage.Password.fill("");
  
  await LoginPage.LoginButton.click();
  const InvalidEmailFormat = await page.screenshot({ path: 'screenshots/step1-InvalidEmailFormat.png' });
  await testInfo.attach('Step 1 - login submitted', {
    body: InvalidEmailFormat,
    contentType: 'image/png',
  });
  const error = await page
    .locator('#email')
    .evaluate((el: HTMLInputElement) => 
       el.validationMessage
    );

  expect(error).toContain("@");
});

test('Music App Login Flow - (Negative) Invalid email format, without domain.com', async({ page }, testInfo)=>{
  await LoginPage.EmailAddress.fill("abc@");
  await LoginPage.Password.fill("");
  
  await LoginPage.LoginButton.click();
  const InvalidEmailFormat = await page.screenshot({ path: 'screenshots/step1-InvalidEmailFormat.png' });
  await testInfo.attach('Step 1 - login submitted', {
    body: InvalidEmailFormat,
    contentType: 'image/png',
  });
  const error = await page
    .locator('#email')
    .evaluate((el: HTMLInputElement) => 
       el.validationMessage
    );

  expect(error).toContain("@");
});

test('Music App Login Flow - (Negative) Invalid email format, without .com', async({ page }, testInfo)=>{
  await LoginPage.EmailAddress.fill("abc@email");
  await LoginPage.Password.fill("");
  const loginSubmittedScreenshot = await page.screenshot({ path: 'screenshots/step1-login-submitted.png' });
  await testInfo.attach('Step 1 - login submitted', {
    body: loginSubmittedScreenshot,
    contentType: 'image/png',
  });
  await LoginPage.LoginButton.click();
  await page.waitForLoadState('networkidle');
  await expect (LoginPage.AccountNotFound).toBeVisible();
  await expect (LoginPage.RegisterPrompt).toBeVisible();
});

test('Music App Login Flow - (Negative) Login with valid email but wrong password', async({ page }, testInfo)=>{
  await LoginPage.EmailAddress.fill(NormalUser.email);
  await LoginPage.Password.fill("123@Abc");
  const loginSubmittedScreenshot = await page.screenshot({ path: 'screenshots/step1-login-submitted.png' });
  await testInfo.attach('Step 1 - login submitted', {
    body: loginSubmittedScreenshot,
    contentType: 'image/png',
  });
  await LoginPage.LoginButton.click();
  await page.waitForLoadState('networkidle');
  await expect (LoginPage.InvalidEmailOrPassword).toBeVisible();
});

test('Music App Login Flow - (Negative) Password must meet minimum length', async({ page }, testInfo)=>{
  await LoginPage.EmailAddress.fill(NormalUser.email);
  await LoginPage.Password.fill("Abc@12");
  const loginSubmittedScreenshot = await page.screenshot({ path: 'screenshots/step1-login-short-password.png' });
  await testInfo.attach('Step 1 - short password', {
    body: loginSubmittedScreenshot,
    contentType: 'image/png',
  });
  await LoginPage.LoginButton.click();
  await expect (LoginPage.PasswordMinimumLengthError).toBeVisible();
});

test('Music App Login Flow - (Negative) Account not found asks user to register', async({ page }, testInfo)=>{
  await LoginPage.EmailAddress.fill("new-user-not-found@example.com");
  await LoginPage.Password.fill(NormalUser.password);
  await LoginPage.LoginButton.click();
  await page.waitForLoadState('networkidle');
  await expect (LoginPage.AccountNotFound).toBeVisible();
  await expect (LoginPage.RegisterPrompt).toBeVisible();

});

test('Password below minimum length', async ({ page }, testInfo) => {

  await LoginPage.EmailAddress.fill(NormalUser.email);
  await LoginPage.Password.fill("as");

  await LoginPage.LoginButton.click();

  // Should stay on login page
  await expect(page).toHaveURL(/login/);

  // Should show your error message
  await LoginPage.PasswordMinimumLengthError.isVisible();
});

