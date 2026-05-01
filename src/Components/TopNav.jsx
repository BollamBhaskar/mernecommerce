import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logout } from "../Slices/authSlice"

const TopNav = ({ title = "Shop" }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const cartItems = useSelector((state) => state.cart.items)
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  return (
    <header className="nav">
      <div className="container nav-inner">
        <div className="brand" role="button" tabIndex={0} onClick={() => navigate("/home")}>
          <div className="brand-badge" aria-hidden="true" />
          <div>
            <div style={{ fontSize: 14, color: "var(--muted)" }}>{title}</div>
            <div style={{ marginTop: 1, fontSize: 16 }}>Ecommerce</div>
          </div>
        </div>

        <div className="nav-actions">
          <button className="btn btn-ghost" onClick={() => navigate("/home")}>
            Home
          </button>
          {user?.role === "admin" && (
            <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
          )}
          {user?.role !== "admin" && (
            <button className="btn btn-ghost cart-nav-btn" onClick={() => navigate("/cart")}>
              🛒 Cart
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </button>
          )}
          {user?.role !== "admin" && (
            <button className="btn btn-ghost" onClick={() => navigate("/orders")}>
              📦 Orders
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => navigate("/profile")}>
            👤 Profile
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default TopNav