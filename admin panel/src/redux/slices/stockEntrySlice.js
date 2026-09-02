import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";

export const fetchStockSummary = createAsyncThunk(
  "stockEntry/fetchSummary",
  async ({ date, page = 1, limit = 10, search = "" }, { rejectWithValue }) => {
    try {
      const response = await API.get("/stock-entry/summary", { params: { date, page, limit, search } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stock summary");
    }
  }
);

export const fetchStockInvoices = createAsyncThunk(
  "stockEntry/fetchInvoices",
  async ({ page = 1, limit = 10, search = "" }, { rejectWithValue }) => {
    try {
      const response = await API.get("/stock-entry/invoices", {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stock invoices");
    }
  }
);

export const fetchMaterialHistory = createAsyncThunk(
  "stockEntry/fetchHistory",
  async ({ id, page = 1, limit = 10, search = "" }, { rejectWithValue }) => {
    try {
      const response = await API.get(`/stock-entry/history/${id}`, { params: { page, limit, search } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch material history");
    }
  }
);

export const addStockEntry = createAsyncThunk(
  "stockEntry/addEntry",
  async (data, { rejectWithValue }) => {
    try {
      const response = await API.post("/stock-entry", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add stock entry");
    }
  }
);

export const deleteStockEntry = createAsyncThunk(
  "stockEntry/deleteEntry",
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/stock-entry/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete stock entry");
    }
  }
);

export const fetchStockEntryById = createAsyncThunk(
  "stockEntry/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/stock-entry/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stock entry");
    }
  }
);

export const updateStockEntry = createAsyncThunk(
  "stockEntry/updateEntry",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/stock-entry/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update stock entry");
    }
  }
);

const stockEntrySlice = createSlice({
  name: "stockEntry",
  initialState: {
    summary: [],
    invoices: [],
    history: [],
    historyCurrentStock: 0,
    loading: false,
    error: null,
    
    summaryPage: 1,
    summaryTotalPages: 1,
    summaryTotal: 0,
    
    invoicesPage: 1,
    invoicesTotalPages: 1,
    invoicesTotal: 0,
    
    historyPage: 1,
    historyTotalPages: 1,
    historyTotal: 0,
    
    searchTerm: "",
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Summary
      .addCase(fetchStockSummary.pending, (state) => { state.loading = true; })
      .addCase(fetchStockSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.data.summary;
        state.summaryPage = action.payload.data.page;
        state.summaryTotalPages = action.payload.data.totalPages;
        state.summaryTotal = action.payload.data.total;
      })
      .addCase(fetchStockSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Invoices
      .addCase(fetchStockInvoices.pending, (state) => { state.loading = true; })
      .addCase(fetchStockInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.data;
        state.invoicesPage = action.payload.page;
        state.invoicesTotalPages = action.payload.totalPages;
        state.invoicesTotal = action.payload.total;
      })
      .addCase(fetchStockInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // History
      .addCase(fetchMaterialHistory.pending, (state) => { state.loading = true; })
      .addCase(fetchMaterialHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.data.history;
        state.historyCurrentStock = action.payload.data.currentStock;
        state.historyPage = action.payload.data.page;
        state.historyTotalPages = action.payload.data.totalPages;
        state.historyTotal = action.payload.data.total;
      })
      .addCase(fetchMaterialHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setSearchTerm } = stockEntrySlice.actions;
export default stockEntrySlice.reducer;
