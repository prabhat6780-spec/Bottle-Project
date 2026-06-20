import { createSlice, createAsyncThunk, } from "@reduxjs/toolkit";

import API from "../../services/api";

// ================= GET operators =================
export const fetchOperators =
  createAsyncThunk(

    "operators/fetchoperators",

    async (params, { rejectWithValue }) => {

      try {

        const response =
          await API.get("/operator", {
            params,
          });

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to fetch operators"

        );

      }

    }

  );

// ================= CREATE operator =================
export const createOperator =
  createAsyncThunk(

    "operators/createoperator",

    async (
      formData,
      { rejectWithValue }
    ) => {

      try {

        const response =
          await API.post(
            "/operator",
            formData
          );

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to create operator"

        );

      }

    }

  );

// ================= UPDATE operator =================
export const updateOperator =
  createAsyncThunk(

    "operators/updateoperator",

    async (
      { id, formData },
      { rejectWithValue }
    ) => {

      try {

        const response =
          await API.put(

            `/operator/${id}`,

            formData

          );

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to update operator"

        );

      }

    }

  );

// ================= DELETE operator =================
export const deleteOperator =
  createAsyncThunk(

    "operators/deleteoperator",

    async (
      id,
      { rejectWithValue }
    ) => {

      try {

        await API.delete(
          `/operator/${id}`
        );

        return id;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to delete operator"

        );

      }

    }

  );

const operatorSlice = createSlice({

  name: "operators",

  initialState: {

    operators: [],

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
        fetchOperators.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        fetchOperators.fulfilled,
        (state, action) => {
          state.loading = false;
          state.operators = action.payload.data || [];
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
        fetchOperators.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= CREATE =================
      .addCase(
        createOperator.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        createOperator.fulfilled,
        (state, action) => {

          state.loading = false;

          state.operators.push(
            action.payload
          );

        }
      )

      .addCase(
        createOperator.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= UPDATE =================
      .addCase(
        updateOperator.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        updateOperator.fulfilled,
        (state, action) => {

          state.loading = false;

          state.operators =
            state.operators.map(
              (operator) =>

                operator._id ===
                  action.payload._id

                  ? action.payload

                  : operator
            );

        }
      )

      .addCase(
        updateOperator.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= DELETE =================
      .addCase(
        deleteOperator.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        deleteOperator.fulfilled,
        (state, action) => {

          state.loading = false;

          state.operators =
            state.operators.filter(
              (operator) =>

                operator._id !==
                action.payload
            );

        }
      )

      .addCase(
        deleteOperator.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      );

  },

});

export default operatorSlice.reducer;
