import { expect, type Locator, type Page } from '@playwright/test';
export class Musitify_Playlist{
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

  
  AddToPlaylist(songTitle: string): Locator{
      return this.songCardByTitle(songTitle).getByRole('button', { name: 'Add to Playlist' });
  }

  ExistingPlaylist(playListName:string): Locator{
    return this.page.locator('#playlistModalList', {
        has: this.page.locator('span', { hasText: new RegExp(escapeRegExp(playListName), 'i') })
      });
  }

  get ClosePlaylistPopUp(): Locator{
      return this.page.getByRole('button', { name: 'Close playlist popup' });
  }

  SongInPlaylist(songTitle:string): Locator{
    return this.page.locator('#playlistSongList',{ hasText: new RegExp(escapeRegExp(songTitle), 'i') });
  }

  RemoveSongFromPlaylist(songTitle:string): Locator{
    return this.SongInPlaylist(songTitle).getByRole('button', { name: 'Remove', exact: true });
  }
}



function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
