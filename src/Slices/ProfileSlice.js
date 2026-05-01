import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const BASE_URL = "https://apis-17-cjb0.onrender.com"

async function safeBody(res) {
  try { return await res.json() }
  catch { return {} }
}

/**
 * Confirmed API behaviour:
 *
 * GET /profile
 *   200 → { user: { _id, name, email, role, createdAt, updatedAt } }
 *   404 → { message: "User not found" }
 *
 * PUT /profile  { name?, email?, password? }
 *   200 → { message: "Profile updated", user: {...} }
 *   400 → { message: "Name must be at least 2 characters" | "Invalid email format" | "Password must be at least 6 characters" | "No valid fields provided to update" }
 *   409 → { message: "Email already in use" }
 */

export const fetchProfile = createAsyncThunk(
  "profile/fetch",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const res = await fetch(`${BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await safeBody(res)
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch profile")
      return data.user
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch profile")
    }
  }
)

export const updateProfile = createAsyncThunk(
  "profile/update",
  async (updates, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const res = await fetch(`${BASE_URL}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })
      const data = await safeBody(res)
      if (!res.ok) return rejectWithValue(data.message || "Failed to update profile")
      return data.user
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to update profile")
    }
  }
)

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    user: null,
    loading: false,
    updating: false,
    error: null,
  },
  reducers: {
    clearProfileError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchProfile.pending,   (state) => { state.loading = true;  state.error = null })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.loading = false; state.user = action.payload })
      .addCase(fetchProfile.rejected,  (state, action) => { state.loading = false; state.error = action.payload })

      // UPDATE
      .addCase(updateProfile.pending,   (state) => { state.updating = true;  state.error = null })
      .addCase(updateProfile.fulfilled, (state, action) => { state.updating = false; state.user = action.payload })
      .addCase(updateProfile.rejected,  (state, action) => { state.updating = false; state.error = action.payload })
  },
})

export const { clearProfileError } = profileSlice.actions
export default profileSlice.reducer
