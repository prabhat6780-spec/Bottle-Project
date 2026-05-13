import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const matchBottle = createAsyncThunk(
  'vision/matchBottle',
  async (imageFile, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const response = await API.post('/vision/match', formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Vision API failed');
    }
  }
);

const visionSlice = createSlice({
  name: 'vision',
  initialState: {
    matchResult: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearMatchResult: (state) => {
      state.matchResult = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(matchBottle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(matchBottle.fulfilled, (state, action) => {
        state.loading = false;
        state.matchResult = action.payload;
      })
      .addCase(matchBottle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMatchResult } = visionSlice.actions;
export default visionSlice.reducer;
