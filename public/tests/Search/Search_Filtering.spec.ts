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


test.beforeEach(async ({ page, SearchPage }) => {
  await SearchPage.goto();
  await expect(page).toHaveURL(SearchPage.LoginPage_url);
});

// test.afterEach(async ({ page }) => {
//   await page.close();
// });

test('Search by song title filters song cards', async({page,SearchPage, loginPage },testInfo) =>{
  await loginPage.login(NormalUser.email,NormalUser.password);
  await SearchPage.waitForSongCard('BANG BANG');
  await SearchPage.SearchingTextbox.fill('BANG BANG');
  await expect(SearchPage.songCardByTitle('BANG BANG')).toBeVisible();
});

test('Search by artist filters song cards', async({page,SearchPage, loginPage },testInfo) =>{
  await loginPage.login(NormalUser.email,NormalUser.password);
  await SearchPage.waitForSongsLoaded();
  await SearchPage.SearchingTextbox.fill('GFRIEND');
  await expect(SearchPage.songCardByArtist('GFRIEND').first()).toBeVisible();
});

test('Search with no result shows empty state or no cards', async({page,SearchPage, loginPage },testInfo) =>{
  await loginPage.login(NormalUser.email,NormalUser.password);
  await SearchPage.waitForSongsLoaded();
  await SearchPage.SearchingTextbox.fill('KiiiKiii');
  await expect(SearchPage.songCardByArtist('KiiiKiii')).not.toBeVisible();
});

test('Clearing search restores full song list', async({page,SearchPage, loginPage },testInfo) =>{
  await loginPage.login(NormalUser.email,NormalUser.password);
  await SearchPage.waitForSongsLoaded();
  await SearchPage.SearchingTextbox.fill('KiiiKiii');
  const BeforeClearingTextFieldScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Clearing-Textfield-submitted.png' });
    await testInfo.attach('Step 1 - Before Clearing Textfield', {
    body: BeforeClearingTextFieldScreenshot,
    contentType: 'image/png',
  });
  await expect(SearchPage.songCardByArtist('KiiiKiii')).not.toBeVisible();
  await SearchPage.SearchingTextbox.fill('');
  await SearchPage.waitForSongsLoaded();
});



function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
