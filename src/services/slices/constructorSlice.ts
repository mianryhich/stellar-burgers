import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { TConstructorIngredient, TIngredient } from '@utils-types';
import type { RootState } from '../store';

type TConstructorState = {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorIngredient[];
};

const initialState: TConstructorState = {
  bun: null,
  ingredients: []
};

const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      reducer(state, action: PayloadAction<TConstructorIngredient>) {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
      },
      prepare(ingredient: TIngredient) {
        return { payload: { ...ingredient, id: uuidv4() } };
      }
    },

    removeIngredient(state, action: PayloadAction<string>) {
      state.ingredients = state.ingredients.filter(
        (ing) => ing.id !== action.payload
      );
    },

    moveIngredient(
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) {
      const { fromIndex, toIndex } = action.payload;
      const items = [...state.ingredients];
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, moved);
      state.ingredients = items;
    },

    clearConstructor(state) {
      state.bun = null;
      state.ingredients = [];
    }
  }
});

export const {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} = constructorSlice.actions;

export default constructorSlice.reducer;

export const selectConstructorItems = (state: RootState) =>
  state.burgerConstructor;

export const selectConstructorBun = (state: RootState) =>
  state.burgerConstructor.bun;

export const selectConstructorIngredients = (state: RootState) =>
  state.burgerConstructor.ingredients;
