import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchEmployeeDataApi } from '../api/employeeApi';

/**
 * Async thunk to fetch all employee data from the EMPLOYEE sheet
 */
export const fetchAllEmployees = createAsyncThunk(
    'employee/fetchAllEmployees',
    async (_, thunkAPI) => {
        try {
            const response = await fetchEmployeeDataApi();

            if (response.error) {
                return thunkAPI.rejectWithValue(response.error);
            }

            const data = response.data;

            if (!data || data.length === 0) {
                return thunkAPI.rejectWithValue('No employee data available');
            }

            // First row is headers
            const headers = data[0];

            // Convert rows to employee objects
            const employees = data.slice(1).map(row => {
                const employee = {};
                headers.forEach((header, index) => {
                    if (header && header.trim() !== '') {
                        employee[header] = row[index] !== undefined && row[index] !== null
                            ? row[index].toString()
                            : '';
                    }
                });
                return employee;
            });

            return employees;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const employeeSlice = createSlice({
    name: 'employee',
    initialState: {
        employees: [],
        loading: false,
        error: null,
        lastFetched: null,
    },
    reducers: {
        clearEmployeeError: (state) => {
            state.error = null;
        },
        clearEmployees: (state) => {
            state.employees = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllEmployees.fulfilled, (state, action) => {
                state.loading = false;
                state.employees = action.payload;
                state.lastFetched = new Date().toISOString();
                state.error = null;
            })
            .addCase(fetchAllEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.employees = [];
            });
    },
});

export const { clearEmployeeError, clearEmployees } = employeeSlice.actions;
export default employeeSlice.reducer;