import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { orderBurgerApi } from '@api';
import { TOrder } from '@utils-types';
import { clearConstructor } from './constructorSlice';
import type { RootState } from '../store';

type TOrderState = {
  orderRequest: boolean;
  orderModalData: TOrder | null;
  error: string | null;
};

const initialState: TOrderState = {
  orderRequest: false,
  orderModalData: null,
  error: null
};

export const createOrder = createAsyncThunk<TOrder, string[]>(
  'order/create',
  async (ingredientIds, { dispatch, rejectWithValue }) => {
    try {
      const response = await orderBurgerApi(ingredientIds);
      dispatch(clearConstructor());
      const order: TOrder = {
        _id: response.order._id,
        status: response.order.status,
        name: response.name,
        createdAt: response.order.createdAt,
        updatedAt: response.order.updatedAt,
        number: response.order.number,
        ingredients: ingredientIds
      };
      return order;
    } catch (err) {
      return rejectWithValue(
        (err as Error).message ?? 'Ошибка оформления заказа'
      );
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderModal(state) {
      state.orderModalData = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearOrderModal } = orderSlice.actions;
export default orderSlice.reducer;

export const selectOrderRequest = (state: RootState) =>
  state.order.orderRequest;

export const selectOrderModalData = (state: RootState) =>
  state.order.orderModalData;

export const selectOrderError = (state: RootState) => state.order.error;
