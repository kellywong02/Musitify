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



test.beforeEach(async ({ page, PlaylistPage }) => {
  await PlaylistPage.goto();
  await expect(page).toHaveURL(PlaylistPage.LoginPage_url);
});

test.afterEach(async ({ page,PlaylistPage }) => {
  await PlaylistPage.SideBarPlaylistButton.click();
  while (await PlaylistPage.PlaylistItems.count() > 0) {
    const playlistCount = await PlaylistPage.PlaylistItems.count();
    await PlaylistPage.PlaylistItems.first().click();
    page.once('dialog', dialog => dialog.accept());
    await PlaylistPage.DeletePlaylist.click();
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

test('Remove Song From Playlist', async ({ page, PlaylistPage, loginPage },testInfo) => {
  const playlistName = `Playlist To Delete ${Date.now()}`;
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await PlaylistPage.SideBarPlaylistButton.click();
  await PlaylistPage.NewPlayListName.fill(playlistName);
  await PlaylistPage.CreatePlaylistButton.click();
  page.once('dialog', async dialog => {
    expect(dialog.message()).toContain(playlistName);
    await dialog.accept();
  });
  await PlaylistPage.playlistByName(playlistName).click();
  const BeforeDeleteScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Delete-Playlist-submitted.png' });
  await testInfo.attach('Step 1 - Before Next Song', {
    body: BeforeDeleteScreenshot,
    contentType: 'image/png',
  });
  await PlaylistPage.DeletePlaylist.click();
  await expect(PlaylistPage.playlistByName(playlistName)).toHaveCount(0);
});



function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
