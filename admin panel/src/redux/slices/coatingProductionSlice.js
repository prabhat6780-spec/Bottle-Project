import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";

export const fetchCoatingProductions = createAsyncThunk(
  "coatingProductions/fetchCoatingProductions",
  async (params, { rejectWithValue }) => {
    try {
      const response = await API.get("/coating-production", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch coating productions");
    }
  }
);

export const fetchSingleCoatingProduction = createAsyncThunk(
  "coatingProductions/fetchSingleCoatingProduction",
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/coating-production/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch coating production");
    }
  }
);

export const createCoatingProduction = createAsyncThunk(
  "coatingProductions/createCoatingProduction",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API.post("/coating-production", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create coating production");
    }
  }
);

export const updateCoatingProduction = createAsyncThunk(
  "coatingProductions/updateCoatingProduction",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/coating-production/${id}`, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update coating production");
    }
  }
);

export const deleteCoatingProduction = createAsyncThunk(
  "coatingProductions/deleteCoatingProduction",
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.delete(`/coating-production/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete coating production");
    }
  }
);

const coatingProductionSlice = createSlice({
  name: "coatingProductions",
  initialState: {
    coatingProductions: [],
    singleProduction: null,
    loading: false,
    error: null,
    page: 1,
    totalPages: 1,
    total: 0,
  },
  reducers: {
    clearCoatingProductions: (state) => {
      state.coatingProductions = [];
    },
    clearSingleCoatingProduction: (state) => {
      state.singleProduction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchCoatingProductions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoatingProductions.fulfilled, (state, action) => {
        state.loading = false;
        state.coatingProductions = action.payload.data;
        state.page = action.payload.page || 1;
        state.totalPages = action.payload.totalPages || 1;
        state.total = action.payload.total || 0;
      })
      .addCase(fetchCoatingProductions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH SINGLE
      .addCase(fetchSingleCoatingProduction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleCoatingProduction.fulfilled, (state, action) => {
        state.loading = false;
        state.singleProduction = action.payload.data;
      })
      .addCase(fetchSingleCoatingProduction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createCoatingProduction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCoatingProduction.fulfilled, (state, action) => {
        state.loading = false;
        state.coatingProductions.unshift(action.payload.data);
        state.total += 1;
      })
      .addCase(createCoatingProduction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateCoatingProduction.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCoatingProduction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.coatingProductions.findIndex(
          (p) => p._id === action.payload.data._id
        );
        if (index !== -1) {
          state.coatingProductions[index] = action.payload.data;
        }
      })
      .addCase(updateCoatingProduction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteCoatingProduction.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCoatingProduction.fulfilled, (state, action) => {
        state.loading = false;
        state.coatingProductions = state.coatingProductions.filter(
          (p) => p._id !== action.payload.id
        );
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteCoatingProduction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCoatingProductions, clearSingleCoatingProduction } = coatingProductionSlice.actions;
export default coatingProductionSlice.reducer;
