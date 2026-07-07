import { expect, type Locator, type Page } from '@playwright/test';

export class Musitify_RemoveMusic{
  readonly page: Page;
  readonly LoginPage_url = '/login.html';
  readonly MainPage_url = '/home.html#home';
  readonly titleRegex = 'Musitify';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.MainPage_url);
    const html = await this.page.content();
    expect(html).toContain(this.titleRegex);
  }

  async waitForSongsLoaded(): Promise<void> {
    await expect(this.page.locator('#songList')).toBeAttached();
    const songTitles = await this.page.evaluate(async () => {
      const response = await fetch('/songs');
      if (!response.ok) {
        throw new Error(`/songs failed with status ${response.status}`);
      }

      const songs = await response.json();
      if (!Array.isArray(songs)) {
        throw new Error('/songs did not return an array');
      }

      return songs
        .map((song: { title?: unknown }) => String(song.title || '').trim())
        .filter(Boolean);
    });

    expect(songTitles.length, 'Expected /songs to return at least one song').toBeGreaterThan(0);
    await expect(this.page.locator('#songList .song-card')).toHaveCount(songTitles.length, {
      timeout: 60000
    });

    for (const title of songTitles) {
      await expect(this.songCardByTitle(title)).toBeVisible();
    }

    await this.page.waitForFunction((expectedImageCount) => {
      const images = Array.from(document.querySelectorAll('#songList .song-card img')) as HTMLImageElement[];
      return images.length === expectedImageCount &&
        images.every(image => image.complete && image.naturalWidth > 0);
    }, songTitles.length, { timeout: 60000 });
  }

  async waitForSongCard(songTitle: string): Promise<void> {
    await this.waitForSongsLoaded();
    await expect(this.songCardByTitle(songTitle)).toBeVisible({
      timeout: 60000
    });
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
