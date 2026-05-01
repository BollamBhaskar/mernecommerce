import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const BASE_URL = "https://apis-17-cjb0.onrender.com"

async function safeBody(res) {
  try { return await res.json() }
  catch { return {} }
}

/**
 * Actual backend behaviour (read from source):
 *
 * POST /checkout  (no body needed — server calculates total from cart)
 *   200 → { message: "Checkout initiated", order: { id, amount, currency, ... }, totalAmount }
 *   400 → { message: "Cart is empty" | "Insufficient stock for ..." | "Invalid cart total" }
 *
 * POST /verifypayment  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *   200 → { message: "Payment verified and order placed", orderId }
 *   401 → { message: "Payment verification failed: invalid signature" }
 *   400 → { message: "Missing payment verification fields" | "Cart is empty or already processed" }
 *
 * NOTE: server clears the cart itself after successful verify — no need to call clearCart from frontend
 */

// Step 1 — create Razorpay order on the server
export const createOrder = createAsyncThunk(
  "payment/createOrder",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const res = await fetch(`${BASE_URL}/checkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // server calculates amount from cart
      })
      const data = await safeBody(res)
      // success: server returns { message: "Checkout initiated", order, totalAmount }
      if (!res.ok || !data.order) {
        return rejectWithValue(data.message || "Failed to create order")
      }
      return data.order // { id, amount, currency, ... }
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to create order")
    }
  }
)

// Step 2 — verify payment after Razorpay popup succeeds
export const verifyPayment = createAsyncThunk(
  "payment/verify",
  async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const res = await fetch(`${BASE_URL}/verifypayment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }),
      })
      const data = await safeBody(res)
      // success: server returns { message: "Payment verified and order placed", orderId }
      if (!res.ok || !data.orderId) {
        return rejectWithValue(data.message || "Payment verification failed")
      }
      return data // { message, orderId }
    } catch (err) {
      return rejectWithValue(err?.message || "Payment verification failed")
    }
  }
)

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    loading: false,
    success: false,
    orderId: null,
    error: null,
  },
  reducers: {
    resetPayment: (state) => {
      state.loading = false
      state.success = false
      state.orderId = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending,   (state) => { state.loading = true;  state.error = null; state.success = false })
      .addCase(createOrder.fulfilled, (state) => { state.loading = false })
      .addCase(createOrder.rejected,  (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(verifyPayment.pending,   (state) => { state.loading = true;  state.error = null })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.orderId = action.payload.orderId
      })
      .addCase(verifyPayment.rejected,  (state, action) => { state.loading = false; state.error = action.payload })
  },
})

export const { resetPayment } = paymentSlice.actions
export default paymentSlice.reducer
