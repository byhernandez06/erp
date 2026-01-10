import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getAllOrders, searchOrders } from "@/api/orders";

type Order = any;

export type OrdersStatus = "idle" | "loading" | "succeeded" | "failed";

interface OrdersState {
    items: Order[];
    status: OrdersStatus;
    error: string | null;

    query: string;
    isSearching: boolean;
}

const initialState: OrdersState = {
    items: [],
    status: "idle",
    error: null,

    query: "",
    isSearching: false,
};

// 🔄 Cargar todas las órdenes
export const fetchOrders = createAsyncThunk("orders/fetchAll", async () => {
    const data = await getAllOrders();
    return Array.isArray(data) ? data : [];
});

// 🔎 Búsqueda global (proveedor o #orden)
export const searchOrdersThunk = createAsyncThunk(
    "orders/search",
    async (term: string) => {
        const data = await searchOrders(term);
        return Array.isArray(data) ? data : [];
    }
);

const ordersSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {
        setOrdersQuery(state, action: PayloadAction<string>) {
            state.query = action.payload;
        },
        clearOrdersQuery(state) {
            state.query = "";
            state.isSearching = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // 📦 Fetch All
            .addCase(fetchOrders.pending, (state) => {
                state.status = "loading";
                state.error = null;
                state.isSearching = false;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload.map((o: any) => ({
                    ...o,
                    estado: o.status || o.estado || "Pendiente",
                }));
                state.isSearching = false;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "Error cargando órdenes";
            })

            // 🔍 Search
            .addCase(searchOrdersThunk.pending, (state) => {
                state.status = "loading";
                state.error = null;
                state.isSearching = true;
            })
            .addCase(searchOrdersThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload.map((o: any) => ({
                    ...o,
                    estado: o.status || o.estado || "Pendiente",
                }));
                state.isSearching = true;
            })
            .addCase(searchOrdersThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "Error buscando órdenes";
                state.isSearching = true;
            });
    },
});

export default ordersSlice.reducer;

export const { setOrdersQuery, clearOrdersQuery } = ordersSlice.actions;

// 🎯 Selectores
export const selectOrders = (s: any) => s.orders.items as Order[];
export const selectOrdersStatus = (s: any) => s.orders.status as OrdersStatus;
export const selectOrdersError = (s: any) => s.orders.error as string | null;
export const selectOrdersQuery = (s: any) => s.orders.query as string;
export const selectOrdersIsSearching = (s: any) => s.orders.isSearching as boolean;
