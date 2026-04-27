import { test, expect } from '@playwright/test';
import { installApiMocks, type MockBooking, type MockEventType } from './fixtures/api-mocks';

const seedEventTypes: MockEventType[] = [
  {
    id: 'et-intro',
    name: 'Вводный звонок',
    description: 'Знакомство и обсуждение задачи',
    duration: 30,
  },
];

const seedBookings: MockBooking[] = [
  {
    id: 'b-1',
    eventTypeId: 'et-intro',
    guestName: 'Иван Петров',
    guestEmail: 'ivan@example.com',
    startTime: '2030-05-12T10:00:00.000Z',
    endTime: '2030-05-12T10:30:00.000Z',
  },
  {
    id: 'b-2',
    eventTypeId: 'et-intro',
    guestName: 'Мария Сидорова',
    guestEmail: 'maria@example.com',
    startTime: '2030-05-13T14:00:00.000Z',
    endTime: '2030-05-13T14:30:00.000Z',
  },
];

test.describe('Владелец календаря (админка)', () => {
  test('видит список всех предстоящих бронирований одним списком', async ({ page }) => {
    await installApiMocks(page, {
      eventTypes: seedEventTypes,
      bookings: seedBookings,
    });

    await page.goto('/admin');

    await expect(page.getByRole('heading', { name: 'Админ-панель' })).toBeVisible();

    // Переключаемся на вкладку «Записи»
    await page.getByRole('tab', { name: 'Записи' }).click();

    // Каждое бронирование отображается в общем списке вне зависимости
    // от типа события.
    const rows = page.getByRole('row');
    await expect(rows).toHaveCount(seedBookings.length + 1); // +1 строка заголовка

    await expect(page.getByText('Иван Петров')).toBeVisible();
    await expect(page.getByText('ivan@example.com')).toBeVisible();
    await expect(page.getByText('Мария Сидорова')).toBeVisible();
    await expect(page.getByText('maria@example.com')).toBeVisible();
  });

  test('видит сообщение, когда записей ещё нет', async ({ page }) => {
    await installApiMocks(page, {
      eventTypes: seedEventTypes,
      bookings: [],
    });

    await page.goto('/admin');
    await page.getByRole('tab', { name: 'Записи' }).click();

    await expect(page.getByText('Пока нет записей.')).toBeVisible();
  });

  test('создаёт новый тип события (id, название, описание, длительность)', async ({
    page,
  }) => {
    const state = await installApiMocks(page, {
      eventTypes: [],
      bookings: [],
    });

    await page.goto('/admin');
    await expect(page.getByRole('tab', { name: 'Типы встреч' })).toHaveAttribute(
      'data-active',
      'true',
    );

    // На стартовом экране пусто
    await expect(page.getByText('Нет типов встреч. Добавьте первый.')).toBeVisible();

    await page.getByRole('button', { name: 'Добавить' }).click();

    const dialog = page.getByRole('dialog', { name: 'Создать тип события' });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Название').fill('Демо продукта');
    await dialog.getByLabel('Описание').fill('Полная демонстрация возможностей');
    await dialog.getByLabel('Длительность (минут)').fill('45');

    await dialog.getByRole('button', { name: 'Создать' }).click();

    // POST /api/admin/event-types отправлен с правильными полями
    await expect.poll(() => state.lastEventTypeCreatePayload).toEqual({
      name: 'Демо продукта',
      description: 'Полная демонстрация возможностей',
      duration: 45,
    });

    // Новый тип появился в таблице (mock присваивает id автоматически)
    await expect(page.getByText('Демо продукта')).toBeVisible();
    await expect(
      page.locator('table tbody').getByText('Полная демонстрация возможностей'),
    ).toBeVisible();
    await expect(page.getByText('45 мин')).toBeVisible();

    // У созданного типа есть непустой id (требование: владелец задаёт id типа)
    expect(state.eventTypes).toHaveLength(1);
    expect(state.eventTypes[0].id).toBeTruthy();
  });

  test('редактирует существующий тип события', async ({ page }) => {
    const state = await installApiMocks(page, {
      eventTypes: seedEventTypes,
      bookings: [],
    });

    await page.goto('/admin');
    await expect(page.getByText('Вводный звонок')).toBeVisible();

    await page.getByRole('button', { name: 'Редактировать' }).click();

    const dialog = page.getByRole('dialog', { name: 'Редактировать тип события' });
    await expect(dialog).toBeVisible();

    // Меняем название и длительность
    await dialog.getByLabel('Название').fill('Вводный звонок (обновлённый)');
    await dialog.getByLabel('Длительность (минут)').fill('60');

    await dialog.getByRole('button', { name: 'Сохранить' }).click();

    // В стейте мока тип обновлён
    await expect.poll(() => state.eventTypes[0]).toMatchObject({
      name: 'Вводный звонок (обновлённый)',
      duration: 60,
    });

    await expect(page.getByText('Вводный звонок (обновлённый)')).toBeVisible();
    await expect(page.getByText('60 мин')).toBeVisible();
  });

  test('удаляет тип события с подтверждением', async ({ page }) => {
    const state = await installApiMocks(page, {
      eventTypes: seedEventTypes,
      bookings: [],
    });

    await page.goto('/admin');
    await expect(page.getByText('Вводный звонок')).toBeVisible();

    await page.getByRole('button', { name: 'Удалить' }).click();

    // Диалог подтверждения
    const confirmDialog = page.getByRole('dialog', { name: 'Удалить тип события?' });
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog.getByText('Вводный звонок')).toBeVisible();

    await confirmDialog.getByRole('button', { name: 'Удалить' }).click();

    // Тип удалён из стейта
    expect(state.eventTypes).toHaveLength(0);
    await expect(page.getByText('Нет типов встреч. Добавьте первый.')).toBeVisible();
  });
});
