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
  get UploadSongHeader(): Locator{
    return this.page.getByRole('heading', { name: 'Upload Song' });
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

get UploadSongMessage(): Locator{
  return this.page.locator('#uploadSongMessage');
}

get UploadSongEmptyFieldsError(): Locator{
  return this.page.getByText(/Please fill in .* before uploading\./);
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





}
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
