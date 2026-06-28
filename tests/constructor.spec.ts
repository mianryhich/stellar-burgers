import { test, expect, Page, BrowserContext } from '@playwright/test';

const BUN_NAME = 'Краторная булка N-200i';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';

const setupIngredientsHar = async (page: Page) => {
  await page.routeFromHAR('tests/hars/ingredients.har', {
    url: '**/api/ingredients',
    update: false
  });
};

const setupAuthHar = async (page: Page) => {
  await page.routeFromHAR('tests/hars/auth-user.har', {
    url: '**/api/auth/user',
    update: false
  });
};

const setupOrderHar = async (page: Page) => {
  await page.routeFromHAR('tests/hars/order.har', {
    url: '**/api/orders',
    update: false
  });
};

test.describe('Страница конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    await setupIngredientsHar(page);
  });

  test.describe('Добавление ингредиентов в конструктор', () => {
    test('добавляет булку и начинку из списка в конструктор', async ({
      page
    }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page.getByText('Соберите бургер')).toBeVisible();

      const bunCard = page
        .getByTestId('ingredients-list')
        .locator('li')
        .filter({ hasText: BUN_NAME });
      await bunCard.getByRole('button', { name: 'Добавить' }).click();

      await expect(page.getByTestId('constructor-bun-top')).toBeVisible();
      await expect(page.getByTestId('constructor-bun-top')).toContainText(
        BUN_NAME
      );
      await expect(page.getByTestId('constructor-bun-bottom')).toBeVisible();
      await expect(page.getByTestId('constructor-bun-bottom')).toContainText(
        BUN_NAME
      );

      const mainCard = page
        .getByTestId('ingredients-list')
        .locator('li')
        .filter({ hasText: MAIN_NAME });
      await mainCard.getByRole('button', { name: 'Добавить' }).click();

      const constructor = page.getByTestId('constructor');
      await expect(constructor.getByText(MAIN_NAME)).toBeVisible();
    });
  });

  test.describe('Модальное окно ингредиента', () => {
    test('отображает данные выбранного ингредиента при открытии', async ({
      page
    }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const ingredient = page
        .getByTestId('ingredients-list')
        .locator('li')
        .filter({ hasText: MAIN_NAME });
      await ingredient.click();

      const modal = page.getByTestId('modal');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText(MAIN_NAME);
      await expect(modal).toContainText('4242');
      await expect(modal).toContainText('420');
    });

    test('закрывается по клику на крестик', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const ingredient = page
        .getByTestId('ingredients-list')
        .locator('li')
        .filter({ hasText: BUN_NAME });
      await ingredient.click();

      const modal = page.getByTestId('modal');
      await expect(modal).toBeVisible();

      await page.getByTestId('modal-close-btn').click();
      await expect(modal).not.toBeVisible();
    });

    test('закрывается по клику на оверлей', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const ingredient = page
        .getByTestId('ingredients-list')
        .locator('li')
        .filter({ hasText: BUN_NAME });
      await ingredient.click();

      const modal = page.getByTestId('modal');
      await expect(modal).toBeVisible();

      const overlay = page.getByTestId('modal-overlay');
      await expect(overlay).toBeVisible();

      await overlay.click({ force: true, position: { x: 5, y: 5 } });

      await expect(modal).not.toBeVisible();
    });
  });

  test.describe('Создание заказа', () => {
    test('оформляет заказ, показывает номер и очищает конструктор', async ({
      page,
      context
    }) => {
      await context.addInitScript(() => {
        localStorage.setItem('refreshToken', 'mock-refresh-token');
      });

      await context.addCookies([
        {
          name: 'accessToken',
          value: 'Bearer mock-access-token',
          url: 'http://localhost:4000'
        }
      ]);

      await setupIngredientsHar(page);
      await setupAuthHar(page);
      await setupOrderHar(page);

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page.getByText('Соберите бургер')).toBeVisible();

      const bunCard = page
        .getByTestId('ingredients-list')
        .locator('li')
        .filter({ hasText: BUN_NAME });
      await bunCard.getByRole('button', { name: 'Добавить' }).click();

      const mainCard = page
        .getByTestId('ingredients-list')
        .locator('li')
        .filter({ hasText: MAIN_NAME });
      await mainCard.getByRole('button', { name: 'Добавить' }).click();

      await page.getByTestId('create-order-btn').click();

      const modal = page.getByTestId('modal');
      await expect(modal).toBeVisible({ timeout: 20000 });

      const orderNumber = modal.locator('.text_type_digits-large');
      await expect(orderNumber).toBeVisible();
      const orderNumberText = await orderNumber.textContent();
      expect(Number(orderNumberText)).toBeGreaterThan(0);

      await page.getByTestId('modal-close-btn').click();
      await expect(modal).not.toBeVisible();

      await expect(page.getByTestId('constructor-bun-top')).not.toBeVisible();
      await expect(
        page.getByTestId('constructor-bun-bottom')
      ).not.toBeVisible();
      await expect(page.getByTestId('constructor-empty-bun')).toBeVisible();
      await expect(
        page.getByTestId('constructor-empty-ingredients')
      ).toBeVisible();

      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());
    });
  });
});
