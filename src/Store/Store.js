import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../Slices/authSlice"
import productReducer from "../Slices/ProductSlice"
import cartReducer from "../Slices/CartSlice"
import paymentReducer from "../Slices/PaymentSlice"
import orderReducer from "../Slices/OrderSlice"
import profileReducer from "../Slices/ProfileSlice"

const Store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    payment: paymentReducer,
    orders: orderReducer,
    profile: profileReducer,
  }
})

export default Store