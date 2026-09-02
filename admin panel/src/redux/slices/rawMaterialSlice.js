import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchRawMaterials = createAsyncThunk('rawMaterial/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await API.get('/raw-material', { params });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to fetch raw materials');
  }
});

export const fetchRawMaterialById = createAsyncThunk('rawMaterial/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await API.get(`/raw-material/${id}`);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to fetch raw material');
  }
});

export const createRawMaterial = createAsyncThunk('rawMaterial/create', async (data, { rejectWithValue }) => {
  try {
    const response = await API.post('/raw-material', data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to create raw material');
  }
});

export const updateRawMaterial = createAsyncThunk('rawMaterial/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await API.put(`/raw-material/${id}`, data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to update raw material');
  }
});

export const deleteRawMaterial = createAsyncThunk('rawMaterial/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/raw-material/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to delete raw material');
  }
});

const rawMaterialSlice = createSlice({
  name: 'rawMaterial',
  initialState: {
    searchTerm: "",
    items: [],
    currentMaterial: null,
    loading: false,
    error: null,
    page: 1,
    totalPages: 1,
    total: 0,
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchRawMaterials.pending, (state) => { state.loading = true; })
      .addCase(fetchRawMaterials.fulfilled, (state, action) => {
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
      .addCase(fetchRawMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch By ID
      .addCase(fetchRawMaterialById.pending, (state) => { state.loading = true; state.currentMaterial = null; })
      .addCase(fetchRawMaterialById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMaterial = action.payload;
      })
      .addCase(fetchRawMaterialById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createRawMaterial.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update
      .addCase(updateRawMaterial.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      // Delete
      .addCase(deleteRawMaterial.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i._id !== action.payload);
      });
  },
});

export const { setSearchTerm } = rawMaterialSlice.actions;
export default rawMaterialSlice.reducer;
