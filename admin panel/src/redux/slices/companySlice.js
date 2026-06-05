import { createSlice, createAsyncThunk, } from "@reduxjs/toolkit";

import API from "../../services/api";

// ================= GET companies =================
export const fetchCompanies =
  createAsyncThunk(

    "companies/fetchCompanies",

    async (params, { rejectWithValue }) => {

      try {

        const response =
          await API.get("/company", {
            params,
          });

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to fetch companies"

        );

      }

    }

  );

// ================= CREATE company =================
export const createCompany =
  createAsyncThunk(

    "companies/createCompany",

    async (
      formData,
      { rejectWithValue }
    ) => {

      try {

        const response =
          await API.post(
            "/company",
            formData
          );

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to create company"

        );

      }

    }

  );

// ================= UPDATE company =================
export const updateCompany =
  createAsyncThunk(

    "companies/updateCompany",

    async (
      { id, formData },
      { rejectWithValue }
    ) => {

      try {

        const response =
          await API.put(

            `/company/${id}`,

            formData

          );

        return response.data;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to update company"

        );

      }

    }

  );

// ================= DELETE company =================
export const deleteCompany =
  createAsyncThunk(

    "companies/deleteCompany",

    async (
      id,
      { rejectWithValue }
    ) => {

      try {

        await API.delete(
          `/company/${id}`
        );

        return id;

      } catch (error) {

        return rejectWithValue(

          error.response?.data?.message ||
          "Failed to delete company"

        );

      }

    }

  );

const companySlice = createSlice({

  name: "companies",

  initialState: {

    companies: [],

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
        fetchCompanies.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        fetchCompanies.fulfilled,
        (state, action) => {
          state.loading = false;
          state.companies = action.payload.data || [];
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
        fetchCompanies.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= CREATE =================
      .addCase(
        createCompany.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        createCompany.fulfilled,
        (state, action) => {

          state.loading = false;

          state.companies.push(
            action.payload
          );

        }
      )

      .addCase(
        createCompany.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= UPDATE =================
      .addCase(
        updateCompany.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        updateCompany.fulfilled,
        (state, action) => {

          state.loading = false;

          state.companies =
            state.companies.map(
              (company) =>

                company._id ===
                  action.payload._id

                  ? action.payload

                  : company
            );

        }
      )

      .addCase(
        updateCompany.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      )

      // ================= DELETE =================
      .addCase(
        deleteCompany.pending,
        (state) => {

          state.loading = true;

        }
      )

      .addCase(
        deleteCompany.fulfilled,
        (state, action) => {

          state.loading = false;

          state.companies =
            state.companies.filter(
              (company) =>

                company._id !==
                action.payload
            );

        }
      )

      .addCase(
        deleteCompany.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      );

  },

});

export default companySlice.reducer;
