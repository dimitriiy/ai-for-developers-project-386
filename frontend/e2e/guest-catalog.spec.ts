import { test, expect } from '@playwright/test';
import { installApiMocks, type MockEventType } from './fixtures/api-mocks';

const catalog: MockEventType[] = [
  {
    id: 'et-15',
    name: 'Короткий чат',
    description: 'Быстрый разговор по уточнению вопроса',
    duration: 15,
  },
  {
    id: 'et-30',
    name: 'Стандартная встреча',
    description: 'Обсуждение задачи или ревью кода',
    duration: 30,
  },
  {
    id: 'et-60',
    name: 'Глубокая сессия',
    description: 'Долгий разбор архитектуры',
    duration: 60,
  },
];

test.describe('Гость: каталог типов встреч', () => {
  test('видит карточки с названием, описанием и длительностью', async ({ page }) => {
    await installApiMocks(page, { eventTypes: catalog });

    await page.goto('/booking');

    await expect(page.getByRole('heading', { name: 'Выберите тип события' })).toBeVisible();

    for (const et of catalog) {
      await expect(page.getByText(et.name, { exact: true })).toBeVisible();
      await expect(page.getByText(et.description, { exact: true })).toBeVisible();
      await expect(page.getByText(`${et.duration} мин`, { exact: false })).toBeVisible();
    }
  });

  test('пустой каталог отображает соответствующее сообщение', async ({ page }) => {
    await installApiMocks(page, { eventTypes: [] });

    await page.goto('/booking');
    await expect(page.getByText('Пока нет доступных типов встреч.')).toBeVisible();
  });

  test('клик по карточке открывает страницу слотов выбранного типа', async ({ page }) => {
    await installApiMocks(page, {
      eventTypes: catalog,
      slotsByEventType: { 'et-30': [] },
    });

    await page.goto('/booking');
    await page.getByText('Стандартная встреча', { exact: true }).click();

    await expect(page).toHaveURL(/\/booking\/et-30$/);
    await expect(page.getByRole('heading', { name: 'Стандартная встреча' })).toBeVisible();
    await expect(page.getByText('Обсуждение задачи или ревью кода', { exact: false })).toBeVisible();
  });
});
