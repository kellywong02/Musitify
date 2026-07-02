import { expect, type Locator, type Page } from '@playwright/test';
export class Musitify_Playlist{
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

  get NewPlayListName(): Locator{
    return this.page.getByRole('textbox', { name: 'New playlist name' });
  }

  get CreatePlaylistButton(): Locator{
    return this.page.getByRole('button', { name: 'Create Playlist' });
  }

  get PlaylistCreateMessage(): Locator{
    return this.page.locator('#playlistCreateMessage');
  }

  playlistByName(name: string): Locator {
    return this.page.locator('#playlistList .playlist-list-item', {
      has: this.page.locator('span', {
        hasText: new RegExp(`^${escapeRegExp(name)}$`, 'i')
      })
    });
  }

  get DeletePlaylist(): Locator{
    return this.page.getByRole('button', { name: 'Delete Playlist' });
  }

  get PlaylistItems(): Locator {
  return this.page.locator('#playlistList .playlist-list-item');
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
