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


test.beforeEach(async ({ page, PhotocardPage }) => {
  await PhotocardPage.goto();
  await expect(page).toHaveURL(PhotocardPage.LoginPage_url);
});

// test.afterEach(async ({ page }) => {
//   await page.close();
// });

test('User able to draw photocard & User only able to draw one photocard per day', async({page,PhotocardPage, loginPage},testInfo) =>{
    await loginPage.login(NormalUser.email, NormalUser.password);
    await expect(page).toHaveURL(/home/);
    await PhotocardPage.SideBarLuckyDrawButton.click();
    const BeforeDrawCardScreenshot = await page.screenshot({ path: 'screenshots/step1-Before-Draw-Card-submitted.png' });
    await testInfo.attach('Step 1 - Before Draw Card', {
    body: BeforeDrawCardScreenshot,
    contentType: 'image/png',
  });
    const beforeCount = await PhotocardPage.PhotocardCollectionItems.count();
    if (await PhotocardPage.DrawPhotocardButton.isDisabled()) {
      await expect(PhotocardPage.YouHaveAlreadyDrawnMessage).toBeVisible();
      await expect(PhotocardPage.PhotocardCollectionItems).toHaveCount(beforeCount);
      return;
    }

    await PhotocardPage.DrawPhotocardButton.click();
    await expect(PhotocardPage.DrawPhotocardButton).toBeDisabled();
    const popupOpened = await PhotocardPage.PhotocardModal.isVisible({ timeout: 2000 }).catch(() => false);

    if (popupOpened) {
      await expect(PhotocardPage.DrawnPhotocard).toBeVisible();
      await PhotocardPage.ClosePhotoCardPopUp.click();
      await expect(PhotocardPage.PhotocardCollectionItems).toHaveCount(beforeCount + 1);
    } else {
      await expect(PhotocardPage.YouHaveAlreadyDrawnMessage).toBeVisible();
      expect(await PhotocardPage.PhotocardCollectionItems.count()).toBeGreaterThanOrEqual(beforeCount);
    }
});

test('Photocard detail popup opens when clicking a photocard ', async({page,PhotocardPage, loginPage},testInfo) =>{
    await loginPage.login(NormalUser.email, NormalUser.password);
    await expect(page).toHaveURL(/home/);
    await PhotocardPage.SideBarLuckyDrawButton.click();
    await PhotocardPage.photocardByArtistMemberAndRarity('IVE', 'Lee Seo', 'Common').click();
    await expect(PhotocardPage.PhotocardDetails).toBeVisible();
    await PhotocardPage.BackToCollectionButton.click();
});


function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
