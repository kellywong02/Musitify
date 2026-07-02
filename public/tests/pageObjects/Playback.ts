import { expect, type Locator, type Page } from '@playwright/test';
export class Musitify_Playback{
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
  
  songCardByArtist(songArtist: string): Locator{
    return this.page.locator('.song-card', {
      has: this.page.locator('.artist', { hasText: new RegExp(escapeRegExp(songArtist), 'i') })
    });
  }
  
  songCardByDuration(songDuration: string): Locator{
    return this.page.locator('.song-card', {
      has: this.page.locator('.duration', { hasText: new RegExp(escapeRegExp(songDuration), 'i') })
    });
  }
  
  songCardPlayButton(songTitle: string): Locator{
    return this.songCardByTitle(songTitle).getByRole('button', { name: /^► Play$/ });
  }
  
  songCardRemoveButton(songTitle: string): Locator{
    return this.songCardByTitle(songTitle).getByRole('button', { name: 'Remove Song' });
  }
  
  get SongPlayerTitle():Locator{
    return this.page.locator('#songTitle');
  
  }
  
  get SongPlayerArtist():Locator{
    return this.page.locator('#songArtist');
  }
  
  get SongPlayButton():Locator{
    return this.page.locator('.play-btn');
  }
  
  get BackToHome(): Locator{
    return this.page.getByRole('link', { name: '← Back to home' });
  }

  get BottomSongPlayerTitle(): Locator{
    return this.page.locator('.now-title');
  }

  get BottomSongPlayerArtist(): Locator{
    return this.page.locator('.now-artist');
  }

  get BottomSongPlayerCover(): Locator{
    return this.page.locator('.now-cover');
  }

  get OpenSongPlayer(): Locator{
    return this.page.getByRole('button', { name: 'Open song player' });
  }

  get PlayPauseButton(): Locator{
    return this.page.locator('#playPauseBtn');
  }

  get ShuffledSongButton(): Locator{
    return this.page.getByRole('button', { name: 'Shuffle song' });
  }

  get PreviousSongButton(): Locator{
    return this.page.getByRole('button', { name: 'Previous song' });
  }

  get NextSongButton(): Locator{
    return this.page.getByRole('button', { name: 'Next song' });
  }

  get UpcomingSongTitles(): Locator {
  return this.page.locator('#upcomingList .upcoming-title');
  }

  get ProgressBar(): Locator {
  return this.page.locator('#progressBar');
  }
  
  
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}