import { expect, type Locator, type Page } from '@playwright/test';

export class Musitify_Favourites {
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

  songCardByTitle(songTitle: string): Locator {
    return this.page.locator('.song-card', {
      has: this.page.locator('.song-title', { hasText: new RegExp(escapeRegExp(songTitle), 'i') })
    });
  }

  favouriteSongCardByTitle(songTitle: string): Locator {
    return this.page.locator('#favoriteSongList .song-card', {
      has: this.page.locator('.song-title', { hasText: new RegExp(escapeRegExp(songTitle), 'i') })
    });
  }

  AddToFavouriteButton(songTitle: string): Locator {
    return this.songCardByTitle(songTitle).getByRole('button', { name: 'Add to favorites' });
  }

  RemoveFromFavourite(songTitle: string): Locator{
    return this.songCardByTitle(songTitle).getByRole('button', { name: 'Remove from favorites' });
  }

  RemoveFromFavouriteList(songTitle: string): Locator {
    return this.favouriteSongCardByTitle(songTitle).getByRole('button', { name: 'Remove from favorites' });
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

  get LogoutButton(): Locator {
    return this.page.getByRole('button', { name: 'Logout' });
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
