import { test as base, expect } from '@playwright/test';
import { Musitify_AddMusic } from '../pageObjects/Add Music';
import { Musitify_Login } from '../pageObjects/Musitify-Login';
import { Musitify_Register } from '../pageObjects/Musitify-Register';

type PageFixtures = {
  addMusicPage: Musitify_AddMusic;
  loginPage: Musitify_Login;
  registerPage: Musitify_Register;
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
});

export { expect };
