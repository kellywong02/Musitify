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

async function removeUploadedSongsFromApp(page, uploadedSong) {
  const result = await page.evaluate(async ({ title, artist }) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!currentUser) {
      return { removed: 0 };
    }

    const songsResponse = await fetch('/songs');
    const songs = await songsResponse.json();
    const normalizedTitle = String(title).toLowerCase();
    const matchingSongs = songs.filter(song =>
      String(song.title).toLowerCase().startsWith(normalizedTitle) &&
      String(song.artist).toLowerCase() === String(artist).toLowerCase()
    );

    for (const song of matchingSongs) {
      await fetch(`/songs/${song.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: currentUser.id
        })
      });
    }

    return { removed: matchingSongs.length };
  }, {
    title: uploadedSong.Song_Title,
    artist: uploadedSong.Song_Artist
  });

  return result.removed;
}

async function removeUploadedSongFromJson(uploadedSong) {
  const rawSongs = await fs.readFile(songUploadJsonPath, 'utf-8');
  const songs = JSON.parse(rawSongs);
  const uploadedSongIndex = songs.findIndex(song =>
    song.Song_Title === uploadedSong.Song_Title &&
    song.Song_Artist === uploadedSong.Song_Artist &&
    song.Song_Path === uploadedSong.Song_Path
  );

  if (uploadedSongIndex === -1) {
    return;
  }

  songs.splice(uploadedSongIndex, 1);
  await fs.writeFile(songUploadJsonPath, `${JSON.stringify(songs, null, 2)}\n`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test.beforeEach(async ({ page, addMusicPage }) => {
  await addMusicPage.goto();
  await expect(page).toHaveURL(addMusicPage.LoginPage_url);
});

test.afterEach(async ({ page }) => {
  await page.close();
});


//POSITIVE TESTCASES
test('Add Song Successfully', async ({ page, addMusicPage, loginPage }, testInfo) => {
  const testSong = AddSong;

  await loginPage.login(AdminUser.email, AdminUser.password);
  await expect(page).toHaveURL(/home.html/);
  await removeUploadedSongsFromApp(page, testSong);
  await page.reload();

  const BeforeSongAddedScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Song-Added-submitted.png' });
  await testInfo.attach('Step 1 - Before Song Added', {
    body: BeforeSongAddedScreenshot,
    contentType: 'image/png',
  });
  await addMusicPage.SongTitle.fill(testSong.Song_Title);
  await addMusicPage.SongAlbum.fill(testSong.Song_Album);
  await addMusicPage.SongArtist.fill(testSong.Song_Artist);
  await addMusicPage.SongDuration.fill(testSong.Song_Duration);
  await addMusicPage.SongCoverImageURL.fill(testSong.Song_Cover_Image_URL)
  const fileChooserPromise = page.waitForEvent("filechooser");
  await addMusicPage.ChooseSongButton.click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(testSong.Song_Path);
  const [uploadResponse] = await Promise.all([
    page.waitForResponse(response =>
      response.url().endsWith('/songs') &&
      response.request().method() === 'POST'
    ),
    addMusicPage.UploadSongButton.click()
  ]);

  const uploadData = await uploadResponse.json().catch(() => ({}));
  expect(
    uploadResponse.ok(),
    `Upload failed with status ${uploadResponse.status()}: ${JSON.stringify(uploadData)}`
  ).toBeTruthy();

  await expect (addMusicPage.UploadSongSuccessfullyToast).toBeVisible();
  const addedSongCard = addMusicPage.songCardByTitle(testSong.Song_Title);
  await expect(addedSongCard).toContainText(new RegExp(escapeRegExp(testSong.Song_Title), 'i'));
  await expect(addedSongCard.locator('.artist')).toContainText(new RegExp(escapeRegExp(testSong.Song_Artist), 'i'));
  await expect(addedSongCard.locator('.duration')).toContainText(new RegExp(escapeRegExp(testSong.Song_Duration), 'i'));
  const addedSongScreenshot = await addedSongCard.screenshot({ path: 'screenshots/step2-added-song-card.png' });
  await testInfo.attach('Step 2 - added song card', {
    body: addedSongScreenshot,
    contentType: 'image/png',
  });
  await removeUploadedSongFromJson(testSong);
}); 


test('Admin User have Upload Song Form', async ({ page, addMusicPage, loginPage }, testInfo) => {
  await loginPage.login(AdminUser.email, AdminUser.password);
  await expect(page).toHaveURL(/home.html/);
  await expect(addMusicPage.UploadSongHeader).toBeVisible();
}); 

test('Normal User Does not have Upload Song Form', async ({ page, addMusicPage, loginPage }, testInfo) => {
  await loginPage.login(NormalUser.email, NormalUser.password);
  await expect(page).toHaveURL(/home.html/);
  await expect(addMusicPage.UploadSongHeader).not.toBeVisible();
}); 

test('Unable to add song if fields are empty', async ({ page, addMusicPage, loginPage }, testInfo) => {
  await loginPage.login(AdminUser.email, AdminUser.password);
  await expect(page).toHaveURL(/home.html/);
  await addMusicPage.UploadSongButton.click();
  await expect(addMusicPage.UploadSongEmptyFieldsError).toBeVisible();
}); 

test('Songs are able to be played after uploading', async ({ page, addMusicPage, loginPage }, testInfo) => {
  await loginPage.login(AdminUser.email, AdminUser.password);
  await expect(page).toHaveURL(/home.html/);
  await addMusicPage.songCardPlayButton('BANG BANG').click();
  await expect(addMusicPage.SongPlayerTitle).toBeVisible();
  await expect(addMusicPage.SongPlayerTitle).toContainText(new RegExp(escapeRegExp("BANG BANG"), 'i'));
  await expect(addMusicPage.SongPlayerArtist).toBeVisible();
  await expect(addMusicPage.SongPlayerArtist).toContainText(new RegExp(escapeRegExp("IVE"), 'i'));
}); 




