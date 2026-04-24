# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: guest-catalog.spec.ts >> Гость: каталог типов встреч >> пустой каталог отображает соответствующее сообщение
- Location: e2e/guest-catalog.spec.ts:40:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Пока нет доступных типов встреч.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Пока нет доступных типов встреч.')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { installApiMocks, type MockEventType } from './fixtures/api-mocks';
  3  | 
  4  | const catalog: MockEventType[] = [
  5  |   {
  6  |     id: 'et-15',
  7  |     name: 'Короткий чат',
  8  |     description: 'Быстрый разговор по уточнению вопроса',
  9  |     duration: 15,
  10 |   },
  11 |   {
  12 |     id: 'et-30',
  13 |     name: 'Стандартная встреча',
  14 |     description: 'Обсуждение задачи или ревью кода',
  15 |     duration: 30,
  16 |   },
  17 |   {
  18 |     id: 'et-60',
  19 |     name: 'Глубокая сессия',
  20 |     description: 'Долгий разбор архитектуры',
  21 |     duration: 60,
  22 |   },
  23 | ];
  24 | 
  25 | test.describe('Гость: каталог типов встреч', () => {
  26 |   test('видит карточки с названием, описанием и длительностью', async ({ page }) => {
  27 |     await installApiMocks(page, { eventTypes: catalog });
  28 | 
  29 |     await page.goto('/booking');
  30 | 
  31 |     await expect(page.getByRole('heading', { name: 'Выберите тип события' })).toBeVisible();
  32 | 
  33 |     for (const et of catalog) {
  34 |       await expect(page.getByText(et.name, { exact: true })).toBeVisible();
  35 |       await expect(page.getByText(et.description, { exact: true })).toBeVisible();
  36 |       await expect(page.getByText(`${et.duration} мин`, { exact: false })).toBeVisible();
  37 |     }
  38 |   });
  39 | 
  40 |   test('пустой каталог отображает соответствующее сообщение', async ({ page }) => {
  41 |     await installApiMocks(page, { eventTypes: [] });
  42 | 
  43 |     await page.goto('/booking');
> 44 |     await expect(page.getByText('Пока нет доступных типов встреч.')).toBeVisible();
     |                                                                      ^ Error: expect(locator).toBeVisible() failed
  45 |   });
  46 | 
  47 |   test('клик по карточке открывает страницу слотов выбранного типа', async ({ page }) => {
  48 |     await installApiMocks(page, {
  49 |       eventTypes: catalog,
  50 |       slotsByEventType: { 'et-30': [] },
  51 |     });
  52 | 
  53 |     await page.goto('/booking');
  54 |     await page.getByText('Стандартная встреча', { exact: true }).click();
  55 | 
  56 |     await expect(page).toHaveURL(/\/booking\/et-30$/);
  57 |     await expect(page.getByRole('heading', { name: 'Стандартная встреча' })).toBeVisible();
  58 |     await expect(page.getByText('Обсуждение задачи или ревью кода', { exact: false })).toBeVisible();
  59 |   });
  60 | });
  61 | 
```