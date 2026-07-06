import { test as base, expect } from '@playwright/test';
import { Musitify_AddMusic } from '../pageObjects/Add Music';
import { Musitify_Login } from '../pageObjects/Musitify-Login';
import { Musitify_Register } from '../pageObjects/Musitify-Register';
import { Musitify_RemoveMusic } from '../pageObjects/RemoveSong';
import { Musitify_Playback } from '../pageObjects/Playback';
import { Musitify_SongPlayer } from '../pageObjects/SongPlayer';
import { Musitify_Favourites } from '../pageObjects/Favourites';
import { Musitify_Playlist } from '../pageObjects/Playlist';
import { Musitify_Photocard } from '../pageObjects/Photocard';

type PageFixtures = {
  addMusicPage: Musitify_AddMusic;
  loginPage: Musitify_Login;
  registerPage: Musitify_Register;
  removeSongPage: Musitify_RemoveMusic;
  PlayBackPage: Musitify_Playback;
  SongPlayerPage: Musitify_SongPlayer;
  FavouritePage: Musitify_Favourites;
  PlaylistPage: Musitify_Playlist;
  PhotocardPage: Musitify_Photocard;
};

export const test = base.extend<PageFixtures>({
  addMusicPage: async ({ page }, use) => {
    await use(new Musitify_AddMusic(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new Musitify_Login(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new Musitify_Register(page));
  },

  removeSongPage: async ({ page }, use) => {
    await use(new Musitify_RemoveMusic(page));
  },

  PlayBackPage: async ({ page }, use) => {
    await use(new Musitify_Playback(page));
  },

  SongPlayerPage: async ({ page }, use) => {
    await use(new Musitify_SongPlayer(page));
  },

  FavouritePage: async ({ page }, use) => {
    await use(new Musitify_Favourites(page));
  },

  PlaylistPage: async ({ page }, use) => {
    await use(new Musitify_Playlist(page));
  },

  PhotocardPage: async ({ page }, use) => {
    await use(new Musitify_Photocard(page));
  },
});

export { expect };
