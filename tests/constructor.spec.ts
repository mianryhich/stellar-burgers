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

const setupAuthTokens = async (context: BrowserContext, page: Page) => {
  await context.addCookies([
    {
      name: 'accessToken',
      value: 'Bearer test-token',
      domain: 'localhost',
      path: '/'
    }
  ]);
  await page.addInitScript(() => {
    localStorage.setItem('refreshToken', 'test-refresh-token');
  });
};

const clearAuthTokens = async (context: BrowserContext, page: Page) => {
  await context.clearCookies();
  await page.evaluate(() => localStorage.removeItem('refreshToken'));
};

const setupDirectAuthMocks = async (page: Page) => {
  await page.route('**/api/auth/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: {
          email: 'test@test.ru',
          name: 'Тест'
        }
      })
    });
  });

  await page.route('**/api/orders', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          name: 'Тестовый бургер',
          order: {
            _id: '1',
            status: 'done',
            name: 'Тестовый бургер',
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01',
            number: 107375,
            ingredients: []
          }
        })
      });
      return;
    }
    await route.fallback();
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

      const bunCard = page.locator('li').filter({ hasText: BUN_NAME });
      await bunCard.getByRole('button', { name: 'Добавить' }).click();

      await expect(page.getByText(`${BUN_NAME} (верх)`)).toBeVisible();
      await expect(page.getByText(`${BUN_NAME} (низ)`)).toBeVisible();

      const mainCard = page.locator('li').filter({ hasText: MAIN_NAME });
      await mainCard.getByRole('button', { name: 'Добавить' }).click();

      const constructor = page.locator('section').filter({
        has: page.getByRole('button', { name: 'Оформить заказ' })
      });
      await expect(constructor.getByText(MAIN_NAME)).toBeVisible();
    });
  });

  test.describe('Модальное окно ингредиента', () => {
    test('отображает данные выбранного ингредиента при открытии', async ({
      page
    }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await page.getByRole('link', { name: MAIN_NAME }).click();

      const modals = page.locator('#modals');
      await expect(
        modals.getByRole('heading', { name: MAIN_NAME }).first()
      ).toBeVisible();
      await expect(modals.getByText('4242')).toBeVisible();
      await expect(modals.getByText('420')).toBeVisible();
    });

    test('закрывается по клику на крестик', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await page.getByRole('link', { name: BUN_NAME }).click();

      const modals = page.locator('#modals');
      await expect(
        modals.getByRole('heading', { name: BUN_NAME }).first()
      ).toBeVisible();

      await modals.locator('button').click();

      await expect(modals).toBeEmpty();
    });

    test('закрывается по клику на оверлей', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await page.getByRole('link', { name: BUN_NAME }).click();

      const modals = page.locator('#modals');
      await expect(
        modals.getByRole('heading', { name: BUN_NAME }).first()
      ).toBeVisible();

      await page.mouse.click(10, 10);

      await expect(modals).toBeEmpty();
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

      await page.route('**/api/auth/user', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              email: 'test@test.ru',
              name: 'Тест'
            }
          })
        });
      });

      // Мокаем запрос на создание заказа
      await page.route('**/api/orders', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              name: 'Тестовый бургер',
              order: {
                _id: '1',
                status: 'done',
                name: 'Тестовый бургер',
                createdAt: '2025-01-01',
                updatedAt: '2025-01-01',
                number: 99999,
                ingredients: []
              }
            })
          });
          return;
        }
        await route.fallback();
      });

      await page.route('**/api/ingredients', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                _id: 'bun-1',
                name: 'Краторная булка N-200i',
                type: 'bun',
                proteins: 80,
                fat: 24,
                carbohydrates: 53,
                calories: 420,
                price: 1255,
                image: 'https://code.s3.yandex.net/react/code/bun-02.png',
                image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
                image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png'
              },
              {
                _id: 'main-1',
                name: 'Биокотлета из марсианской Магнолии',
                type: 'main',
                proteins: 420,
                fat: 142,
                carbohydrates: 242,
                calories: 4242,
                price: 424,
                image: 'https://code.s3.yandex.net/react/code/meat-01.png',
                image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
                image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png'
              }
            ]
          })
        });
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page.getByText('Соберите бургер')).toBeVisible();

      const bunCard = page.locator('li').filter({ hasText: 'Краторная булка N-200i' });
      await bunCard.getByRole('button', { name: 'Добавить' }).click();
      const mainCard = page.locator('li').filter({ hasText: 'Биокотлета из марсианской Магнолии' });
      await mainCard.getByRole('button', { name: 'Добавить' }).click();

      await page.getByRole('button', { name: 'Оформить заказ' }).click();

      await page.waitForSelector('.text_type_digits-large', { timeout: 20000 });

      const orderNumber = page.locator('.text_type_digits-large');
      await expect(orderNumber).toBeVisible();

      await expect(orderNumber).toHaveText('99999');
      await expect(page.getByText('идентификатор заказа')).toBeVisible();

      await page.locator('#modals button').click();

      await expect(page.getByText('Выберите начинку')).toBeVisible();
      await expect(page.getByText('Выберите булки').first()).toBeVisible();

      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());
    });
  });
});