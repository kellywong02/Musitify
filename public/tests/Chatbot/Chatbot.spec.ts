import { test, expect } from '../fixtures/pageFixtures';
import { promises as fs } from 'fs';
import path from 'path';
import SongUpload from '../../Json/Songs_Upload.json'
import User from '../../Json/Login.json'

const AddSong = SongUpload[0];
const AdminUser = User[0];
const NormalUser = User[1];
const songUploadJsonPath = path.resolve(__dirname, '../../Json/Songs_Upload.json');

test.skip(({ browserName }) => browserName !== 'chromium', 'Upload cleanup uses shared app data, so this test runs once.');


test.beforeEach(async ({ page, PhotocardPage }) => {
  await PhotocardPage.goto();
  await expect(page).toHaveURL(PhotocardPage.LoginPage_url);
});

// test.afterEach(async ({ page }) => {
//   await page.close();
// });

test('Chatbot opens when clicking AI button', async({page,ChatbotPage, loginPage,PlayBackPage },testInfo) =>{
  await loginPage.login(NormalUser.email,NormalUser.password);
  await PlayBackPage.waitForSongCard('BANG BANG');
  await ChatbotPage.AIButton.click();
  await expect(ChatbotPage.AIChatbotPanel).toBeVisible();
});

test('Chatbot closes when clicking close button', async({page,ChatbotPage, loginPage,PlayBackPage },testInfo) =>{
  await loginPage.login(NormalUser.email,NormalUser.password);
  await PlayBackPage.waitForSongCard('BANG BANG');
  await ChatbotPage.AIButton.click();
  await expect(ChatbotPage.AIChatbotPanel).toBeVisible();
  const BeforeCloseChatbotScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Close-Chatbot-submitted.png' });
    await testInfo.attach('Step 1 - Before Close Chatbot', {
    body: BeforeCloseChatbotScreenshot,
    contentType: 'image/png',
  });
  await ChatbotPage.AIChatBotCloseButton.click();
  await expect(ChatbotPage.AIChatbotPanel).not.toBeVisible();
});

test('User message appears in chatbot window', async({page,ChatbotPage, loginPage,PlayBackPage },testInfo) =>{
  await loginPage.login(NormalUser.email,NormalUser.password);
  await PlayBackPage.waitForSongCard('BANG BANG');
  await ChatbotPage.AIButton.click();
  await expect(ChatbotPage.AIChatbotPanel).toBeVisible();
  const BeforeCloseChatbotScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Close-Chatbot-submitted.png' });
    await testInfo.attach('Step 1 - Before Close Chatbot', {
    body: BeforeCloseChatbotScreenshot,
    contentType: 'image/png',
  });
  await ChatbotPage.AIChatBotTextBox.fill("Recommend me some GFRIEND's songs.");
});

test('Bot reply appears after sending message', async({page,ChatbotPage, loginPage,PlayBackPage },testInfo) =>{
  await loginPage.login(NormalUser.email,NormalUser.password);
  await PlayBackPage.waitForSongCard('BANG BANG');
  await ChatbotPage.AIButton.click();
  await expect(ChatbotPage.AIChatbotPanel).toBeVisible();
  await ChatbotPage.AIChatBotTextBox.fill("Recommend me some GFRIEND's songs.");
  const BeforeBotReplyScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Bot-Reply-submitted.png' });
    await testInfo.attach('Step 1 - Before Bot Reply', {
    body: BeforeBotReplyScreenshot,
    contentType: 'image/png',
  });
  await ChatbotPage.AIChatBotSendButton.click();
  await expect(ChatbotPage.AIChatBotMessageReply).toBeVisible({
    timeout: 15000
  });
});


test('Empty message is not sent', async({page,ChatbotPage, loginPage,PlayBackPage },testInfo) =>{
  await loginPage.login(NormalUser.email,NormalUser.password);
  await PlayBackPage.waitForSongCard('BANG BANG');
  await ChatbotPage.AIButton.click();
  await expect(ChatbotPage.AIChatbotPanel).toBeVisible();
  await ChatbotPage.AIChatBotSendButton.click();
  await expect(ChatbotPage.AIChatBotMessageReply).not.toBeVisible();
});

test('When OpenAI is unavailable, local fallback reply appears', async ({ page, ChatbotPage, loginPage, PlayBackPage }) => {
  await page.route('**/chat', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reply: 'Click the heart button on a song card to add or remove it from Favorites.',
        source: 'local',
        reason: 'missing_api_key'
      })
    });
  });

  await loginPage.login(NormalUser.email, NormalUser.password);
  await PlayBackPage.waitForSongCard('BANG BANG');

  await ChatbotPage.AIButton.click();
  await ChatbotPage.AIChatBotTextBox.fill('How do I add a song to favorites?');
  await ChatbotPage.AIChatBotSendButton.click();

  await expect(ChatbotPage.AIChatBotMessageReply).toContainText(
    'Click the heart button on a song card'
  );
});

test('When OpenAI works, /chat response has source: "openai"', async ({ page, ChatbotPage, loginPage, PlayBackPage }) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await PlayBackPage.waitForSongCard('BANG BANG');

  await ChatbotPage.AIButton.click();
  await ChatbotPage.AIChatBotTextBox.fill('How do I create a playlist?');

  const chatResponsePromise = page.waitForResponse(response =>
    response.url().includes('/chat') &&
    response.request().method() === 'POST'
  );

  await ChatbotPage.AIChatBotSendButton.click();

  const chatResponse = await chatResponsePromise;
  expect(chatResponse.ok()).toBeTruthy();

  const data = await chatResponse.json();
  expect(data.source).toBe('openai');
  expect(data.reply).toBeTruthy();
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
