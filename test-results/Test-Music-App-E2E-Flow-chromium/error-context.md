# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Test.spec.ts >> Music App E2E Flow
- Location: public\tests\Test.spec.ts:3:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=LOVE DIVE')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=LOVE DIVE')

```

```yaml
- text: 🎵 My Music Library
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('Music App E2E Flow', async ({ page }) => {
  4  | 
  5  |   await page.goto('http://localhost:3000/login.html');
  6  | 
  7  |   await page.fill('#email', 'admin@admin.sg');
  8  |   await page.fill('#password', 'Admin@123');
  9  |   await page.click('text=Login');
  10 | 
  11 | 
  12 | 
  13 |   await expect(page).toHaveURL(/music.html/);
  14 | 
> 15 |   await expect(page.locator('text=LOVE DIVE')).toBeVisible();
     |                                                ^ Error: expect(locator).toBeVisible() failed
  16 | }); 
```