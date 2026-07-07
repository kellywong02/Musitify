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

async function acceptDeletePlaylistDialog(page, PlaylistPage, playlistName?: string) {
  const dialogPromise = page.waitForEvent('dialog');
  const deleteClickPromise = PlaylistPage.DeletePlaylist.click();
  const dialog = await dialogPromise;

  if (playlistName) {
    expect(dialog.message()).toContain(playlistName);
  }

  await dialog.accept();
  await deleteClickPromise;
}


test.beforeEach(async ({ page, PlaylistPage }) => {
  await PlaylistPage.goto();
  await expect(page).toHaveURL(PlaylistPage.LoginPage_url);
});

test.afterEach(async ({ page,PlaylistPage }) => {
  await PlaylistPage.SideBarPlaylistButton.click();
  while (await PlaylistPage.PlaylistItems.count() > 0) {
    const playlistCount = await PlaylistPage.PlaylistItems.count();
    await PlaylistPage.PlaylistItems.first().click();
    await acceptDeletePlaylistDialog(page, PlaylistPage);
    await expect(PlaylistPage.PlaylistItems).toHaveCount(playlistCount - 1);
  }
  await page.close();
});

test('Create a new playlist', async ({ page, PlaylistPage, loginPage }) => {
  const playlistName = `New Playlist ${Date.now()}`;
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await PlaylistPage.SideBarPlaylistButton.click();
  await PlaylistPage.NewPlayListName.fill(playlistName);
  await PlaylistPage.CreatePlaylistButton.click();
  await expect(PlaylistPage.playlistByName(playlistName)).toContainText(playlistName);
});

test('Show an error when creating a duplicate playlist name', async ({ page, PlaylistPage, loginPage }) => {
  const playlistName = `Duplicate Playlist ${Date.now()}`;
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await PlaylistPage.SideBarPlaylistButton.click();
  await PlaylistPage.NewPlayListName.fill(playlistName);
  await PlaylistPage.CreatePlaylistButton.click();
  await expect(PlaylistPage.playlistByName(playlistName)).toContainText(playlistName);
  await PlaylistPage.NewPlayListName.fill(playlistName);
  await PlaylistPage.CreatePlaylistButton.click();
  await expect(PlaylistPage.PlaylistCreateMessage).toContainText('A playlist with this name already exists.');
});

test('Delete Playlist', async ({ page, PlaylistPage, loginPage },testInfo) => {
  const playlistName = `Playlist To Delete ${Date.now()}`;
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await PlaylistPage.SideBarPlaylistButton.click();
  await PlaylistPage.NewPlayListName.fill(playlistName);
  await PlaylistPage.CreatePlaylistButton.click();
  await PlaylistPage.playlistByName(playlistName).click();
  const BeforeDeleteScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Delete-Playlist-submitted.png' });
  await testInfo.attach('Step 1 - Before Next Song', {
    body: BeforeDeleteScreenshot,
    contentType: 'image/png',
  });
  await acceptDeletePlaylistDialog(page, PlaylistPage, playlistName);
  await expect(PlaylistPage.playlistByName(playlistName)).toHaveCount(0);
});

test('Add Song To Playlist', async ({ page, PlaylistPage, loginPage },testInfo) => {
  const playlistName = `Add Song To Playlist ${Date.now()}`;
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await PlaylistPage.SideBarPlaylistButton.click();
  await PlaylistPage.NewPlayListName.fill(playlistName);
  await PlaylistPage.CreatePlaylistButton.click();
  await PlaylistPage.playlistByName(playlistName).click();
  const BeforeAddSongScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Add-Song-Playlist-submitted.png' });
  await testInfo.attach('Step 1 - Before Next Song', {
    body: BeforeAddSongScreenshot,
    contentType: 'image/png',
  });
  await PlaylistPage.SideBarHomeButton.click();
  await PlaylistPage.waitForSongCard('BANG BANG');
  await PlaylistPage.AddToPlaylist('BANG BANG').click();
  await expect(PlaylistPage.ExistingPlaylist(playlistName)).toBeVisible();
  await PlaylistPage.ExistingPlaylist(playlistName).click();
  const AfterClickingPlaylistScreenshot = await page.screenshot({ path: 'screenshots/step1-After-Clicking-Playlist-submitted.png' });
  await testInfo.attach('Step 1 - After Clicking Playlist', {
    body: AfterClickingPlaylistScreenshot,
    contentType: 'image/png',
  });
  await PlaylistPage.ClosePlaylistPopUp.click();
  await PlaylistPage.SideBarPlaylistButton.click();
  await PlaylistPage.playlistByName(playlistName).click();
  await expect(PlaylistPage.SongInPlaylist('BANG BANG')).toBeVisible();
});

test('Remove Song To Playlist', async ({ page, PlaylistPage, loginPage },testInfo) => {
  const playlistName = `Remove Song To Playlist ${Date.now()}`;
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await PlaylistPage.SideBarPlaylistButton.click();
  await PlaylistPage.NewPlayListName.fill(playlistName);
  await PlaylistPage.CreatePlaylistButton.click();
  await PlaylistPage.playlistByName(playlistName).click();
  await PlaylistPage.SideBarHomeButton.click();
  await PlaylistPage.waitForSongCard('BANG BANG');
  await PlaylistPage.AddToPlaylist('BANG BANG').click();
  await expect(PlaylistPage.ExistingPlaylist(playlistName)).toBeVisible();
  await PlaylistPage.ExistingPlaylist(playlistName).click();
  await PlaylistPage.ClosePlaylistPopUp.click();
  await PlaylistPage.SideBarPlaylistButton.click();
  await PlaylistPage.playlistByName(playlistName).click();
  await expect(PlaylistPage.SongInPlaylist('BANG BANG')).toBeVisible();
  const BeforeRemoveSongScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Remove-Song-Playlist-submitted.png' });
  await testInfo.attach('Step 1 - Before Remove Song', {
    body: BeforeRemoveSongScreenshot,
    contentType: 'image/png',
  });
  await PlaylistPage.RemoveSongFromPlaylist('Bang Bang').click();
  await expect(PlaylistPage.SongInPlaylist('BANG BANG')).toHaveCount(0);
  const AfterRemoveSongScreenshot = await page.screenshot({ path: 'screenshots/step1-After-Remove-Song-Playlist-submitted.png' });
  await testInfo.attach('Step 1 - After Remove Song', {
    body: AfterRemoveSongScreenshot,
    contentType: 'image/png',
  });
});

test('Playlist remains after page reload', async ({ page, PlaylistPage, loginPage },testInfo) => {
  const playlistName = `Playlist remains after page reload ${Date.now()}`;
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await PlaylistPage.SideBarPlaylistButton.click();
  await PlaylistPage.NewPlayListName.fill(playlistName);
  await PlaylistPage.CreatePlaylistButton.click();
  await PlaylistPage.playlistByName(playlistName).click();
  await PlaylistPage.SideBarHomeButton.click();
  await PlaylistPage.waitForSongCard('BANG BANG');
  await PlaylistPage.AddToPlaylist('BANG BANG').click();
  await expect(PlaylistPage.ExistingPlaylist(playlistName)).toBeVisible();
  await PlaylistPage.ExistingPlaylist(playlistName).click();
  await PlaylistPage.ClosePlaylistPopUp.click();
  await PlaylistPage.SideBarPlaylistButton.click();
  await PlaylistPage.playlistByName(playlistName).click();
  await expect(PlaylistPage.SongInPlaylist('BANG BANG')).toBeVisible();
  const BeforeRefreshingPageScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Refreshing-Song-Playlist-submitted.png' });
  await testInfo.attach('Step 1 - Before Refreshing Page', {
    body: BeforeRefreshingPageScreenshot,
    contentType: 'image/png',
  });
  await page.keyboard.press('F5');
  const AfterRemoveSongScreenshot = await page.screenshot({ path: 'screenshots/step1-After-Remove-Song-Playlist-submitted.png' });
  await testInfo.attach('Step 1 - After Remove Song', {
    body: AfterRemoveSongScreenshot,
    contentType: 'image/png',
  });
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
