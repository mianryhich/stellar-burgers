import ingredientsReducer, {
  fetchIngredients,
  selectIngredients,
  selectIngredientsLoading,
  selectIngredientsError,
  selectIngredientById
} from '../ingredientsSlice';
import { RootState } from '../../store';

const mockIngredients = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/react/code/bun-02.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
    __v: 0
  }
];

describe('ingredientsSlice', () => {
  const initialState = {
    items: [],
    isLoading: false,
    error: null
  };

  it('должен возвращать начальное состояние при неизвестном экшене', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  describe('fetchIngredients', () => {
    it('должен обрабатывать fetchIngredients.pending', () => {
      const action = { type: fetchIngredients.pending.type };
      const state = ingredientsReducer(initialState, action);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('должен обрабатывать fetchIngredients.fulfilled', () => {
      const action = {
        type: fetchIngredients.fulfilled.type,
        payload: mockIngredients
      };
      const state = ingredientsReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.items).toEqual(mockIngredients);
    });

    it('должен обрабатывать fetchIngredients.rejected', () => {
      const action = {
        type: fetchIngredients.rejected.type,
        payload: 'Ошибка загрузки'
      };
      const state = ingredientsReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Ошибка загрузки');
    });
  });

  describe('Селекторы', () => {
    const createTestState = (): RootState => {
      return {
        ingredients: { 
          items: mockIngredients, 
          isLoading: false, 
          error: null 
        },
        burgerConstructor: {
          bun: null,
          ingredients: []
        },
        order: { orderRequest: false, orderModalData: null, error: null, orderByNumber: null },
        feed: { orders: [], total: 0, totalToday: 0, isLoading: false, error: null },
        user: { user: null, isAuthChecked: false, isLoading: false, error: null },
        userOrders: {
          orders: [],
          isLoading: false,
          error: null,
          currentOrder: null,
          isCurrentOrderLoading: false
        },
        profileOrders: { orders: [], isLoading: false, error: null }
      };
    };

    it('selectIngredients возвращает все ингредиенты', () => {
      const state = createTestState();
      expect(selectIngredients(state)).toEqual(mockIngredients);
    });

    it('selectIngredientsLoading возвращает статус загрузки', () => {
      const state = createTestState();
      expect(selectIngredientsLoading(state)).toBe(false);
    });

    it('selectIngredientsError возвращает ошибку', () => {
      const state = createTestState();
      expect(selectIngredientsError(state)).toBe(null);
    });

    it('selectIngredientById находит ингредиент по id', () => {
      const state = createTestState();
      const selector = selectIngredientById('643d69a5c3f7b9001cfa093c');
      expect(selector(state)).toEqual(mockIngredients[0]);
    });

    it('selectIngredientById возвращает null если ингредиент не найден', () => {
      const state = createTestState();
      const selector = selectIngredientById('unknown-id');
      expect(selector(state)).toBeNull();
    });
  });
});