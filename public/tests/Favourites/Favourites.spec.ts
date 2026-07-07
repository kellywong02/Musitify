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



test.beforeEach(async ({ page, FavouritePage }) => {
  await FavouritePage.goto();
  await expect(page).toHaveURL(FavouritePage.LoginPage_url);
});

test.afterEach(async ({ page,FavouritePage }) => {
  await removeFavouriteIfPresent(FavouritePage, 'BANG BANG');
  await page.close();
});



test('Click heart button adds song to Favorites', async ({ page, FavouritePage, loginPage }) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await FavouritePage.waitForSongCard('BANG BANG');
  await removeFavouriteIfPresent(FavouritePage, 'BANG BANG');
  await FavouritePage.AddToFavouriteButton('BANG BANG').click();
  await FavouritePage.SideBarFavouriteButton.click();
  await expect(FavouritePage.favouriteSongCardByTitle('BANG BANG')).toBeVisible();
  
});

test('Click heart button again removes song from Favorites', async ({ page, FavouritePage, loginPage }, testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await FavouritePage.waitForSongCard('BANG BANG');
  await removeFavouriteIfPresent(FavouritePage, 'BANG BANG');
  await FavouritePage.AddToFavouriteButton('BANG BANG').click();
  await FavouritePage.SideBarFavouriteButton.click();
  await expect(FavouritePage.favouriteSongCardByTitle('BANG BANG')).toBeVisible();
  const BeforeUnFavouriteScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-UnFavourite-Song-submitted.png' });
  await testInfo.attach('Step 1 - Before Next Song', {
    body: BeforeUnFavouriteScreenshot,
    contentType: 'image/png',
  });
  await FavouritePage.RemoveFromFavourite('BANG BANG').click();
  await expect(FavouritePage.favouriteSongCardByTitle('BANG BANG')).not.toBeVisible();
});

test('Favorites are saved after page reload', async ({ page, FavouritePage, loginPage }, testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await FavouritePage.waitForSongCard('BANG BANG');
  await removeFavouriteIfPresent(FavouritePage, 'BANG BANG');
  await FavouritePage.AddToFavouriteButton('BANG BANG').click();
  await FavouritePage.SideBarFavouriteButton.click();
  await expect(FavouritePage.favouriteSongCardByTitle('BANG BANG')).toBeVisible();
  const BeforeRefreshScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Refresh-Song-submitted.png' });
  await testInfo.attach('Step 1 - Before Refresh Song', {
    body: BeforeRefreshScreenshot,
    contentType: 'image/png',
  });
  await page.keyboard.press('F5');
  await expect(FavouritePage.favouriteSongCardByTitle('BANG BANG')).toBeVisible();
});

test('Favorites are user-specific', async ({ page, FavouritePage, loginPage }, testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await FavouritePage.waitForSongCard('BANG BANG');
  await removeFavouriteIfPresent(FavouritePage, 'BANG BANG');
  await FavouritePage.AddToFavouriteButton('BANG BANG').click();
  await FavouritePage.SideBarFavouriteButton.click();
  await expect(FavouritePage.favouriteSongCardByTitle('BANG BANG')).toBeVisible();
  const FirstUserScreenshot = await page.screenshot({ path: 'screenshots/step1-First-User-Song-submitted.png' });
  await testInfo.attach('Step 1 - Before Refresh Song', {
    body: FirstUserScreenshot,
    contentType: 'image/png',
  });
  await FavouritePage.LogoutButton.click();
  await loginPage.login(AdminUser.email, AdminUser.password);
  await FavouritePage.SideBarFavouriteButton.click();
  await expect(FavouritePage.favouriteSongCardByTitle('BANG BANG')).not.toBeVisible();
  const SecondUserScreenshot = await page.screenshot({ path: 'screenshots/step1-Second-User-Song-submitted.png' });
  await testInfo.attach('Step 1 - Before Refresh Song', {
    body: SecondUserScreenshot,
    contentType: 'image/png',
  });
  await FavouritePage.LogoutButton.click();
  await loginPage.login(NormalUser.email, NormalUser.password);
  await FavouritePage.waitForSongCard('BANG BANG');
  await FavouritePage.SideBarFavouriteButton.click();
  await expect(FavouritePage.favouriteSongCardByTitle('BANG BANG')).toBeVisible();
});

async function removeFavouriteIfPresent(FavouritePage, songTitle: string) {
  await FavouritePage.SideBarFavouriteButton.click();
  if (await FavouritePage.favouriteSongCardByTitle(songTitle).isVisible()) {
    await FavouritePage.RemoveFromFavouriteList(songTitle).click();
    await expect(FavouritePage.favouriteSongCardByTitle(songTitle)).not.toBeVisible();
  }
  await FavouritePage.SideBarHomeButton.click();
  await FavouritePage.waitForSongsLoaded();
}

async function cleanupFavouriteForUser(loginPage, FavouritePage, user, songTitle: string) {
  await loginPage.login(user.email, user.password);
  await removeFavouriteIfPresent(FavouritePage, songTitle);
  await FavouritePage.LogoutButton.click();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
