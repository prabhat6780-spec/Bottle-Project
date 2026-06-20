import { createSlice, createAsyncThunk, } from "@reduxjs/toolkit";

import API from "../../services/api";

// ================= GET shifts =================
export const fetchShifts =
  createAsyncThunk(

    "shifts/fetchshifts",

    async (params, { rejectWithValue }) => {

      try {

        const response =
          await API.get("/shift", {
            params,
          });

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to fetch shifts"

        );

      }

    }

  );

// ================= CREATE shift =================
export const createShift =
  createAsyncThunk(

    "shifts/createshift",

    async (
      formData,
      { rejectWithValue }
    ) => {

      try {

        const response =
          await API.post(
            "/shift",
            formData
          );

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to create shift"

        );

      }

    }

  );

// ================= UPDATE shift =================
export const updateShift =
  createAsyncThunk(

    "shifts/updateshift",

    async (
      { id, formData },
      { rejectWithValue }
    ) => {

      try {

        const response =
          await API.put(

            `/shift/${id}`,

            formData

          );

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to update shift"

        );

      }

    }

  );

// ================= DELETE shift =================
export const deleteShift =
  createAsyncThunk(

    "shifts/deleteshift",

    async (
      id,
      { rejectWithValue }
    ) => {

      try {

        await API.delete(
          `/shift/${id}`
        );

        return id;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to delete shift"

        );

      }

    }

  );

const shiftSlice = createSlice({

  name: "shifts",

  initialState: {

    shifts: [],

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
        fetchShifts.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        fetchShifts.fulfilled,
        (state, action) => {
          state.loading = false;
          state.shifts = action.payload.data || [];
          state.total = action.payload.total || 0;
          // Only update pagination if backend returned paginated data
          if (action.payload.page !== undefined) {
            state.page = action.payload.page;
          }
          if (action.payload.totalPages !== undefined) {
            state.totalPages = action.payload.totalPages;
          }
        }
      )

      .addCase(
        fetchShifts.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= CREATE =================
      .addCase(
        createShift.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        createShift.fulfilled,
        (state, action) => {

          state.loading = false;

          state.shifts.push(
            action.payload
          );

        }
      )

      .addCase(
        createShift.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= UPDATE =================
      .addCase(
        updateShift.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        updateShift.fulfilled,
        (state, action) => {

          state.loading = false;

          state.shifts =
            state.shifts.map(
              (shift) =>

                shift._id ===
                  action.payload._id

                  ? action.payload

                  : shift
            );

        }
      )

      .addCase(
        updateShift.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= DELETE =================
      .addCase(
        deleteShift.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        deleteShift.fulfilled,
        (state, action) => {

          state.loading = false;

          state.shifts =
            state.shifts.filter(
              (shift) =>

                shift._id !==
                action.payload
            );

        }
      )

      .addCase(
        deleteShift.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      );

  },

});

export default shiftSlice.reducer;
