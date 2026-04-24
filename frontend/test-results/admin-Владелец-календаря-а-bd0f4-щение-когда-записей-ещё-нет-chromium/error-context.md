# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Владелец календаря (админка) >> видит сообщение, когда записей ещё нет
- Location: e2e/admin.spec.ts:57:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('tab', { name: 'Записи' })

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { installApiMocks, type MockBooking, type MockEventType } from './fixtures/api-mocks';
  3   | 
  4   | const seedEventTypes: MockEventType[] = [
  5   |   {
  6   |     id: 'et-intro',
  7   |     name: 'Вводный звонок',
  8   |     description: 'Знакомство и обсуждение задачи',
  9   |     duration: 30,
  10  |   },
  11  | ];
  12  | 
  13  | const seedBookings: MockBooking[] = [
  14  |   {
  15  |     id: 'b-1',
  16  |     eventTypeId: 'et-intro',
  17  |     guestName: 'Иван Петров',
  18  |     guestEmail: 'ivan@example.com',
  19  |     startTime: '2030-05-12T10:00:00.000Z',
  20  |     endTime: '2030-05-12T10:30:00.000Z',
  21  |   },
  22  |   {
  23  |     id: 'b-2',
  24  |     eventTypeId: 'et-intro',
  25  |     guestName: 'Мария Сидорова',
  26  |     guestEmail: 'maria@example.com',
  27  |     startTime: '2030-05-13T14:00:00.000Z',
  28  |     endTime: '2030-05-13T14:30:00.000Z',
  29  |   },
  30  | ];
  31  | 
  32  | test.describe('Владелец календаря (админка)', () => {
  33  |   test('видит список всех предстоящих бронирований одним списком', async ({ page }) => {
  34  |     await installApiMocks(page, {
  35  |       eventTypes: seedEventTypes,
  36  |       bookings: seedBookings,
  37  |     });
  38  | 
  39  |     await page.goto('/admin');
  40  | 
  41  |     await expect(page.getByRole('heading', { name: 'Админ-панель' })).toBeVisible();
  42  | 
  43  |     // Переключаемся на вкладку «Записи»
  44  |     await page.getByRole('tab', { name: 'Записи' }).click();
  45  | 
  46  |     // Каждое бронирование отображается в общем списке вне зависимости
  47  |     // от типа события.
  48  |     const rows = page.getByRole('row');
  49  |     await expect(rows).toHaveCount(seedBookings.length + 1); // +1 строка заголовка
  50  | 
  51  |     await expect(page.getByText('Иван Петров')).toBeVisible();
  52  |     await expect(page.getByText('ivan@example.com')).toBeVisible();
  53  |     await expect(page.getByText('Мария Сидорова')).toBeVisible();
  54  |     await expect(page.getByText('maria@example.com')).toBeVisible();
  55  |   });
  56  | 
  57  |   test('видит сообщение, когда записей ещё нет', async ({ page }) => {
  58  |     await installApiMocks(page, {
  59  |       eventTypes: seedEventTypes,
  60  |       bookings: [],
  61  |     });
  62  | 
  63  |     await page.goto('/admin');
> 64  |     await page.getByRole('tab', { name: 'Записи' }).click();
      |                                                     ^ Error: locator.click: Test timeout of 30000ms exceeded.
  65  | 
  66  |     await expect(page.getByText('Пока нет записей.')).toBeVisible();
  67  |   });
  68  | 
  69  |   test('создаёт новый тип события (id, название, описание, длительность)', async ({
  70  |     page,
  71  |   }) => {
  72  |     const state = await installApiMocks(page, {
  73  |       eventTypes: [],
  74  |       bookings: [],
  75  |     });
  76  | 
  77  |     await page.goto('/admin');
  78  |     await expect(page.getByRole('tab', { name: 'Типы встреч' })).toHaveAttribute(
  79  |       'data-active',
  80  |       'true',
  81  |     );
  82  | 
  83  |     // На стартовом экране пусто
  84  |     await expect(page.getByText('Нет типов встреч. Добавьте первый.')).toBeVisible();
  85  | 
  86  |     await page.getByRole('button', { name: 'Добавить' }).click();
  87  | 
  88  |     const dialog = page.getByRole('dialog', { name: 'Создать тип события' });
  89  |     await expect(dialog).toBeVisible();
  90  | 
  91  |     await dialog.getByLabel('Название').fill('Демо продукта');
  92  |     await dialog.getByLabel('Описание').fill('Полная демонстрация возможностей');
  93  |     await dialog.getByLabel('Длительность (минут)').fill('45');
  94  | 
  95  |     await dialog.getByRole('button', { name: 'Создать' }).click();
  96  | 
  97  |     // POST /api/admin/event-types отправлен с правильными полями
  98  |     await expect.poll(() => state.lastEventTypeCreatePayload).toEqual({
  99  |       name: 'Демо продукта',
  100 |       description: 'Полная демонстрация возможностей',
  101 |       duration: 45,
  102 |     });
  103 | 
  104 |     // Новый тип появился в таблице (mock присваивает id автоматически)
  105 |     await expect(page.getByText('Демо продукта')).toBeVisible();
  106 |     await expect(page.getByText('Полная демонстрация возможностей')).toBeVisible();
  107 |     await expect(page.getByText('45 мин')).toBeVisible();
  108 | 
  109 |     // У созданного типа есть непустой id (требование: владелец задаёт id типа)
  110 |     expect(state.eventTypes).toHaveLength(1);
  111 |     expect(state.eventTypes[0].id).toBeTruthy();
  112 |   });
  113 | });
  114 | 
```