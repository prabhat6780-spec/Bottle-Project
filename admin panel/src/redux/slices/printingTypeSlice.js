import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchPrintingTypes = createAsyncThunk('printingType/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/printing-type');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const createPrintingType = createAsyncThunk('printingType/create', async (data, { rejectWithValue }) => {
  try {
    const response = await API.post('/printing-type', data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const updatePrintingType = createAsyncThunk('printingType/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await API.put(`/printing-type/${id}`, data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const deletePrintingType = createAsyncThunk('printingType/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/printing-type/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

const printingTypeSlice = createSlice({
  name: 'printingType',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrintingTypes.pending, (state) => { state.loading = true; })
      .addCase(fetchPrintingTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPrintingTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPrintingType.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updatePrintingType.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deletePrintingType.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i._id !== action.payload);
      });
  },
});

export default printingTypeSlice.reducer;
