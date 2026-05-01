import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const BASE_URL = "https://apis-17-cjb0.onrender.com"

async function safeBody(res) {
  try { return await res.json() }
  catch { return {} }
}

/**
 * Confirmed API behaviour:
 *
 * GET /orders
 *   200 → { message: "User orders fetched successfully", orders: [...] }
 *   200 → { orders: [] }  (when no orders)
 *
 * GET /orders/:id
 *   200 → { message: "Order fetched successfully", order: {...} }
 *   404 → { message: "Order not found" }
 *   400 → { message: "Invalid order ID" }
 */

export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const res = await fetch(`${BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await safeBody(res)
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch orders")
      return data.orders || []
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch orders")
    }
  }
)

export const fetchOrderById = createAsyncThunk(
  "orders/fetchById",
  async (orderId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await safeBody(res)
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch order")
      return data.order || null
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch order")
    }
  }
)

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    selectedOrder: null,
    loading: false,
    detailLoading: false,
    error: null,
  },
  reducers: {
    clearSelectedOrder: (state) => { state.selectedOrder = null },
    clearOrderError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchOrders.pending,   (state) => { state.loading = true;  state.error = null })
      .addCase(fetchOrders.fulfilled, (state, action) => { state.loading = false; state.items = action.payload })
      .addCase(fetchOrders.rejected,  (state, action) => { state.loading = false; state.error = action.payload })

      // FETCH BY ID
      .addCase(fetchOrderById.pending,   (state) => { state.detailLoading = true;  state.error = null })
      .addCase(fetchOrderById.fulfilled, (state, action) => { state.detailLoading = false; state.selectedOrder = action.payload })
      .addCase(fetchOrderById.rejected,  (state, action) => { state.detailLoading = false; state.error = action.payload })
  },
})

export const { clearSelectedOrder, clearOrderError } = orderSlice.actions
export default orderSlice.reducer
