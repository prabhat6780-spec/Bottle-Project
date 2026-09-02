import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";

// ================= GET FORMULAS =================
export const fetchFormulas = createAsyncThunk(
  "formulas/fetchFormulas",
  async (params, { rejectWithValue }) => {
    try {
      const response = await API.get("/formula", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch formulas");
    }
  }
);

// ================= GET SINGLE FORMULA =================
export const fetchFormulaById = createAsyncThunk(
  "formulas/fetchFormulaById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/formula/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch formula details");
    }
  }
);

// ================= CREATE FORMULA =================
export const createFormula = createAsyncThunk(
  "formulas/createFormula",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API.post("/formula", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create formula");
    }
  }
);

// ================= UPDATE FORMULA =================
export const updateFormula = createAsyncThunk(
  "formulas/updateFormula",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/formula/${id}`, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update formula");
    }
  }
);

// ================= DELETE FORMULA =================
export const deleteFormula = createAsyncThunk(
  "formulas/deleteFormula",
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/formula/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete formula");
    }
  }
);

// ================= TOGGLE STATUS =================
export const toggleFormulaStatus = createAsyncThunk(
  "formulas/toggleFormulaStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.patch(`/formula/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
    }
  }
);

const formulaSlice = createSlice({
  name: "formulas",
  initialState: {
    searchTerm: "",
    formulas: [],
    loading: false,
    error: null,
    page: 1,
    totalPages: 1,
    total: 0,
    currentFormula: null,
  },
  reducers: {
    setSearchTerm: (state, action) => { state.searchTerm = action.payload; },},
  extraReducers: (builder) => {
    builder
      // ================= FETCH ALL =================
      .addCase(fetchFormulas.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFormulas.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.formulas = action.payload.data || [];
          state.total = action.payload.total || 0;
          if (action.payload.page !== undefined) state.page = action.payload.page;
          if (action.payload.totalPages !== undefined) state.totalPages = action.payload.totalPages;
        } else {
          state.formulas = Array.isArray(action.payload) ? action.payload : [];
        }
      })
      .addCase(fetchFormulas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ================= FETCH SINGLE =================
      .addCase(fetchFormulaById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFormulaById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFormula = action.payload;
      })
      .addCase(fetchFormulaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ================= CREATE =================
      .addCase(createFormula.pending, (state) => {
        state.loading = true;
      })
      .addCase(createFormula.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.formulas.push(...action.payload);
        } else {
          state.formulas.push(action.payload);
        }
      })
      .addCase(createFormula.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ================= UPDATE =================
      .addCase(updateFormula.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFormula.fulfilled, (state, action) => {
        state.loading = false;
        state.formulas = state.formulas.map((formula) =>
          formula._id === action.payload._id ? action.payload : formula
        );
      })
      .addCase(updateFormula.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ================= DELETE =================
      .addCase(deleteFormula.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteFormula.fulfilled, (state, action) => {
        state.loading = false;
        state.formulas = state.formulas.filter((formula) => formula._id !== action.payload);
      })
      .addCase(deleteFormula.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ================= TOGGLE STATUS =================
      .addCase(toggleFormulaStatus.fulfilled, (state, action) => {
        if (action.payload.success) {
          const updated = action.payload.data;
          const index = state.formulas.findIndex((f) => f._id === updated._id);
          if (index !== -1) {
            state.formulas[index].status = updated.status;
          }
        }
      });
  },
});

export const { setSearchTerm } = formulaSlice.actions;
export default formulaSlice.reducer;
