import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchCoatingTypes = createAsyncThunk('coatingType/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await API.get('/coating-type', { params });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to fetch coating types');
  }
});

export const createCoatingType = createAsyncThunk('coatingType/create', async (data, { rejectWithValue }) => {
  try {
    const response = await API.post('/coating-type', data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to create coating type');
  }
});

export const updateCoatingType = createAsyncThunk('coatingType/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await API.put(`/coating-type/${id}`, data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to update coating type');
  }
});

export const deleteCoatingType = createAsyncThunk('coatingType/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/coating-type/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to delete coating type');
  }
});

const coatingTypeSlice = createSlice({
  name: 'coatingType',
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
      .addCase(fetchCoatingTypes.pending, (state) => { state.loading = true; })
      .addCase(fetchCoatingTypes.fulfilled, (state, action) => {
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
      .addCase(fetchCoatingTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCoatingType.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCoatingType.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteCoatingType.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i._id !== action.payload);
      });
  },
});

export default coatingTypeSlice.reducer;
