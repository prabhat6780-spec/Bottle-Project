import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchPrintingColors = createAsyncThunk('printingColor/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/printing-color');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const createPrintingColor = createAsyncThunk('printingColor/create', async (data, { rejectWithValue }) => {
  try {
    const response = await API.post('/printing-color', data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const updatePrintingColor = createAsyncThunk('printingColor/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await API.put(`/printing-color/${id}`, data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const deletePrintingColor = createAsyncThunk('printingColor/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/printing-color/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

const printingColorSlice = createSlice({
  name: 'printingColor',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrintingColors.pending, (state) => { state.loading = true; })
      .addCase(fetchPrintingColors.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPrintingColors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPrintingColor.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updatePrintingColor.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deletePrintingColor.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i._id !== action.payload);
      });
  },
});

export default printingColorSlice.reducer;
