import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";

// ================= GET units =================
export const fetchUnits = createAsyncThunk(
  "units/fetchunits",
  async (params, { rejectWithValue }) => {
    try {
      const response = await API.get("/unit", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch units"
      );
    }
  }
);

// ================= CREATE unit =================
export const createUnit = createAsyncThunk(
  "units/createunit",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API.post("/unit", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create unit"
      );
    }
  }
);

// ================= UPDATE unit =================
export const updateUnit = createAsyncThunk(
  "units/updateunit",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/unit/${id}`, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update unit"
      );
    }
  }
);

// ================= DELETE unit =================
export const deleteUnit = createAsyncThunk(
  "units/deleteunit",
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/unit/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete unit"
      );
    }
  }
);

const unitSlice = createSlice({
  name: "units",
  initialState: {
    searchTerm: "",
    units: [],
    loading: false,
    error: null,
    page: 1,
    totalPages: 1,
    total: 0,
  },
  reducers: {
    setSearchTerm: (state, action) => { state.searchTerm = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      // ================= FETCH =================
      .addCase(fetchUnits.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.units = action.payload.data || [];
        state.total = action.payload.total || 0;
        if (action.payload.page !== undefined) {
          state.page = action.payload.page;
        }
        if (action.payload.totalPages !== undefined) {
          state.totalPages = action.payload.totalPages;
        }
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ================= CREATE =================
      .addCase(createUnit.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.loading = false;
        state.units.push(action.payload);
      })
      .addCase(createUnit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ================= UPDATE =================
      .addCase(updateUnit.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUnit.fulfilled, (state, action) => {
        state.loading = false;
        state.units = state.units.map((unit) =>
          unit._id === action.payload._id ? action.payload : unit
        );
      })
      .addCase(updateUnit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ================= DELETE =================
      .addCase(deleteUnit.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUnit.fulfilled, (state, action) => {
        state.loading = false;
        state.units = state.units.filter((unit) => unit._id !== action.payload);
      })
      .addCase(deleteUnit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchTerm } = unitSlice.actions;
export default unitSlice.reducer;
