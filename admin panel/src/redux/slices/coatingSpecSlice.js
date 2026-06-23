import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";

// ================= GET SPECS =================
export const fetchCoatingSpecs = createAsyncThunk(
  "coatingSpecs/fetchCoatingSpecs",
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params || {});
      // Remove type filter — fetch all specs without backend type filtering.
      // Works for old live data (no isCoating flag) and new data (isCoating:true).
      queryParams.delete('type');

      // If paginated fetch, always use pagination:false so we can filter client-side
      // then re-paginate. For list pages that pass explicit page/limit we slice manually.
      const isPaginated = queryParams.get('pagination') !== 'false';
      const requestedPage = parseInt(queryParams.get('page') || '1');
      const requestedLimit = parseInt(queryParams.get('limit') || '10');

      if (isPaginated) {
        // Fetch all so we can filter coating specs accurately, then paginate client-side
        queryParams.set('pagination', 'false');
        queryParams.delete('page');
        queryParams.delete('limit');
      }

      const url = `/bottle-spec?${queryParams.toString()}`;
      const response = await API.get(url);

      if (response.data?.success && Array.isArray(response.data?.data)) {
        // Filter: coating specs have a coatingTypeId set (works for old + new data)
        const coatingOnly = response.data.data.filter(
          s => s.coatingTypeId !== null && s.coatingTypeId !== undefined
        );

        if (!isPaginated) {
          return { ...response.data, data: coatingOnly, total: coatingOnly.length };
        }

        // Re-paginate client-side
        const total = coatingOnly.length;
        const skip = (requestedPage - 1) * requestedLimit;
        const paged = coatingOnly.slice(skip, skip + requestedLimit);
        return {
          success: true,
          data: paged,
          total,
          page: requestedPage,
          totalPages: Math.ceil(total / requestedLimit)
        };
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch specs");
    }
  }
);

// ================= CREATE SPEC =================
export const createCoatingSpec = createAsyncThunk(
  "coatingSpecs/createCoatingSpec",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API.post("/bottle-spec", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create spec");
    }
  }
);

// ================= UPDATE SPEC =================
export const updateCoatingSpec = createAsyncThunk(
  "coatingSpecs/updateCoatingSpec",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/bottle-spec/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update spec");
    }
  }
);

// ================= DELETE SPEC =================
export const deleteCoatingSpec = createAsyncThunk(
  "coatingSpecs/deleteCoatingSpec",
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/bottle-spec/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete spec");
    }
  }
);

const coatingSpecSlice = createSlice({
  name: "coatingSpecs",
  initialState: {
    coatingSpecs: [],
    loading: false,
    error: null,
    page: 1,
    totalPages: 1,
    total: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ================= FETCH =================
      .addCase(fetchCoatingSpecs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCoatingSpecs.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.coatingSpecs = action.payload.data || [];
          state.total = action.payload.total || 0;
          if (action.payload.page !== undefined) state.page = action.payload.page;
          if (action.payload.totalPages !== undefined) state.totalPages = action.payload.totalPages;
        } else {
          state.coatingSpecs = Array.isArray(action.payload) ? action.payload : [];
        }
      })
      .addCase(fetchCoatingSpecs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ================= CREATE =================
      .addCase(createCoatingSpec.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCoatingSpec.fulfilled, (state, action) => {
        state.loading = false;
        state.coatingSpecs.push(action.payload);
      })
      .addCase(createCoatingSpec.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ================= UPDATE =================
      .addCase(updateCoatingSpec.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCoatingSpec.fulfilled, (state, action) => {
        state.loading = false;
        state.coatingSpecs = state.coatingSpecs.map((spec) =>
          spec._id === action.payload._id ? action.payload : spec
        );
      })
      .addCase(updateCoatingSpec.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ================= DELETE =================
      .addCase(deleteCoatingSpec.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCoatingSpec.fulfilled, (state, action) => {
        state.loading = false;
        state.coatingSpecs = state.coatingSpecs.filter((spec) => spec._id !== action.payload);
      })
      .addCase(deleteCoatingSpec.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default coatingSpecSlice.reducer;
