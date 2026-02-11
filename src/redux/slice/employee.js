import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchEmployeeDataApi } from '../api/employeeApi';

// Helper function to extract numeric part from employee code
const extractNumber = (val) => {
    if (!val) return '';
    const numberStr = val.toString().replace(/\D/g, '');
    return numberStr.replace(/^0+/, '');
};

/**
 * Async thunk to fetch all employee data from the EMPLOYEE sheet
 */
export const fetchAllEmployees = createAsyncThunk(
    'employee/fetchAllEmployees',
    async (_, thunkAPI) => {
        try {
            console.log("🚀 Starting fetchAllEmployees thunk...");
            const response = await fetchEmployeeDataApi();
            
            if (response.error) {
                console.error("❌ Employee API error in thunk:", response.error);
                return thunkAPI.rejectWithValue(response.error);
            }

            const data = response.data;
            
            if (!data || data.length === 0) {
                console.warn("⚠️ No employee data received");
                return thunkAPI.rejectWithValue('No employee data available');
            }

            // First row is headers
            const headers = data[0];
            console.log("📊 Headers found:", headers);
            
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

            console.log(`✅ Successfully loaded ${employees.length} employees`);
            console.log("📋 First employee:", employees[0]);
            
            return employees;
        } catch (error) {
            console.error("❌ Error in fetchAllEmployees thunk:", error);
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
                console.log("⏳ Employee data loading...");
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllEmployees.fulfilled, (state, action) => {
                console.log("✅ Employee data loaded successfully");
                state.loading = false;
                state.employees = action.payload;
                state.lastFetched = new Date().toISOString();
                state.error = null;
            })
            .addCase(fetchAllEmployees.rejected, (state, action) => {
                console.error("❌ Employee data loading failed:", action.payload);
                state.loading = false;
                state.error = action.payload;
                state.employees = [];
            });
    },
});

export const { clearEmployeeError, clearEmployees } = employeeSlice.actions;
export default employeeSlice.reducer;