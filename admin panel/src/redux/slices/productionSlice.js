// ================= productionSlice.js =================

import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import API from "../../services/api";

// ================= GET ALL PRODUCTIONS =================
export const fetchProductions =
  createAsyncThunk(

    "productions/fetchProductions",

    async (params, { rejectWithValue }) => {

      try {

        const response =
          await API.get("/production", {
            params,
          });

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to fetch productions"

        );

      }

    }

  );

// ================= GET SINGLE PRODUCTION =================
export const fetchSingleProduction =
  createAsyncThunk(

    "productions/fetchSingleProduction",

    async (
      id,
      { rejectWithValue }
    ) => {

      try {

        const response =
          await API.get(
            `/production/${id}`
          );

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to fetch production"

        );

      }

    }

  );

// ================= CREATE PRODUCTION =================
export const createProduction =
  createAsyncThunk(

    "productions/createProduction",

    async (
      formData,
      { rejectWithValue }
    ) => {

      try {

        const response =
          await API.post(

            "/production",

            formData

          );

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to create production"

        );

      }

    }

  );

// ================= UPDATE PRODUCTION =================
export const updateProduction =
  createAsyncThunk(

    "productions/updateProduction",

    async (
      { id, formData },
      { rejectWithValue }
    ) => {

      try {

        const response =
          await API.put(

            `/production/${id}`,

            formData

          );

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to update production"

        );

      }

    }

  );

// ================= DELETE PRODUCTION =================
export const deleteProduction =
  createAsyncThunk(

    "productions/deleteProduction",

    async (
      id,
      { rejectWithValue }
    ) => {

      try {

        await API.delete(
          `/production/${id}`
        );

        return id;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to delete production"

        );

      }

    }

  );

const productionSlice = createSlice({

  name: "productions",

  initialState: {

    productions: [],

    singleProduction: null,

    loading: false,

    error: null,

    page: 1,

    totalPages: 1,

    total: 0,


  },

  reducers: {

    clearProductions: (state) => {

      state.productions = [];

      state.page = 1;

      state.totalPages = 1;

      state.total = 0;

    },

  },

  extraReducers: (builder) => {

    builder

      // ================= FETCH ALL =================
      .addCase(
        fetchProductions.pending,
        (state) => {

          state.loading = true;

          state.error = null;

        }
      )

      .addCase(
        fetchProductions.fulfilled,
        (state, action) => {

          state.loading = false;

          state.productions =
            action.payload.data || [];

          state.page =
            action.payload.page || 1;

          state.totalPages =
            action.payload.totalPages || 1;

          state.total =
            action.payload.total || 0;

        }
      )

      .addCase(
        fetchProductions.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= FETCH SINGLE =================
      .addCase(
        fetchSingleProduction.pending,
        (state) => {

          state.loading = true;

          state.error = null;

        }
      )

      .addCase(
        fetchSingleProduction.fulfilled,
        (state, action) => {

          state.loading = false;

          state.singleProduction =
            action.payload.data || null;

        }
      )

      .addCase(
        fetchSingleProduction.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= CREATE =================
      .addCase(
        createProduction.pending,
        (state) => {

          state.loading = true;

          state.error = null;

        }
      )

      .addCase(
        createProduction.fulfilled,
        (state, action) => {

          state.loading = false;

          if (state.page === 1) {

            state.productions.unshift(
              action.payload.data
            );

          }

        }
      )

      .addCase(
        createProduction.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= UPDATE =================
      .addCase(
        updateProduction.pending,
        (state) => {

          state.loading = true;

          state.error = null;

        }
      )

      .addCase(
        updateProduction.fulfilled,
        (state, action) => {

          state.loading = false;

          state.singleProduction =
            action.payload.data;

          state.productions =
            state.productions.map(
              (production) =>

                production._id ===
                  action.payload.data._id

                  ? action.payload.data

                  : production
            );

        }
      )

      .addCase(
        updateProduction.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= DELETE =================
      .addCase(
        deleteProduction.pending,
        (state) => {

          state.loading = true;

          state.error = null;

        }
      )

      .addCase(
        deleteProduction.fulfilled,
        (state, action) => {

          state.loading = false;

          state.productions =
            state.productions.filter(
              (production) =>

                production._id !==
                action.payload
            );

        }
      )

      .addCase(
        deleteProduction.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      );

  },

});

export const {
  clearProductions,
} = productionSlice.actions;

export default productionSlice.reducer;