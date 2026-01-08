import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAllBudgetAccounts } from "@/api/catapresu";

type BudgetAccount = any;

type BudgetAccountsState = {
    items: BudgetAccount[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    map: Record<string, string>;
};

const initialState: BudgetAccountsState = {
    items: [],
    status: "idle",
    error: null,
    map: {},
};

// Ajustaremos esto cuando veamos el JSON real
const pickCode = (a: any) => String(a.CUENTA ?? "").trim();
const pickName = (a: any) => String(a.DESCRI1 ?? "").trim();

export const fetchBudgetAccounts = createAsyncThunk(
    "budgetAccounts/fetchAll",
    async () => {
        const list = await getAllBudgetAccounts();
        return Array.isArray(list) ? list : [];
    }
);

const budgetAccountsSlice = createSlice({
    name: "budgetAccounts",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBudgetAccounts.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchBudgetAccounts.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload;

                const map: Record<string, string> = {};
                for (const a of action.payload) {
                    const code = pickCode(a);
                    const name = pickName(a);
                    if (code) map[code] = name || "—";
                }
                state.map = map;
            })
            .addCase(fetchBudgetAccounts.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "Error cargando cuentas presupuestarias";
            });
    },
});

export default budgetAccountsSlice.reducer;

export const selectBudgetAccountsStatus = (state: any) => state.budgetAccounts.status;
export const selectAccountNameByCode = (code: string) => (state: any) =>
    state.budgetAccounts.map?.[String(code ?? "").trim()] || "—";
