import { expect, type Locator, type Page } from '@playwright/test';


export class Musitify_AddMusic{
  readonly page: Page;
  readonly LoginPage_url = 'http://localhost:3000/login.html';
  readonly MainPage_url = 'http://localhost:3000/home.html#home';
  readonly titleRegex = 'Musitify';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.LoginPage_url);
    const html = await this.page.content();
    expect(html).toContain(this.titleRegex);
  }

  async login(email: string, password: string) {
    await this.page.goto(this.LoginPage_url);
    await this.page.getByRole('textbox', { name: 'Email Address' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  get SongTitle(): Locator{
    return this.page.getByRole('textbox', { name: 'Song title' });
  }

  get SongArtist(): Locator{
    return this.page.getByRole('textbox', { name: 'Artist', exact: true });
  }

  get SongAlbum():Locator{
    return this.page.getByRole('textbox', { name: 'Album' });
  }

  get SongDuration(): Locator{
    return this.page.getByRole('textbox', { name: 'Duration e.g. 3:' });
  }

  get SongCoverImageURL(): Locator{
    return this.page.getByRole('textbox', { name: 'Cover image URL' });
  }

  get ChooseSongButton(): Locator{
    return this.page.getByRole('button', { name: 'Choose File' });
  }

get UploadSongButton (): Locator{
    return this.page.getByRole('button', { name: 'Upload Song' });
}

get UploadSongSuccessfullyToast (): Locator{
  return this.page.getByText('Song uploaded successfully.');
}


songCardByTitle(songTitle: string): Locator{
  return this.page.locator('.song-card', {
    has: this.page.locator('.song-title', { hasText: new RegExp(escapeRegExp(songTitle), 'i') })
  });
}

songCardPlayButton(songTitle: string): Locator{
  return this.songCardByTitle(songTitle).getByRole('button', { name: 'Play' });
}

songCardRemoveButton(songTitle: string): Locator{
  return this.songCardByTitle(songTitle).getByRole('button', { name: 'Remove Song' });
}


}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
