import { test as base, expect } from '@playwright/test';
import { Musitify_AddMusic } from '../pageObjects/Add Music';
import { Musitify_Login } from '../pageObjects/Musitify-Login';
import { Musitify_Register } from '../pageObjects/Musitify-Register';
import { Musitify_RemoveMusic } from '../pageObjects/RemoveSong';
import { Musitify_Playback } from '../pageObjects/Playback';

type PageFixtures = {
  addMusicPage: Musitify_AddMusic;
  loginPage: Musitify_Login;
  registerPage: Musitify_Register;
  removeSongPage: Musitify_RemoveMusic
  PlayBackPage: Musitify_Playback

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
});

export { expect };
