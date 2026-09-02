import {createSlice, createAsyncThunk,} from "@reduxjs/toolkit";

import API from "../../services/api";

// ================= GET SPECS =================
export const fetchBottleSpecs = createAsyncThunk(
  "bottleSpecs/fetchBottleSpecs",
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params || {});
      // Only apply the printing type filter when NOT fetching all (e.g. list page).
      // When pagination:'false' is passed from forms that need all specs for suggestions,
      // skip the type filter so coating specs are also included in name suggestions.
      if (!queryParams.has('type')) {
        queryParams.set('type', 'printing');
      }
      const url = `/bottle-spec?${queryParams.toString()}`;
      const response = await API.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch specs"
      );
    }
  }
);

// ================= CREATE SPEC =================
export const createBottleSpec =
  createAsyncThunk(

    "bottleSpecs/createBottleSpec",

    async (
      formData,
      { rejectWithValue }
    ) => {

      try {

        const response =
          await API.post(

            "/bottle-spec",

            formData

          );

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to create spec"

        );

      }

    }

  );

// ================= UPDATE SPEC =================
export const updateBottleSpec =
  createAsyncThunk(

    "bottleSpecs/updateBottleSpec",

    async (
      { id, formData },
      { rejectWithValue }
    ) => {

      try {

        const response =
          await API.put(

            `/bottle-spec/${id}`,

            formData

          );

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to update spec"

        );

      }

    }

  );

// ================= DELETE SPEC =================
export const deleteBottleSpec =
  createAsyncThunk(

    "bottleSpecs/deleteBottleSpec",

    async (
      id,
      { rejectWithValue }
    ) => {

      try {

        await API.delete(
          `/bottle-spec/${id}`
        );

        return id;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to delete spec"

        );

      }

    }

  );

const bottleSpecSlice = createSlice({

  name: "bottleSpecs",

  initialState: {
    searchTerm: "",
    bottleSpecs: [],
    loading: false,
    error: null,
    page: 1,
    totalPages: 1,
    total: 0,
  },

  reducers: {
    setSearchTerm: (state, action) => { state.searchTerm = action.payload; },},

  extraReducers: (builder) => {

    builder

      // ================= FETCH =================
      .addCase(
        fetchBottleSpecs.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        fetchBottleSpecs.fulfilled,
        (state, action) => {
          state.loading = false;
          if (action.payload.success) {
            state.bottleSpecs = action.payload.data || [];
            state.total = action.payload.total || 0;
            if (action.payload.page !== undefined) state.page = action.payload.page;
            if (action.payload.totalPages !== undefined) state.totalPages = action.payload.totalPages;
          } else {
            state.bottleSpecs = Array.isArray(action.payload) ? action.payload : [];
          }
        }
      )

      .addCase(
        fetchBottleSpecs.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= CREATE =================
      .addCase(
        createBottleSpec.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        createBottleSpec.fulfilled,
        (state, action) => {

          state.loading = false;

          state.bottleSpecs.push(
            action.payload
          );

        }
      )

      .addCase(
        createBottleSpec.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= UPDATE =================
      .addCase(
        updateBottleSpec.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        updateBottleSpec.fulfilled,
        (state, action) => {

          state.loading = false;

          state.bottleSpecs =
            state.bottleSpecs.map(
              (spec) =>

                spec._id ===
                action.payload._id

                  ? action.payload

                  : spec
            );

        }
      )

      .addCase(
        updateBottleSpec.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= DELETE =================
      .addCase(
        deleteBottleSpec.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        deleteBottleSpec.fulfilled,
        (state, action) => {

          state.loading = false;

          state.bottleSpecs =
            state.bottleSpecs.filter(
              (spec) =>

                spec._id !==
                action.payload
            );

        }
      )

      .addCase(
        deleteBottleSpec.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      );

  },

});

export const { setSearchTerm } = bottleSpecSlice.actions;
export default bottleSpecSlice.reducer;