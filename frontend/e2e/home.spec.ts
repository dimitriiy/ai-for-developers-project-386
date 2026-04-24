import { test, expect } from '@playwright/test';

test.describe('Главная страница', () => {
  test('отображает hero-секцию с заголовком, описанием и кнопкой', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('БЫСТРАЯ ЗАПИСЬ НА ЗВОНОК')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible();

    await expect(
      page.getByText('Забронируйте встречу за минуту: выберите тип события и удобное время.'),
    ).toBeVisible();

    const ctaButton = page.getByRole('main').getByRole('link', { name: 'Записаться' });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute('href', '/booking');
  });

  test('отображает карточку возможностей', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Возможности' })).toBeVisible();

    await expect(
      page.getByText('Выбор типа события и удобного времени для встречи.'),
    ).toBeVisible();
    await expect(
      page.getByText('Быстрое бронирование с подтверждением и дополнительными заметками.'),
    ).toBeVisible();
    await expect(
      page.getByText('Управление типами встреч и просмотр предстоящих записей в админке.'),
    ).toBeVisible();
  });

  test('кнопка "Записаться" ведёт на каталог', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('main').getByRole('link', { name: 'Записаться' }).click();

    await expect(page).toHaveURL(/\/booking$/);
  });
});
