import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const BASE_URL = "https://apis-17-cjb0.onrender.com"

async function safeBody(res) {
  try { return await res.json() }
  catch { return {} }
}

function authHeader(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

/**
 * Real API response shape (confirmed by testing):
 *
 * GET /cart  →  { cart: { items: [{ product: { _id, title, price, image:{url} }, quantity, _id }], ... }, total }
 * POST /cart →  { message, cart: { items: [{ product: "<id_string>", quantity, _id }] } }  ← product NOT populated
 * PATCH /cart/quantity → { message, cart: { items: [...] } }  ← uses action:"inc"|"dec", NOT quantity number
 * DELETE /cart/item    → { message, cart: { items: [...] } }
 * DELETE /cart         → { message: "Cart cleared" }  ← no cart data
 *
 * So after every mutation we re-fetch GET /cart which always returns populated items.
 */
async function refetchCart(token) {
  const res = await fetch(`${BASE_URL}/cart`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await safeBody(res)
  if (!res.ok) throw new Error(data.message || "Failed to fetch cart")

  const rawItems = data.cart?.items ?? []

  return rawItems.map((item) => {
    const p = item.product
    // product is a populated object on GET
    const isPopulated = p && typeof p === "object"
    return {
      productId: isPopulated ? (p._id || p.id) : String(p),
      name:      isPopulated ? (p.title || p.name || "Product") : "Product",
      price:     isPopulated ? (p.price ?? 0) : 0,
      image:     isPopulated ? (p.image?.url || p.image || "") : "",
      quantity:  item.quantity ?? 1,
    }
  })
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { getState, rejectWithValue }) => {
    try {
      return await refetchCart(getState().auth.token)
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch cart")
    }
  }
)

export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ productId, quantity = 1 }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const qty = Number(quantity) || 1
      const res = await fetch(`${BASE_URL}/cart`, {
        method: "POST",
        headers: authHeader(token),
        // Keep payload compatible with older/newer backend field names.
        body: JSON.stringify({ productId, product: productId, quantity: qty, qty }),
      })
      const data = await safeBody(res)
      if (!res.ok) return rejectWithValue(data.message || "Failed to add to cart")
      // re-fetch so we get populated product details
      return await refetchCart(token)
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to add to cart")
    }
  }
)

export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const res = await fetch(`${BASE_URL}/cart/item`, {
        method: "DELETE",
        headers: authHeader(token),
        body: JSON.stringify({ productId }),
      })
      const data = await safeBody(res)
      if (!res.ok) return rejectWithValue(data.message || "Failed to remove item")
      return await refetchCart(token)
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to remove item")
    }
  }
)

// The API uses action:"inc" or action:"dec" — NOT a quantity number
export const incrementQuantity = createAsyncThunk(
  "cart/increment",
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const res = await fetch(`${BASE_URL}/cart/quantity`, {
        method: "PATCH",
        headers: authHeader(token),
        body: JSON.stringify({ productId, action: "inc" }),
      })
      const data = await safeBody(res)
      if (!res.ok) return rejectWithValue(data.message || "Failed to update quantity")
      return await refetchCart(token)
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to update quantity")
    }
  }
)

export const decrementQuantity = createAsyncThunk(
  "cart/decrement",
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const res = await fetch(`${BASE_URL}/cart/quantity`, {
        method: "PATCH",
        headers: authHeader(token),
        body: JSON.stringify({ productId, action: "dec" }),
      })
      const data = await safeBody(res)
      if (!res.ok) return rejectWithValue(data.message || "Failed to update quantity")
      return await refetchCart(token)
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to update quantity")
    }
  }
)

export const clearCart = createAsyncThunk(
  "cart/clear",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const res = await fetch(`${BASE_URL}/cart`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await safeBody(res)
      if (!res.ok) return rejectWithValue(data.message || "Failed to clear cart")
      return [] // clear returns no cart data, just return empty
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to clear cart")
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearCartError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    const onPending       = (state) => { state.actionLoading = true;  state.error = null }
    const onFulfilled     = (state, action) => { state.actionLoading = false; state.items = action.payload }
    const onRejected      = (state, action) => { state.actionLoading = false; state.error = action.payload }

    builder
      .addCase(fetchCart.pending,       (state) => { state.loading = true; state.error = null })
      .addCase(fetchCart.fulfilled,     (state, action) => { state.loading = false; state.items = action.payload })
      .addCase(fetchCart.rejected,      (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(addToCart.pending,       onPending)
      .addCase(addToCart.fulfilled,     onFulfilled)
      .addCase(addToCart.rejected,      onRejected)

      .addCase(removeFromCart.pending,  onPending)
      .addCase(removeFromCart.fulfilled,onFulfilled)
      .addCase(removeFromCart.rejected, onRejected)

      .addCase(incrementQuantity.pending,   onPending)
      .addCase(incrementQuantity.fulfilled, onFulfilled)
      .addCase(incrementQuantity.rejected,  onRejected)

      .addCase(decrementQuantity.pending,   onPending)
      .addCase(decrementQuantity.fulfilled, onFulfilled)
      .addCase(decrementQuantity.rejected,  onRejected)

      .addCase(clearCart.pending,       onPending)
      .addCase(clearCart.fulfilled,     onFulfilled)
      .addCase(clearCart.rejected,      onRejected)
  },
})

export const { clearCartError } = cartSlice.actions
export default cartSlice.reducer
