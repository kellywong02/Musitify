import { test, expect } from '../fixtures/pageFixtures';
import { promises as fs } from 'fs';
import path from 'path';
import SongUpload from '../../Json/Songs_Upload.json'

const AddSong = SongUpload[0];
const songUploadJsonPath = path.resolve(__dirname, '../../Json/Songs_Upload.json');

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

test.beforeEach(async ({ page, addMusicPage }) => {
  await addMusicPage.goto();
  await expect(page).toHaveURL(addMusicPage.LoginPage_url);
});

test.afterEach(async ({ page }) => {
  await page.close();
});


//POSITIVE TESTCASES
test('Music App Add Music', async ({ page, addMusicPage, loginPage }, testInfo) => {
  await loginPage.login('admin@admin.sg', 'Admin@123');
  await expect(page).toHaveURL(/home.html/);
  const BeforeSongAddedScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Song-Added-submitted.png' });
  await testInfo.attach('Step 1 - Before Song Added', {
    body: BeforeSongAddedScreenshot,
    contentType: 'image/png',
  });
  await addMusicPage.SongTitle.fill(AddSong.Song_Title);
  await addMusicPage.SongAlbum.fill(AddSong.Song_Album);
  await addMusicPage.SongArtist.fill(AddSong.Song_Artist);
  await addMusicPage.SongDuration.fill(AddSong.Song_Duration);
  await addMusicPage.SongCoverImageURL.fill(AddSong.Song_Cover_Image_URL)
  const fileChooserPromise = page.waitForEvent("filechooser");
  await addMusicPage.ChooseSongButton.click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(AddSong.Song_Path);
  await addMusicPage.UploadSongButton.click();
  await page.waitForLoadState('networkidle');
  await expect (addMusicPage.UploadSongSuccessfullyToast).toBeVisible();
  const addedSongCard = addMusicPage.songCardByTitle(AddSong.Song_Title);
  await expect(addedSongCard).toContainText(new RegExp(AddSong.Song_Title, 'i'));
  const addedSongScreenshot = await addedSongCard.screenshot({ path: 'screenshots/step2-added-song-card.png' });
  await testInfo.attach('Step 2 - added song card', {
    body: addedSongScreenshot,
    contentType: 'image/png',
  });
  await removeUploadedSongFromJson(AddSong);
}); 


