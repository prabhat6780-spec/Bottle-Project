import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchSgLabels = createAsyncThunk(
  'sgLabels/fetchAll',
  async ({ page = 1, limit = 10, pagination = "true", search = "", companyId = "", brandId = "", bottleId = "" } = {}, { rejectWithValue }) => {
    try {
      const response = await API.get(`/sg-label?page=${page}&limit=${limit}&pagination=${pagination}&search=${encodeURIComponent(search)}&companyId=${companyId}&brandId=${brandId}&bottleId=${bottleId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch SG Labels');
    }
  }
);

export const fetchSgLabelById = createAsyncThunk(
  'sgLabels/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/sg-label/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch SG Label');
    }
  }
);

export const createSgLabel = createAsyncThunk(
  'sgLabels/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await API.post('/sg-label', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create SG Label');
    }
  }
);

export const updateSgLabel = createAsyncThunk(
  'sgLabels/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/sg-label/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update SG Label');
    }
  }
);

export const deleteSgLabel = createAsyncThunk(
  'sgLabels/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.delete(`/sg-label/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const toggleSgLabelStatus = createAsyncThunk(
  'sgLabels/toggleStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.put(`/sg-label/${id}/status`);
      return { id, status: response.data.data?.status ?? null };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Error toggling status" });
    }
  }
);

export const hideVariantFromSgLabel = createAsyncThunk(
  'sgLabels/hideVariant',
  async (id, { rejectWithValue }) => {
    try {
      await API.put(`/sg-label/${id}/hide`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to hide variant');
    }
  }
);


const sgLabelSlice = createSlice({
  name: 'sgLabels',
  initialState: {
    searchTerm: "",
    sgLabels: [],
    currentSgLabel: null,
    total: 0,
    totalPages: 0,
    currentPage: 1,
    loading: false,
    error: null,
  },
  reducers: {
    setSearchTerm: (state, action) => { state.searchTerm = action.payload; },
    clearCurrentSgLabel: (state) => {
      state.currentSgLabel = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchSgLabels.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSgLabels.fulfilled, (state, action) => {
        state.loading = false;
        state.sgLabels = action.payload.data;
        if (action.payload.total !== undefined) {
          state.total = action.payload.total;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.page;
        }
      })
      .addCase(fetchSgLabels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch By Id
      .addCase(fetchSgLabelById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSgLabelById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSgLabel = action.payload.data;
      })
      .addCase(fetchSgLabelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteSgLabel.fulfilled, (state, action) => {
        state.sgLabels = state.sgLabels.filter((label) => label._id !== action.payload);
      })
      .addCase(toggleSgLabelStatus.fulfilled, (state, action) => {
        const index = state.sgLabels.findIndex((l) => l._id === action.payload.id);
        if (index !== -1) {
          state.sgLabels[index].status = !state.sgLabels[index].status;
        }
      })
      .addCase(hideVariantFromSgLabel.fulfilled, (state, action) => {
        state.sgLabels = state.sgLabels.filter((label) => label._id !== action.payload);
      });
  }
});

export const { clearCurrentSgLabel, setSearchTerm } = sgLabelSlice.actions;
export default sgLabelSlice.reducer;
