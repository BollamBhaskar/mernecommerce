import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast, Toaster } from "react-hot-toast"
import { fetchOrders, clearOrderError } from "../Slices/OrderSlice"
import TopNav from "../Components/TopNav"
import "./Orders.css"

const statusColors = {
  paid:       { bg: "rgba(51,214,159,0.15)",  color: "#33d69f" },
  processing: { bg: "rgba(108,99,255,0.15)",  color: "#8b84ff" },
  shipped:    { bg: "rgba(255,193,7,0.15)",   color: "#ffc107" },
  delivered:  { bg: "rgba(51,214,159,0.2)",   color: "#33d69f" },
  cancelled:  { bg: "rgba(255,77,79,0.15)",   color: "#ff4d4f" },
  pending:    { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" },
}

const StatusBadge = ({ status }) => {
  const s = statusColors[status] || statusColors.pending
  return (
    <span className="order-status-badge" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

const Orders = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items: orders, loading, error } = useSelector((state) => state.orders)

  useEffect(() => {
    dispatch(fetchOrders())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearOrderError())
    }
  }, [error, dispatch])

  return (
    <div className="app-shell">
      <Toaster />
      <TopNav title="My Orders" />
      <main className="page">
        <div className="container">

          <div className="orders-header">
            <h1 className="page-title">My Orders</h1>
            <p className="page-subtitle">Track all your purchases and payment history</p>
          </div>

          {loading ? (
            <div className="card"><div className="card-body">Loading orders…</div></div>
          ) : orders.length === 0 ? (
            <div className="orders-empty">
              <div className="orders-empty-icon">📦</div>
              <h2>No orders yet</h2>
              <p>Complete a purchase to see your orders here.</p>
              <button className="btn btn-primary" onClick={() => navigate("/home")}>
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="order-card card"
                  onClick={() => navigate(`/orders/${order._id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="order-card-top">
                    <div>
                      <div className="order-id">Order #{order._id.slice(-8).toUpperCase()}</div>
                      <div className="order-date">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="order-card-items">
                    {order.items.slice(0, 3).map((item, i) => (
                      <span key={i} className="order-item-chip">
                        {item.product?.title || item.product?.name || `Item ${i + 1}`} × {item.quantity}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="order-item-chip muted">+{order.items.length - 3} more</span>
                    )}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-total">₹ {order.totalAmount}</div>
                    <span className="order-view-link">View Details →</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default Orders
