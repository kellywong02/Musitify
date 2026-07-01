import { test, expect } from '../fixtures/pageFixtures';
import { promises as fs } from 'fs';
import path from 'path';
import RemoveSong from '../../Json/Remove_Song.json'
import { Musitify_RemoveMusic } from '../pageObjects/RemoveSong';
import User from '../../Json/Login.json'


let SongRemovedPage: Musitify_RemoveMusic;
const AdminUser = User[0];
const NormalUser = User[1];
const Song = RemoveSong[0];
const songUploadJsonPath = path.resolve(__dirname, '../../Json/Songs_Upload.json');

async function addRemovedSongBackToUploadJson(song) {
  const rawSongs = await fs.readFile(songUploadJsonPath, 'utf-8');
  const songs = JSON.parse(rawSongs);
  const songAlreadyExists = songs.some(existingSong =>
    existingSong.Song_Title === song.Song_Title &&
    existingSong.Song_Artist === song.Song_Artist &&
    existingSong.Song_Path === song.Song_Path
  );

  if (songAlreadyExists) {
    return;
  }

  songs.push(song);
  await fs.writeFile(songUploadJsonPath, `${JSON.stringify(songs, null, 2)}\n`);
}

test.beforeEach(async ({ page }) => {
  SongRemovedPage = new Musitify_RemoveMusic(page);
  await SongRemovedPage.goto();
  await expect(page).toHaveURL(SongRemovedPage.LoginPage_url);
});

test.afterEach(async ({ page }) => {
  await page.close();
});

//POSITIVE TESTCASES
test('Music App Remove Music', async ({ page, loginPage }, testInfo) => {


  await loginPage.login('admin@admin.sg', 'Admin@123');
  await expect(page).toHaveURL(/home.html/);
  await page.reload();

  const BeforeSongRemovedScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Song-Removed-submitted.png' });
  await testInfo.attach('Step 1 - Before Song Removed', {
    body: BeforeSongRemovedScreenshot,
    contentType: 'image/png',
  });

  const songCard = SongRemovedPage.songCardByTitle(Song.Song_Title);
  await expect(songCard).toBeVisible();

  page.once('dialog', async dialog => {
    expect(dialog.message()).toContain('Are you sure');
    await dialog.accept();
  });

  await Promise.all([
    page.waitForResponse(response =>
      response.url().includes('/songs/') &&
      response.request().method() === 'DELETE' &&
      response.ok()
    ),
    SongRemovedPage.RemoveSong(Song.Song_Title).click()
  ]);

  await expect(songCard).not.toBeVisible();
  await addRemovedSongBackToUploadJson(Song);
}); 


//Remove Song Dialog Can Be Cancelled
test('Remove Song Dialog Can Be Cancelled', async ({ page, loginPage }, testInfo) => {


  await loginPage.login('admin@admin.sg', 'Admin@123');
  await expect(page).toHaveURL(/home.html/);
  await page.reload();

  const BeforeSongRemovedScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Song-Removed-submitted.png' });
  await testInfo.attach('Step 1 - Before Song Removed', {
    body: BeforeSongRemovedScreenshot,
    contentType: 'image/png',
  });

  const songCard = SongRemovedPage.songCardByTitle(Song.Song_Title);
  await expect(songCard).toBeVisible();

  page.once('dialog', async dialog => {
    expect(dialog.message()).toContain('Are you sure');
    await dialog.dismiss;
  });

  await expect(songCard).toBeVisible();
}); 

test('Normal User Does Not Have Remove Button', async ({ page, addMusicPage, loginPage }, testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await expect(SongRemovedPage.RemoveSong("BANG BANG")).not.toBeVisible();
}); 

