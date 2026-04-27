import { test, expect } from '@playwright/test';
import {
  buildSlotsForDate,
  installApiMocks,
  type MockEventType,
} from './fixtures/api-mocks';

const eventType: MockEventType = {
  id: 'et-30',
  name: 'Стандартная встреча',
  description: 'Обсуждение задачи или ревью кода',
  duration: 30,
};

/**
 * Format an ISO datetime to the same `HH:mm` string the UI renders via
 * `toLocaleTimeString('ru-RU', ...)`. Tests run with `timezoneId: 'UTC'`
 * (see playwright.config.ts), so we read the UTC hours/minutes directly.
 */
const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(
    d.getUTCMinutes(),
  ).padStart(2, '0')}`;
};

test.describe('Гость: бронирование слота', () => {
  test('видит свободные и занятые слоты, занятые недоступны для выбора', async ({
    page,
  }) => {
    const today = new Date();
    const slots = [
      ...buildSlotsForDate(today, [10, 11], 'free'),
      ...buildSlotsForDate(today, [12], 'busy'),
    ];

    await installApiMocks(page, {
      eventTypes: [eventType],
      slotsByEventType: { [eventType.id]: slots },
    });

    await page.goto(`/booking/${eventType.id}`);

    // Заголовок и время одного из свободных слотов
    await expect(page.getByRole('heading', { name: eventType.name })).toBeVisible();
    await expect(
      page.getByText(`${fmtTime(slots[0].startTime)} - ${fmtTime(slots[0].endTime)}`),
    ).toBeVisible();

    // Свободные → есть статус «Свободно», занятые → «Занято»
    await expect(page.getByText('Свободно').first()).toBeVisible();
    await expect(page.getByText('Занято').first()).toBeVisible();

    // Клик по занятому слоту НЕ открывает модалку
    const busySlot = slots[2];
    await page
      .getByText(`${fmtTime(busySlot.startTime)} - ${fmtTime(busySlot.endTime)}`)
      .click();
    await expect(
      page.getByRole('dialog', { name: 'Подтверждение записи' }),
    ).toBeHidden();
  });

  test('создаёт бронирование на свободный слот', async ({ page }) => {
    const today = new Date();
    const slots = buildSlotsForDate(today, [10, 11], 'free');
    const targetSlot = slots[0];

    const state = await installApiMocks(page, {
      eventTypes: [eventType],
      slotsByEventType: { [eventType.id]: slots },
    });

    await page.goto(`/booking/${eventType.id}`);

    // Выбрать свободный слот и нажать «Продолжить»
    await page
      .getByText(`${fmtTime(targetSlot.startTime)} - ${fmtTime(targetSlot.endTime)}`)
      .click();
    await page.getByRole('button', { name: 'Продолжить' }).click();

    const dialog = page.getByRole('dialog', { name: 'Подтверждение записи' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(eventType.name)).toBeVisible();

    await dialog.getByLabel('Ваше имя').fill('Иван Иванов');
    await dialog.getByLabel('Email').fill('ivan@example.com');
    await dialog.getByRole('button', { name: 'Записаться' }).click();

    // Сервер получил корректный payload
    await expect.poll(() => state.lastBookingPayload).toEqual({
      eventTypeId: eventType.id,
      guestName: 'Иван Иванов',
      guestEmail: 'ivan@example.com',
      startTime: targetSlot.startTime,
    });

    // Уведомление об успехе
    await expect(page.getByText('Запись создана')).toBeVisible();

    // Бронирование сохранено в стейте мока
    expect(state.bookings).toHaveLength(1);
    expect(state.bookings[0].guestEmail).toBe('ivan@example.com');
  });

  test('правило занятости: нельзя забронировать уже занятый слот (409)', async ({
    page,
  }) => {
    const today = new Date();
    const slots = buildSlotsForDate(today, [10], 'free');
    const targetSlot = slots[0];

    const state = await installApiMocks(page, {
      eventTypes: [eventType],
      slotsByEventType: { [eventType.id]: slots },
      forceBookingConflict: true,
    });

    await page.goto(`/booking/${eventType.id}`);

    await page
      .getByText(`${fmtTime(targetSlot.startTime)} - ${fmtTime(targetSlot.endTime)}`)
      .click();
    await page.getByRole('button', { name: 'Продолжить' }).click();

    const dialog = page.getByRole('dialog', { name: 'Подтверждение записи' });
    await dialog.getByLabel('Ваше имя').fill('Поздний Гость');
    await dialog.getByLabel('Email').fill('late@example.com');
    await dialog.getByRole('button', { name: 'Записаться' }).click();

    // Появляется уведомление об ошибке
    await expect(page.getByText('Ошибка')).toBeVisible();
    await expect(page.getByText(/already booked|already taken/i)).toBeVisible();

    // Запрос на сервер был, но запись не создалась
    expect(state.lastBookingPayload).toMatchObject({
      eventTypeId: eventType.id,
      guestName: 'Поздний Гость',
    });
    expect(state.bookings).toHaveLength(0);
  });

  test('правило занятости (между разными типами): второе POST на тот же startTime получает 409', async ({
    page,
  }) => {
    const today = new Date();
    const sharedStart = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        10,
        0,
        0,
      ),
    ).toISOString();

    const eventTypeA: MockEventType = {
      id: 'et-a',
      name: 'Тип A',
      description: 'Описание A',
      duration: 30,
    };
    const eventTypeB: MockEventType = {
      id: 'et-b',
      name: 'Тип B',
      description: 'Описание B',
      duration: 30,
    };

    const slotsA = buildSlotsForDate(today, [10], 'free');
    const slotsB = buildSlotsForDate(today, [10], 'free');

    const state = await installApiMocks(page, {
      eventTypes: [eventTypeA, eventTypeB],
      slotsByEventType: {
        [eventTypeA.id]: slotsA,
        [eventTypeB.id]: slotsB,
      },
    });

    // Гость #1 бронирует тип A на 10:00
    await page.goto(`/booking/${eventTypeA.id}`);
    await page
      .getByText(`${fmtTime(slotsA[0].startTime)} - ${fmtTime(slotsA[0].endTime)}`)
      .click();
    await page.getByRole('button', { name: 'Продолжить' }).click();
    let dialog = page.getByRole('dialog', { name: 'Подтверждение записи' });
    await dialog.getByLabel('Ваше имя').fill('Первый');
    await dialog.getByLabel('Email').fill('first@example.com');
    await dialog.getByRole('button', { name: 'Записаться' }).click();
    await expect(page.getByText('Запись создана')).toBeVisible();
    expect(state.bookings).toHaveLength(1);

    // Гость #2 пытается на ТО ЖЕ время, но через тип B
    await page.goto(`/booking/${eventTypeB.id}`);
    expect(slotsA[0].startTime).toBe(sharedStart); // sanity
    await page
      .getByText(`${fmtTime(slotsB[0].startTime)} - ${fmtTime(slotsB[0].endTime)}`)
      .click();
    await page.getByRole('button', { name: 'Продолжить' }).click();
    dialog = page.getByRole('dialog', { name: 'Подтверждение записи' });
    await dialog.getByLabel('Ваше имя').fill('Второй');
    await dialog.getByLabel('Email').fill('second@example.com');
    await dialog.getByRole('button', { name: 'Записаться' }).click();

    await expect(page.getByText('Ошибка')).toBeVisible();
    expect(state.bookings).toHaveLength(1); // вторая запись не создалась
  });

  test('окно записи 14 дней: даты вне окна недоступны для выбора', async ({ page }) => {
    const today = new Date();
    const slots = buildSlotsForDate(today, [10, 11], 'free');

    await installApiMocks(page, {
      eventTypes: [eventType],
      slotsByEventType: { [eventType.id]: slots },
    });

    await page.goto(`/booking/${eventType.id}`);

    // Запоминаем время первого слота за сегодня
    const firstSlotTime = `${fmtTime(slots[0].startTime)} - ${fmtTime(slots[0].endTime)}`;
    await expect(page.getByText(firstSlotTime)).toBeVisible();

    // Переходим на следующий месяц — любой день там заведомо вне окна 14 дней
    const calendarNavButtons = page
      .getByRole('button')
      .filter({ has: page.locator('svg') });
    await calendarNavButtons.nth(1).click();

    // Пытаемся выбрать 10-е число следующего месяца
    await page.getByText('10', { exact: true }).first().click();

    // Дата не сменилась — слот за сегодня всё ещё на экране
    await expect(page.getByText(firstSlotTime)).toBeVisible();
    await expect(
      page.getByText('Нет доступных слотов на выбранную дату'),
    ).toBeHidden();
  });

  test('валидация формы бронирования: пустые поля и невалидный email', async ({ page }) => {
    const today = new Date();
    const slots = buildSlotsForDate(today, [10], 'free');

    await installApiMocks(page, {
      eventTypes: [eventType],
      slotsByEventType: { [eventType.id]: slots },
    });

    await page.goto(`/booking/${eventType.id}`);

    await page
      .getByText(`${fmtTime(slots[0].startTime)} - ${fmtTime(slots[0].endTime)}`)
      .click();
    await page.getByRole('button', { name: 'Продолжить' }).click();

    const dialog = page.getByRole('dialog', { name: 'Подтверждение записи' });
    await expect(dialog).toBeVisible();

    // Пытаемся отправить пустую форму — кнопка должна быть в форме и
    // валидация должна сработать (проверяем через невозможность отправки
    // без заполненных полей).
    await dialog.getByLabel('Ваше имя').fill('');
    await dialog.getByLabel('Email').fill('');
    await dialog.getByRole('button', { name: 'Записаться' }).click();

    // Проверяем, что форма не отправилась — диалог всё ещё открыт,
    // а поля остаются пустыми.
    await expect(dialog).toBeVisible();

    // Вводим невалидный email и проверяем, что запись не создаётся
    await dialog.getByLabel('Ваше имя').fill('Иван');
    await dialog.getByLabel('Email').fill('not-an-email');
    await dialog.getByRole('button', { name: 'Записаться' }).click();

    // Форма не отправилась — диалог остался открытым
    await expect(dialog).toBeVisible();
  });
});
