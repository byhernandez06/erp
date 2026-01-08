import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import budgetAccountsReducer from "./slices/budgetAccountsSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        budgetAccounts: budgetAccountsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
