import { expect, type Locator, type Page } from '@playwright/test';
export class Musitify_Chatbot{
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

get AIButton(): Locator{
  return this.page.getByRole('button', { name: 'AI', exact: true });
}

get AIChatbotPanel(): Locator{
  return this.page.locator('#chatbotPanel');
}

get AIChatBotCloseButton(): Locator{
    return this.page.getByRole('button', { name: '×' });
}

get AIChatBotTextBox(): Locator{
    return this.page.getByRole('textbox', { name: 'Ask about songs, playlists,' });
}

get AIChatBotSendButton(): Locator{
    return this.page.getByRole('button', { name: 'Send' });
}

get AIChatBotMessageReply(): Locator{
    return this.page.locator('.chatbot-message.bot');
}


}



function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
