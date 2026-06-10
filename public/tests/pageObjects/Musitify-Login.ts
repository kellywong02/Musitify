import { expect, type Locator, type Page } from '@playwright/test';

export class Musitify_Login{
    readonly page: Page;
  readonly LoginPage_url = 'http://localhost:3000/login.html';
  readonly titleRegex = 'Musitify';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.LoginPage_url);
    const html = await this.page.content();
    expect(html).toContain(this.titleRegex);
  }

  get EmailAddress(){
    return this.page.getByRole('textbox', { name: 'Email Address' });
  }

  get Password(){
    return this.page.getByRole('textbox', { name: 'Password' });
  }
  get LoginButton(){
    return this.page.getByRole('button', { name: 'Login' });
  }

  get RegisterButton(){
    return this.page.getByRole('link', { name: 'Register' });
  }

  get InvalidEmailOrPassword(){
    return this.page.getByText('Invalid email or password');
  }

  get MissingEmailOrPassword(){
    return this.page.getByText('Please enter email or password');
  }

  get AccountNotFound(){
    return this.page.getByText('Account not found for this email');
  }

  get PasswordMinimumLengthError(){
    return this.page.getByText('Password must be at least 8 characters long');
  }

  get RegisterPrompt(){
    return this.page.getByText('Account not found for this');
  }

  get ToRegister(){
    return this.page.getByRole('link', { name: 'Register' });
  }

  get RegisterPage(){
    return this.page.getByText('Create your account and start');
  }

  get PasswordMinimumCharacters(){
    return this.page.getByText('Password must be at least 8');
  }
}
