import { expect, type Locator, type Page } from '@playwright/test';
export class Musitify_Photocard{
  readonly page: Page;
  readonly LoginPage_url = 'http://localhost:3000/login.html';
  readonly MainPage_url = 'http://localhost:3000/home.html#home';
  readonly titleRegex = 'Musitify';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.MainPage_url);
    const html = await this.page.content();
    expect(html).toContain(this.titleRegex);
  }

  songCardByTitle(songTitle: string): Locator{
      return this.page.locator('.song-card', {
        has: this.page.locator('.song-title', { hasText: new RegExp(escapeRegExp(songTitle), 'i') })
      });
  }

  get SideBarHomeButton(): Locator {
    return this.page.locator('.menu', { hasText: 'Home' });
  }

  get SideBarSearchButton(): Locator {
    return this.page.locator('.menu', { hasText: 'Search' });
  }

  get SideBarFavouriteButton(): Locator {
    return this.page.locator('.menu', { hasText: 'Favorites' });
  }

  get SideBarLuckyDrawButton(): Locator {
    return this.page.locator('.menu', { hasText: 'Daily Lucky Draw' });
  }

  get SideBarPlaylistButton(): Locator {
    return this.page.locator('.menu', { hasText: 'Playlists' });
  }

  get DrawPhotocardButton(): Locator{
    return this.page.getByRole('button', { name: 'Daily Lucky Draw' });
  }
  
  get PhotocardDetails(): Locator{
    return this.page.locator('.photocard-detail-info');
  }

  get PhotocardCollectionItems(): Locator {
    return this.page.locator('#photocardCollection article');
 }

 get ClosePhotoCardPopUp(): Locator{
    return this.page.getByRole('button', { name: 'Close photocard popup' });
 }

 get DrawnPhotocard(): Locator{
    return this.page.locator('#photocardModalContent');
 }

 get PhotocardModal(): Locator{
    return this.page.locator('#photocardModal');
 }

 get YouHaveAlreadyDrawnMessage(): Locator{
    return this.page.getByText('You already used your Daily');
}

photocardByArtistMemberAndRarity(
  artist: string,
  memberName: string,
  rarity: string
): Locator {
  return this.page.locator('#photocardCollection article')
    .filter({ hasText: artist })
    .filter({ hasText: memberName })
    .filter({ hasText: rarity });
}
get BackToCollectionButton(): Locator{
    return this.page.getByRole('link', { name: '← Back to collection' });
}



}



function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
