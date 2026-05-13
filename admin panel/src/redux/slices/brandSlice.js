import { createSlice, createAsyncThunk,} from "@reduxjs/toolkit";

import API from "../../services/api";

// ================= GET BRANDS =================
export const fetchBrands =
  createAsyncThunk(

    "brands/fetchBrands",

    async (_, { rejectWithValue }) => {

      try {

        const response =
          await API.get("/brand");

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to fetch brands"

        );

      }

    }

  );

// ================= CREATE BRAND =================
export const createBrand =
  createAsyncThunk(

    "brands/createBrand",

    async (
      formData,
      { rejectWithValue }
    ) => {

      try {

        const response =
          await API.post(
            "/brand",
            formData
          );

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to create brand"

        );

      }

    }

  );

// ================= UPDATE BRAND =================
export const updateBrand =
  createAsyncThunk(

    "brands/updateBrand",

    async (
      { id, formData },
      { rejectWithValue }
    ) => {

      try {

        const response =
          await API.put(

            `/brand/${id}`,

            formData

          );

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to update brand"

        );

      }

    }

  );

// ================= DELETE BRAND =================
export const deleteBrand =
  createAsyncThunk(

    "brands/deleteBrand",

    async (
      id,
      { rejectWithValue }
    ) => {

      try {

        await API.delete(
          `/brand/${id}`
        );

        return id;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to delete brand"

        );

      }

    }

  );

const brandSlice = createSlice({

  name: "brands",

  initialState: {

    brands: [],

    loading: false,

    error: null,

  },

  reducers: {},

  extraReducers: (builder) => {

    builder

      // ================= FETCH =================
      .addCase(
        fetchBrands.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        fetchBrands.fulfilled,
        (state, action) => {

          state.loading = false;

          state.brands =
            action.payload;

        }
      )

      .addCase(
        fetchBrands.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= CREATE =================
      .addCase(
        createBrand.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        createBrand.fulfilled,
        (state, action) => {

          state.loading = false;

          state.brands.push(
            action.payload
          );

        }
      )

      .addCase(
        createBrand.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= UPDATE =================
      .addCase(
        updateBrand.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        updateBrand.fulfilled,
        (state, action) => {

          state.loading = false;

          state.brands =
            state.brands.map(
              (brand) =>

                brand._id ===
                action.payload._id

                  ? action.payload

                  : brand
            );

        }
      )

      .addCase(
        updateBrand.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= DELETE =================
      .addCase(
        deleteBrand.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        deleteBrand.fulfilled,
        (state, action) => {

          state.loading = false;

          state.brands =
            state.brands.filter(
              (brand) =>

                brand._id !==
                action.payload
            );

        }
      )

      .addCase(
        deleteBrand.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      );

  },

});

export default brandSlice.reducer;