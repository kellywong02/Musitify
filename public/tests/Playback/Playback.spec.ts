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



test.beforeEach(async ({ page, addMusicPage }) => {
  await addMusicPage.goto();
  await expect(page).toHaveURL(addMusicPage.LoginPage_url);
});

test.afterEach(async ({ page }) => {
  await page.close();
});

test('Click Play on a song card updates bottom player title and artist', async ({ page, PlayBackPage, loginPage }, testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await PlayBackPage.songCardPlayButton('BANG BANG').click();
  await expect(PlayBackPage.SongPlayerTitle).toBeVisible();
  await expect(PlayBackPage.SongPlayerTitle).toContainText(new RegExp(escapeRegExp("BANG BANG"), 'i'));
  await expect(PlayBackPage.SongPlayerArtist).toBeVisible();
  await expect(PlayBackPage.SongPlayerArtist).toContainText(new RegExp(escapeRegExp("IVE"), 'i'));
  await PlayBackPage.BackToHome.click();
  await expect(PlayBackPage.BottomSongPlayerArtist).toContainText(new RegExp(escapeRegExp("IVE"), 'i'));
  await expect(PlayBackPage.BottomSongPlayerTitle).toContainText(new RegExp(escapeRegExp("BANG BANG"), 'i'));
}); 

test('Click bottom player song info navigates to song player page', async ({ page, PlayBackPage, loginPage }, testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await PlayBackPage.songCardPlayButton('BANG BANG').click();
  await PlayBackPage.BackToHome.click();
  

}); 

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}