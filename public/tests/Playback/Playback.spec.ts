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



test.beforeEach(async ({ page, PlayBackPage }) => {
  await PlayBackPage.goto();
  await expect(page).toHaveURL(PlayBackPage.LoginPage_url);
});

test.afterEach(async ({ page }) => {
  await page.close();
});

test('Click Play on a song card updates bottom player title and artist', async ({ page, PlayBackPage, loginPage }, testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await PlayBackPage.waitForSongCard('BANG BANG');
  await PlayBackPage.songCardPlayButton('BANG BANG').click();
  await expect(PlayBackPage.BottomSongPlayerArtist).toContainText(new RegExp(escapeRegExp("IVE"), 'i'));
  await expect(PlayBackPage.BottomSongPlayerTitle).toContainText(new RegExp(escapeRegExp("BANG BANG"), 'i'));
}); 

test('Click bottom player song info navigates to song player page', async ({ page, PlayBackPage, loginPage }, testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await PlayBackPage.waitForSongCard('BANG BANG');
  await PlayBackPage.songCardPlayButton('BANG BANG').click();
  await PlayBackPage.OpenSongPlayer.click();
  await expect(PlayBackPage.SongPlayerTitle).toBeVisible();
  await expect(PlayBackPage.SongPlayerTitle).toContainText(new RegExp(escapeRegExp("BANG BANG"), 'i'));
  await expect(PlayBackPage.SongPlayerArtist).toBeVisible();
  await expect(PlayBackPage.SongPlayerArtist).toContainText(new RegExp(escapeRegExp("IVE"), 'i'));
}); 

test('Play/pause button toggles state ', async ({ page, PlayBackPage, loginPage }, testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await PlayBackPage.waitForSongCard('BANG BANG');
  await page.evaluate(() => {
    let isPaused = true;

    Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
      configurable: true,
      get() {
        return isPaused;
      }
    });

    HTMLMediaElement.prototype.play = function () {
      isPaused = false;
      this.dispatchEvent(new Event('playing'));
      return Promise.resolve();
    };

    HTMLMediaElement.prototype.pause = function () {
      isPaused = true;
      this.dispatchEvent(new Event('pause'));
    };
  });

  await PlayBackPage.songCardPlayButton('BANG BANG').click();
  await expect(PlayBackPage.PlayPauseButton).toHaveText(/❚❚/);
  await PlayBackPage.PlayPauseButton.click();
  await expect(PlayBackPage.PlayPauseButton).toHaveText(/►/);
  await PlayBackPage.PlayPauseButton.click();
  await expect(PlayBackPage.PlayPauseButton).toHaveText(/❚❚/);
}); 

test('Next button changes to next song', async ({ page, PlayBackPage, loginPage }, testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await PlayBackPage.waitForSongCard('BANG BANG');
  await PlayBackPage.songCardPlayButton('BANG BANG').click();
  await expect(PlayBackPage.BottomSongPlayerTitle).toContainText(/BANG BANG/i);
  const BeforeNextSongScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Next-Song-submitted.png' });
  await testInfo.attach('Step 1 - Before Next Song', {
    body: BeforeNextSongScreenshot,
    contentType: 'image/png',
  });
  await PlayBackPage.NextSongButton.click();
  await expect(PlayBackPage.BottomSongPlayerTitle).not.toContainText(/BANG BANG/i);
}); 

test('Previous button changes to previous song', async ({ page, PlayBackPage, loginPage }, testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await PlayBackPage.waitForSongCard('BANG BANG');
  
  await PlayBackPage.songCardPlayButton('BANG BANG').click();
  await expect(PlayBackPage.BottomSongPlayerTitle).toContainText(/BANG BANG/i);
  const BeforePreviousSongScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Previous-Song-submitted.png' });
  await testInfo.attach('Step 1 - Before Previous Song', {
    body: BeforePreviousSongScreenshot,
    contentType: 'image/png',
  });
  await PlayBackPage.PreviousSongButton.click();
  await expect(PlayBackPage.BottomSongPlayerTitle).not.toContainText(/BANG BANG/i);
}); 

test('Shuffle changes upcoming song order', async ({ page, PlayBackPage, loginPage }, testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await PlayBackPage.waitForSongCard('BANG BANG');
  await PlayBackPage.songCardPlayButton('BANG BANG').click();
  await PlayBackPage.OpenSongPlayer.click();
  const BeforeShuffleSongScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Shuffling-Song-submitted.png' });
  await testInfo.attach('Step 1 - Before Shuffling Song', {
    body: BeforeShuffleSongScreenshot,
    contentType: 'image/png',
  });
  await expect(PlayBackPage.UpcomingSongTitles.first()).toBeVisible();
  const beforeShuffle = await PlayBackPage.UpcomingSongTitles.allTextContents();
  await PlayBackPage.ShuffledSongButton.click();
  await expect(PlayBackPage.UpcomingSongTitles.first()).toBeVisible();
  const afterShuffle = await PlayBackPage.UpcomingSongTitles.allTextContents();
  expect(afterShuffle).not.toEqual(beforeShuffle);
}); 

test('Progress bar updates while song plays', async ({ page, PlayBackPage, loginPage }) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await PlayBackPage.waitForSongCard('BANG BANG');

  await page.evaluate(() => {
    Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
      configurable: true,
      get() {
        return 100;
      }
    });

    let currentTime = 0;
    Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
      configurable: true,
      get() {
        return currentTime;
      },
      set(value) {
        currentTime = value;
      }
    });

    HTMLMediaElement.prototype.play = function () {
      currentTime = 25;
      this.dispatchEvent(new Event('timeupdate'));
      return Promise.resolve();
    };
  });

  await PlayBackPage.songCardPlayButton('BANG BANG').click();

  await expect(PlayBackPage.ProgressBar).toHaveValue('25');
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
