// loginSlice.js - CORRECTED VERSION
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { LoginCredentialsApi } from '../api/loginApi';

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (formData, thunkAPI) => {
        try {
            const response = await LoginCredentialsApi(formData);
            console.log("Login API response:", response);
            
            if (response.error) {
                console.error("Login API error:", response.error);
                return thunkAPI.rejectWithValue(response.error);
            }
            return response.data;
        } catch (error) {
            console.error("Login thunk error:", error);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const loginSlice = createSlice({
    name: 'login',  // ← CHANGED: from 'userData' to 'login' to match store
    initialState: {
        userData: null,  // Changed from [] to null
        error: null,
        loading: false,
        isLoggedIn: false,
    },
    reducers: {
        logout: (state) => {
            state.userData = null;
            state.isLoggedIn = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.userData = action.payload;
                state.isLoggedIn = true;
                
                // Log the employee_id for debugging
                console.log("Logged in user data:", action.payload);
                console.log("Employee ID:", action.payload.employee_id || action.payload.empoyee_id);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isLoggedIn = false;
            });
    },
});

export const { logout, clearError } = loginSlice.actions;
export default loginSlice.reducer;