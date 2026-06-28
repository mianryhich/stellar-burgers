import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
  selectConstructorItems,
  selectConstructorBun,
  selectConstructorIngredients
} from '../constructorSlice';
import { TIngredient } from '@utils-types';
import { RootState } from '../../store';

const bun: TIngredient = {
  _id: 'bun1',
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
};

const main: TIngredient = {
  _id: 'main1',
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
};

const sauce: TIngredient = {
  _id: 'sauce1',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'https://code.s3.yandex.net/react/code/sauce-02.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/sauce-02-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/sauce-02-large.png'
};

describe('constructorSlice', () => {
  const initialState = {
    bun: null,
    ingredients: []
  };

  it('должен возвращать начальное состояние при неизвестном экшене', () => {
    const state = constructorReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  describe('addIngredient', () => {
    it('добавляет булку', () => {
      const action = addIngredient(bun);
      const state = constructorReducer(initialState, action);
      expect(state.bun).toMatchObject({ ...bun, id: expect.any(String) });
      expect(state.ingredients).toHaveLength(0);
    });

    it('добавляет начинку', () => {
      const action = addIngredient(main);
      const state = constructorReducer(initialState, action);
      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0]).toMatchObject({ ...main, id: expect.any(String) });
    });

    it('заменяет булку при добавлении новой', () => {
      const newBun = { ...bun, _id: 'bun2', name: 'Флюоресцентная булка R2-D3' };
      let state = constructorReducer(initialState, addIngredient(bun));
      state = constructorReducer(state, addIngredient(newBun));
      expect(state.bun).toMatchObject({ ...newBun, id: expect.any(String) });
    });
  });

  describe('removeIngredient', () => {
    it('удаляет ингредиент по id', () => {
      let state = constructorReducer(initialState, addIngredient(main));
      expect(state.ingredients).toHaveLength(1);
      
      const ingredientId = state.ingredients[0].id;
      const action = removeIngredient(ingredientId);
      state = constructorReducer(state, action);
      expect(state.ingredients).toHaveLength(0);
    });
  });

  describe('moveIngredient', () => {
    it('перемещает ингредиент', () => {
      let state = constructorReducer(initialState, addIngredient(main));
      state = constructorReducer(state, addIngredient(sauce));
      
      expect(state.ingredients[0]).toMatchObject({ ...main, id: expect.any(String) });
      expect(state.ingredients[1]).toMatchObject({ ...sauce, id: expect.any(String) });

      const action = moveIngredient({ fromIndex: 0, toIndex: 1 });
      state = constructorReducer(state, action);

      expect(state.ingredients[0]).toMatchObject({ ...sauce, id: expect.any(String) });
      expect(state.ingredients[1]).toMatchObject({ ...main, id: expect.any(String) });
    });
  });

  describe('clearConstructor', () => {
    it('очищает конструктор', () => {
      let state = constructorReducer(initialState, addIngredient(bun));
      state = constructorReducer(state, addIngredient(main));
      
      expect(state.bun).not.toBeNull();
      expect(state.ingredients).toHaveLength(1);

      const action = clearConstructor();
      state = constructorReducer(state, action);

      expect(state.bun).toBeNull();
      expect(state.ingredients).toHaveLength(0);
    });
  });

  describe('Селекторы', () => {
    const createTestState = (): RootState => {
      return {
        ingredients: { items: [], isLoading: false, error: null },
        burgerConstructor: {
          bun: { ...bun, id: 'bun-1' },
          ingredients: [{ ...main, id: 'main-1' }]
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

    it('selectConstructorItems возвращает все данные конструктора', () => {
      const state = createTestState();
      expect(selectConstructorItems(state)).toEqual({
        bun: { ...bun, id: 'bun-1' },
        ingredients: [{ ...main, id: 'main-1' }]
      });
    });

    it('selectConstructorBun возвращает булку', () => {
      const state = createTestState();
      expect(selectConstructorBun(state)).toEqual({ ...bun, id: 'bun-1' });
    });

    it('selectConstructorIngredients возвращает ингредиенты', () => {
      const state = createTestState();
      expect(selectConstructorIngredients(state)).toEqual([{ ...main, id: 'main-1' }]);
    });
  });
});