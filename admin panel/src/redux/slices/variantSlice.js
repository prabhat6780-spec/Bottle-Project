import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import API from "../../services/api";

// ================= GET VARIANTS =================
export const fetchVariants =
  createAsyncThunk(

    "variants/fetchVariants",

    async (params, { rejectWithValue }) => {
      try {
        const response =
          await API.get("/variant", { params });

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to fetch variants"

        );

      }

    }

  );

// ================= CREATE VARIANT =================
export const createVariant =
  createAsyncThunk(

    "variants/createVariant",

    async (
      formData,
      { rejectWithValue }
    ) => {

      try {

        const response =
          await API.post(
            "/variant",
            formData
          );

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to create variant"

        );

      }

    }

  );

// ================= UPDATE VARIANT =================
export const updateVariant =
  createAsyncThunk(

    "variants/updateVariant",

    async (
      { id, formData },
      { rejectWithValue }
    ) => {

      try {

        const response =
          await API.put(

            `/variant/${id}`,

            formData

          );

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to update variant"

        );

      }

    }

  );

// ================= DELETE VARIANT =================
export const deleteVariant =
  createAsyncThunk(

    "variants/deleteVariant",

    async (
      id,
      { rejectWithValue }
    ) => {

      try {

        await API.delete(
          `/variant/${id}`
        );

        return id;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to delete variant"

        );

      }

    }

  );

const variantSlice = createSlice({

  name: "variants",

  initialState: {
    variants: [],
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
      .addCase(
        fetchVariants.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        fetchVariants.fulfilled,
        (state, action) => {
          state.loading = false;
          if (action.payload.success) {
            state.variants = action.payload.data || [];
            state.total = action.payload.total || 0;
            if (action.payload.page !== undefined) state.page = action.payload.page;
            if (action.payload.totalPages !== undefined) state.totalPages = action.payload.totalPages;
          } else {
            state.variants = Array.isArray(action.payload) ? action.payload : [];
          }
        }
      )

      .addCase(
        fetchVariants.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= CREATE =================
      .addCase(
        createVariant.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        createVariant.fulfilled,
        (state, action) => {

          state.loading = false;

          state.variants.push(
            action.payload
          );

        }
      )

      .addCase(
        createVariant.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= UPDATE =================
      .addCase(
        updateVariant.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        updateVariant.fulfilled,
        (state, action) => {

          state.loading = false;

          state.variants =
            state.variants.map(
              (variant) =>

                variant._id ===
                action.payload._id

                  ? action.payload

                  : variant
            );

        }
      )

      .addCase(
        updateVariant.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= DELETE =================
      .addCase(
        deleteVariant.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        deleteVariant.fulfilled,
        (state, action) => {

          state.loading = false;

          state.variants =
            state.variants.filter(
              (variant) =>

                variant._id !==
                action.payload
            );

        }
      )

      .addCase(
        deleteVariant.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      );

  },

});

export default variantSlice.reducer;