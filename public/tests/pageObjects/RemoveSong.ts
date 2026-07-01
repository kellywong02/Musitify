import { expect, type Locator, type Page } from '@playwright/test';

export class Musitify_RemoveMusic{
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

  AddToPlaylist(songTitle: string): Locator{
    return this.songCardByTitle(songTitle).getByRole('button', { name: 'Add to Playlist' });
  }

  RemoveSong(songTitle: string): Locator{
    return this.songCardByTitle(songTitle).getByRole('button', { name: 'Remove Song' });
  }

}

function escapeRegExp(songTitle: string): string {
  return songTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
