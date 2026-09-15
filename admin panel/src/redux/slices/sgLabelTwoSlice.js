import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTemplates = createAsyncThunk('sgLabelTwo/fetchTemplates', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/sg-label-2');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error fetching templates');
  }
});

export const fetchTemplate = createAsyncThunk('sgLabelTwo/fetchTemplate', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/sg-label-2/${id}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error fetching template');
  }
});

export const createTemplate = createAsyncThunk('sgLabelTwo/createTemplate', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/sg-label-2', data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error creating template');
  }
});

export const updateTemplate = createAsyncThunk('sgLabelTwo/updateTemplate', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/sg-label-2/${id}`, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error updating template');
  }
});

export const deleteTemplate = createAsyncThunk('sgLabelTwo/deleteTemplate', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/sg-label-2/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error deleting template');
  }
});

const sgLabelTwoSlice = createSlice({
  name: 'sgLabelTwo',
  initialState: {
    templates: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
        state.error = null;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.templates.unshift(action.payload.template);
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const index = state.templates.findIndex(t => t._id === action.payload.template._id);
        if (index !== -1) {
          state.templates[index] = action.payload.template;
        }
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.templates = state.templates.filter(t => t._id !== action.payload);
      });
  }
});

export default sgLabelTwoSlice.reducer;
