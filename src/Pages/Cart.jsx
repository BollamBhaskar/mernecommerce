import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast, Toaster } from "react-hot-toast"
import {
  fetchCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  clearCartError,
} from "../Slices/CartSlice"
import { createOrder, verifyPayment, resetPayment } from "../Slices/PaymentSlice"
import TopNav from "../Components/TopNav"
import "./Cart.css"

const Cart = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, loading, actionLoading, error: cartError } = useSelector((state) => state.cart)
  const { loading: payLoading, success: paySuccess } = useSelector((state) => state.payment)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  // Show cart errors
  useEffect(() => {
    if (cartError) {
      toast.error(cartError)
      dispatch(clearCartError())
    }
  }, [cartError, dispatch])

  // Payment success — server already cleared the cart, just re-fetch to sync state
  useEffect(() => {
    if (paySuccess) {
      toast.success("Payment successful! 🎉 Order placed.")
      dispatch(fetchCart())
      dispatch(resetPayment())
      setTimeout(() => navigate("/orders"), 1500)
    }
  }, [paySuccess, dispatch, navigate])

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId))
      .unwrap()
      .then(() => toast.success("Item removed"))
      .catch((err) => toast.error(err || "Failed to remove"))
  }

  const handleInc = (productId) => {
    dispatch(incrementQuantity(productId))
      .unwrap()
      .catch((err) => toast.error(err || "Failed to update"))
  }

  const handleDec = (productId, currentQty) => {
    if (currentQty <= 1) return
    dispatch(decrementQuantity(productId))
      .unwrap()
      .catch((err) => toast.error(err || "Failed to update"))
  }

  const handleClear = () => {
    dispatch(clearCart())
      .unwrap()
      .then(() => toast.success("Cart cleared"))
      .catch((err) => toast.error(err || "Failed to clear cart"))
  }

  // amount in paise (₹1 = 100 paise)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleCheckout = async () => {
    if (items.length === 0) return toast.error("Your cart is empty")

    try {
      // Step 1: create Razorpay order — server calculates amount from cart
      const order = await dispatch(createOrder()).unwrap()

      // Step 2: open Razorpay payment popup
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "ShopLux",
        description: "Order Payment",
        order_id: order.id,
        handler: async (response) => {
          // Step 3: verify payment on server
          try {
            await dispatch(verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            })).unwrap()
            // success handled by useEffect watching paySuccess
          } catch (err) {
            // Signature mismatch usually means server KEY_SECRET env var is wrong.
            // Payment DID go through on Razorpay — show warning but still refresh orders.
            toast.error(`Verification issue: ${err || "invalid signature"}. Contact support if amount was deducted.`, { duration: 6000 })
            dispatch(fetchCart()) // re-fetch in case server cleared cart
          }
        },
        prefill: {
          name:  user?.name  || "",
          email: user?.email || "",
        },
        theme: { color: "#6c63ff" },
        modal: {
          ondismiss: () => toast("Payment cancelled", { icon: "ℹ️" }),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", (response) => {
        toast.error(response.error?.description || "Payment failed")
      })
      rzp.open()
    } catch (err) {
      toast.error(err || "Could not initiate payment")
    }
  }

  const busy = actionLoading || payLoading

  return (
    <div className="app-shell">
      <Toaster />
      <TopNav title="My Cart" />
      <main className="page">
        <div className="container">

          <div className="cart-header">
            <div>
              <h1 className="page-title">Your Cart</h1>
              <p className="page-subtitle">
                {items.length} item{items.length !== 1 ? "s" : ""} in your cart
              </p>
            </div>
            {items.length > 0 && (
              <button className="btn btn-danger" onClick={handleClear} disabled={busy}>
                Clear Cart
              </button>
            )}
          </div>

          {loading ? (
            <div className="card"><div className="card-body">Loading cart…</div></div>
          ) : items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Add some products to get started.</p>
            </div>
          ) : (
            <div className="cart-layout">

              {/* Items */}
              <div className="cart-items">
                {items.map((item) => (
                  <div key={item.productId} className="cart-item card">

                    <div className="cart-item-img">
                      {item.image
                        ? <img src={item.image} alt={item.name} />
                        : <div className="cart-img-placeholder">📦</div>
                      }
                    </div>

                    <div className="cart-item-info">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <div className="cart-item-price">₹ {item.price}</div>

                      <div className="cart-qty-row">
                        <button
                          className="qty-btn"
                          onClick={() => handleDec(item.productId, item.quantity)}
                          disabled={busy || item.quantity <= 1}
                        >−</button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => handleInc(item.productId)}
                          disabled={busy}
                        >+</button>
                      </div>
                    </div>

                    <div className="cart-item-right">
                      <div className="cart-item-subtotal">₹ {item.price * item.quantity}</div>
                      <button
                        className="btn btn-danger cart-remove-btn"
                        onClick={() => handleRemove(item.productId)}
                        disabled={busy}
                      >
                        Remove
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="cart-summary card">
                <div className="card-body">
                  <h2 className="section-title">Order Summary</h2>

                  <div className="summary-rows">
                    {items.map((item) => (
                      <div key={item.productId} className="summary-row">
                        <span>{item.name} × {item.quantity}</span>
                        <span>₹ {item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="summary-total">
                    <span>Total</span>
                    <span>₹ {total}</span>
                  </div>

                  <button
                    className="btn btn-primary summary-checkout"
                    onClick={handleCheckout}
                    disabled={busy}
                  >
                    {payLoading ? "Processing…" : "Proceed to Checkout"}
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Cart
