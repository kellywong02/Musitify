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



test.beforeEach(async ({ page, SongPlayerPage }) => {
  await SongPlayerPage.goto();
  await expect(page).toHaveURL(SongPlayerPage.LoginPage_url);
});

test.afterEach(async ({ page }) => {
  await page.close();
});

test('Song player page shows selected song cover/title/artist/duration ', async ({ page, loginPage, SongPlayerPage }, testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await SongPlayerPage.songCardPlayButton('BANG BANG').click();
  await SongPlayerPage.OpenSongPlayer.click();
  await expect(SongPlayerPage.SongPlayerTitle).toBeVisible();
  await expect(SongPlayerPage.SongPlayerArtist).toBeVisible();
  await expect(SongPlayerPage.SongPlayerDuration).toBeVisible();
}); 

test('SUpcoming Songs list appears on the right', async ({ page, loginPage, SongPlayerPage }, testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await SongPlayerPage.songCardPlayButton('BANG BANG').click();
  await SongPlayerPage.OpenSongPlayer.click();
  await expect(SongPlayerPage.UpcomingSongTitles.first()).toBeVisible();
}); 

test('Upcoming song area is scrollable', async ({ page, SongPlayerPage, loginPage }) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);

  await SongPlayerPage.songCardPlayButton('BANG BANG').click();
  await SongPlayerPage.OpenSongPlayer.click();
  await expect(SongPlayerPage.UpcomingSongTitles.first()).toBeVisible();

  const canScroll = await SongPlayerPage.UpcomingSongArea.evaluate((element) => {
    return element.scrollHeight > element.clientHeight;
  });

  expect(canScroll).toBeTruthy();

  await SongPlayerPage.UpcomingSongArea.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  const scrollTop = await SongPlayerPage.UpcomingSongArea.evaluate((element) => {
    return element.scrollTop;
  });

  expect(scrollTop).toBeGreaterThan(0);
});

test('Clicking an upcoming song changes the current song', async ({ page, SongPlayerPage, loginPage },testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await SongPlayerPage.songCardPlayButton('BANG BANG').click();
  await expect(SongPlayerPage.BottomSongPlayerTitle).toContainText(/BANG BANG/i);
  const upcomingTitle = await SongPlayerPage.UpcomingSongTitles.first().innerText();
  await SongPlayerPage.OpenSongPlayer.click();
  const BeforeNextSongScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Next-Song-submitted.png' });
  await testInfo.attach('Step 1 - Before Next Song', {
    body: BeforeNextSongScreenshot,
    contentType: 'image/png',
  });
  await SongPlayerPage.UpcomingSongs.first().click();
  await expect(SongPlayerPage.BottomSongPlayerTitle).toContainText(
    new RegExp(escapeRegExp(upcomingTitle), 'i')
  );
});


test('Lyrics card is on the right side', async ({ page, SongPlayerPage, loginPage }) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await SongPlayerPage.songCardPlayButton('BANG BANG').click();
  await SongPlayerPage.OpenSongPlayer.click();
  await expect(SongPlayerPage.UpcomingCard).toBeVisible();
  await expect(SongPlayerPage.LyricsCard).toBeVisible();
  const upcomingBox = await SongPlayerPage.UpcomingCard.boundingBox();
  const lyricsBox = await SongPlayerPage.LyricsCard.boundingBox();

  expect(upcomingBox).not.toBeNull();
  expect(lyricsBox).not.toBeNull();

  expect(lyricsBox!.x).toBeGreaterThan(upcomingBox!.x);
});

test('Lyrics loads for selected song', async ({ page, SongPlayerPage, loginPage },testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await SongPlayerPage.songCardPlayButton('BANG BANG').click();
  await expect(SongPlayerPage.BottomSongPlayerTitle).toContainText(/BANG BANG/i);
  await SongPlayerPage.OpenSongPlayer.click();
  await expect(SongPlayerPage.LyricsContent).not.toContainText('Loading lyrics...', {
  timeout: 15000
  })
  await expect(SongPlayerPage.LyricsContent).toContainText(/.+/, {
  timeout: 15000
  });
  await expect(SongPlayerPage.SongLyricsCard).toBeVisible();
});

test('Lyrics card is scrollable', async ({ page, SongPlayerPage, loginPage }) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);

  await SongPlayerPage.songCardPlayButton('BANG BANG').click();
  await SongPlayerPage.OpenSongPlayer.click();
  await expect(SongPlayerPage.LyricsContent).not.toContainText('Loading lyrics...', {
  timeout: 15000
  })
  await expect(SongPlayerPage.LyricsContent).toContainText(/.+/, {
  timeout: 15000
  });

  const canScroll = await SongPlayerPage.LyricsContent.evaluate((element) => {
    return element.scrollHeight > element.clientHeight;
  });

  expect(canScroll).toBeTruthy();

  await SongPlayerPage.LyricsContent.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  const scrollTop = await SongPlayerPage.LyricsContent.evaluate((element) => {
    return element.scrollTop;
  });

  expect(scrollTop).toBeGreaterThan(0);
});

test('Synced lyric line highlights during playback if synced lyrics exist', async ({ page, SongPlayerPage, loginPage }) => {
  await page.route('**/lyrics?**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        lyrics: 'First synced line\nSecond synced line\nThird synced line',
        syncedLyrics: [
          '[00:01.00] First synced line',
          '[00:05.00] Second synced line',
          '[00:10.00] Third synced line'
        ].join('\n'),
        source: 'test'
      })
    });
  });

  await page.evaluate(() => {
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

    Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
      configurable: true,
      get() {
        return 30;
      }
    });

    HTMLMediaElement.prototype.play = function () {
      return Promise.resolve();
    };
  });

  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);

  await SongPlayerPage.songCardPlayButton('BANG BANG').click();
  await SongPlayerPage.OpenSongPlayer.click();

  await expect(SongPlayerPage.LyricLines).toHaveCount(3);

  await page.evaluate(() => {
    const audio = document.getElementById('audioPlayer') as HTMLAudioElement;
    audio.currentTime = 6;
    audio.dispatchEvent(new Event('timeupdate'));
  });

  await expect(SongPlayerPage.ActiveLyricLine).toContainText('Second synced line');
});




function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
