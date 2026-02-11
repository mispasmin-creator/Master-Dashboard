// store.js - CORRECTED VERSION
import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './slice/loginSlice';
import settingsReducer from './slice/settingSlice';  // You have this
import employeeReducer from './slice/employee';  // ← ADD THIS

const store = configureStore({
    reducer: {
        login: loginReducer,           // ← CHANGED: was 'userData', now 'login' to match your selectors
        settings: settingsReducer,     // Your existing settings
        employee: employeeReducer,     // ← NEW: employee data
    },
});

export default store;