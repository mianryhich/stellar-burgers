import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getOrdersApi, getOrderByNumberApi } from '@api';
import { TOrder } from '@utils-types';
import type { RootState } from '../store';

type TUserOrdersState = {
  orders: TOrder[];
  isLoading: boolean;
  error: string | null;
  currentOrder: TOrder | null;
  isCurrentOrderLoading: boolean;
};

const initialState: TUserOrdersState = {
  orders: [],
  isLoading: false,
  error: null,
  currentOrder: null,
  isCurrentOrderLoading: false
};

export const fetchUserOrders = createAsyncThunk<TOrder[]>(
  'userOrders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await getOrdersApi();
    } catch (err) {
      return rejectWithValue(
        (err as Error).message ?? 'Ошибка загрузки заказов'
      );
    }
  }
);

export const fetchOrderByNumber = createAsyncThunk<TOrder, number>(
  'userOrders/fetchByNumber',
  async (number, { rejectWithValue }) => {
    try {
      const response = await getOrderByNumberApi(number);
      if (!response.orders.length) {
        return rejectWithValue('Заказ не найден');
      }
      return response.orders[0];
    } catch (err) {
      return rejectWithValue(
        (err as Error).message ?? 'Ошибка загрузки заказа'
      );
    }
  }
);

const userOrdersSlice = createSlice({
  name: 'userOrders',
  initialState,
  reducers: {
    clearCurrentOrder(state) {
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.isCurrentOrderLoading = true;
        state.currentOrder = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.isCurrentOrderLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.isCurrentOrderLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearCurrentOrder } = userOrdersSlice.actions;
export default userOrdersSlice.reducer;

export const selectUserOrders = (state: RootState) => state.userOrders.orders;

export const selectUserOrdersLoading = (state: RootState) =>
  state.userOrders.isLoading;

export const selectCurrentOrder = (state: RootState) =>
  state.userOrders.currentOrder;

export const selectCurrentOrderLoading = (state: RootState) =>
  state.userOrders.isCurrentOrderLoading;
