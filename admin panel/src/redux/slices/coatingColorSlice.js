import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchCoatingColors = createAsyncThunk('coatingColor/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await API.get('/coating-color', { params });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to fetch coating colors');
  }
});

export const createCoatingColor = createAsyncThunk('coatingColor/create', async (data, { rejectWithValue }) => {
  try {
    const response = await API.post('/coating-color', data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to create coating color');
  }
});

export const updateCoatingColor = createAsyncThunk('coatingColor/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await API.put(`/coating-color/${id}`, data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to update coating color');
  }
});

export const deleteCoatingColor = createAsyncThunk('coatingColor/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/coating-color/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to delete coating color');
  }
});

const coatingColorSlice = createSlice({
  name: 'coatingColor',
  initialState: {
    items: [],
    loading: false,
    error: null,
    page: 1,
    totalPages: 1,
    total: 0,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoatingColors.pending, (state) => { state.loading = true; })
      .addCase(fetchCoatingColors.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.items = action.payload.data || [];
          state.total = action.payload.total || 0;
          if (action.payload.page !== undefined) state.page = action.payload.page;
          if (action.payload.totalPages !== undefined) state.totalPages = action.payload.totalPages;
        } else {
          state.items = Array.isArray(action.payload) ? action.payload : [];
        }
      })
      .addCase(fetchCoatingColors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCoatingColor.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.items.push(...action.payload);
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(updateCoatingColor.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteCoatingColor.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i._id !== action.payload);
      });
  },
});

export default coatingColorSlice.reducer;
