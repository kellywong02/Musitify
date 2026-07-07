import { expect, type Locator, type Page } from '@playwright/test';

export class Musitify_Register{
    readonly page: Page;
  readonly RegisterPage_url = '/register.html';
  readonly titleRegex = 'Musitify';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.RegisterPage_url);
    const html = await this.page.content();
    expect(html).toContain(this.titleRegex);
  }

  get Username(){
    return this.page.getByRole('textbox', { name: 'Username' });
  }

  get EmailAddress(){
    return this.page.getByRole('textbox', { name: 'Email Address' });
  }

  get Password(){
    return this.page.getByRole('textbox', { name: 'Password', exact: true });
  }

  get ConfirmPassword(){
    return this.page.getByRole('textbox', { name: 'Confirm Password' });
  }

  get CreateUserButton(){
    return this.page.getByRole('button', { name: 'Create Account' });
  }

  get PasswordMinimumLengthError(){
    return this.page.getByText('Password must be at least 8 characters long');
  }

  get MemberCreatedSuccesfully(): Locator{
    return this.page.getByText('Registration successful!');
  }

  get UserExists(): Locator{
    return this.page.getByText('User already exists');
  }
}
