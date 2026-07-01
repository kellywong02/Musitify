import { test, expect } from '../fixtures/pageFixtures';
import { supabase } from '../../../helpers/db';
import { Musitify_Register } from '../pageObjects/Musitify-Register';
import { Musitify_Login } from '../pageObjects/Musitify-Login';


function randomDigits(length: number): string {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 10)
  ).join('');
}

function randomLetters(length: number): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () =>
    letters[Math.floor(Math.random() * letters.length)]
  ).join('');
}


let RegisterPage : Musitify_Register;
let LoginPage : Musitify_Login;

test.beforeEach(async ({ page, registerPage }) => {
  RegisterPage = new Musitify_Register(page);
  LoginPage = new Musitify_Login(page);
  await registerPage.goto();
  await expect(page).toHaveURL(registerPage.RegisterPage_url);
});

test.afterEach(async ({ page }) => {
  await page.close();
});

//Negative Flow - Password Must Meet Minimum Length
test('Music App Register Flow - (Negative) Password must meet minimum length', async ({ registerPage }) => {
  await registerPage.Username.fill('Short Password User');
  await registerPage.EmailAddress.fill('short-password-user@example.com');
  await registerPage.Password.fill('Abc@12');
  await registerPage.ConfirmPassword.fill('Abc@12');
  await registerPage.ConfirmPassword.press('Enter');
  await expect(registerPage.PasswordMinimumLengthError).toBeVisible();
});

//Positive Flow - Normal Register Flow
test('Music App Register Flow', async ({ page, loginPage }, testInfo) => {
  

  await RegisterPage.Username.fill("Username" + randomDigits(5));
  const Username = await RegisterPage.Username.inputValue();
  await RegisterPage.EmailAddress.fill(randomLetters(5)+ randomDigits(5) + "@email.com");
  const Email = await RegisterPage.EmailAddress.inputValue();
  const RandomPassword = "Password@" + randomDigits(5);
  await RegisterPage.Password.fill(RandomPassword);
  await RegisterPage.ConfirmPassword.fill(RandomPassword);
  const registerSubmittedScreenshot = await page.screenshot({ path: 'screenshots/step1-register-submitted.png' });
  await testInfo.attach('Step 1 - register submitted', {
    body: registerSubmittedScreenshot,
    contentType: 'image/png',
  });
  await RegisterPage.CreateUserButton.click();
  await expect(RegisterPage.MemberCreatedSuccesfully).toBeVisible();
  const MemberCreatedSuccesfullyScreenshot = await page.screenshot({ path: 'screenshots/step1-Member-Created-Successfully.png' });
  await testInfo.attach('Step 1 - register submitted', {
    body: MemberCreatedSuccesfullyScreenshot,
    contentType: 'image/png',
  });
  await expect(page).toHaveURL(loginPage.LoginPage_url);

  console.log("Username: " + Username);
  console.log("Password: " + RandomPassword)
  console.log("Email: " + Email);

}); 

//Negative Flow - Email Alrdy Exists
test('Music App Register Flow - User Exists', async ({ page,registerPage }, testInfo) => {
  await RegisterPage.Username.fill("Username" + randomDigits(5));
  await RegisterPage.EmailAddress.fill("ikbwd99329@email.com");
  const RandomPassword = "Password@" + randomDigits(5);
  await RegisterPage.Password.fill(RandomPassword);
  await RegisterPage.ConfirmPassword.fill(RandomPassword);
  const registerSubmittedScreenshot = await page.screenshot({ path: 'screenshots/step1-register-submitted.png' });
  await testInfo.attach('Step 1 - register submitted', {
    body: registerSubmittedScreenshot,
    contentType: 'image/png',
  });
  await RegisterPage.CreateUserButton.click();
  await expect(RegisterPage.UserExists).toBeVisible();
  const MemberExistsScreenshot = await page.screenshot({ path: 'screenshots/step1-Member-Exists.png' });
  await testInfo.attach('Step 1 - register submitted', {
    body: MemberExistsScreenshot,
    contentType: 'image/png',
  });
  await expect(page).toHaveURL(registerPage.RegisterPage_url);
}); 