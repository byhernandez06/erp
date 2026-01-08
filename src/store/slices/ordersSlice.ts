import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAllOrders, searchOrders } from "@/api/orders";

type Order = any;

type OrdersState = {
    items: Order[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    searchTerm: string;
};

const initialState: OrdersState = {
    items: [],
    status: "idle",
    error: null,
    searchTerm: "",
};

export const fetchOrders = createAsyncThunk("orders/fetchAll", async () => {
    const data = await getAllOrders();
    return Array.isArray(data) ? data : [];
});

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
        setSearchTerm(state, action: PayloadAction<string>) {
            state.searchTerm = action.payload;
        },
        clearSearch(state) {
            state.searchTerm = "";
        },
    },
    extraReducers: (builder) => {
        builder
            // fetch all
            .addCase(fetchOrders.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.status = "succeeded";
                // 👇 tu mapeo de estado “Pendiente”
                state.items = action.payload.map((o: any) => ({
                    ...o,
                    estado: o.status || o.estado || "Pendiente",
                }));
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "Error cargando órdenes";
            })

            // search
            .addCase(searchOrdersThunk.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(searchOrdersThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload.map((o: any) => ({
                    ...o,
                    estado: o.status || o.estado || "Pendiente",
                }));
            })
            .addCase(searchOrdersThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "Error buscando órdenes";
            });
    },
});

export default ordersSlice.reducer;

export const { setSearchTerm, clearSearch } = ordersSlice.actions;

// Selectores
export const selectOrders = (state: any) => state.orders.items as any[];
export const selectOrdersStatus = (state: any) => state.orders.status as OrdersState["status"];
export const selectOrdersError = (state: any) => state.orders.error as string | null;
export const selectOrdersSearchTerm = (state: any) => state.orders.searchTerm as string;
