import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { toast, Toaster } from "react-hot-toast"
import { fetchOrderById, clearSelectedOrder, clearOrderError } from "../Slices/OrderSlice"
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

const OrderDetail = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { selectedOrder: order, detailLoading, error } = useSelector((state) => state.orders)

  useEffect(() => {
    dispatch(fetchOrderById(id))
    return () => dispatch(clearSelectedOrder())
  }, [id, dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearOrderError())
    }
  }, [error, dispatch])

  return (
    <div className="app-shell">
      <Toaster />
      <TopNav title="Order Details" />
      <main className="page">
        <div className="container">

          <div className="order-detail-back" onClick={() => navigate("/orders")}>
            ← Back to Orders
          </div>

          {detailLoading ? (
            <div className="card"><div className="card-body">Loading order…</div></div>
          ) : !order ? (
            <div className="card"><div className="card-body">Order not found.</div></div>
          ) : (
            <>
              {/* Header */}
              <div className="order-detail-header">
                <div>
                  <h1 className="order-detail-id">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h1>
                  <div className="order-detail-date">
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="order-detail-grid">

                {/* Items */}
                <div className="card">
                  <div className="card-body">
                    <p className="order-detail-section-title">Items Ordered</p>
                    <div className="order-items-table">
                      {order.items.map((item, i) => (
                        <div key={i} className="order-item-row">
                          <div>
                            <div className="order-item-row-name">
                              {item.product?.title || item.product?.name || `Product ${i + 1}`}
                            </div>
                            <div className="order-item-row-qty">Qty: {item.quantity}</div>
                          </div>
                          <div className="order-item-row-price">
                            ₹ {item.price * item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="card">
                  <div className="card-body">
                    <p className="order-detail-section-title">Payment Summary</p>

                    <div className="order-summary-rows">
                      {order.items.map((item, i) => (
                        <div key={i} className="order-summary-row">
                          <span>
                            {item.product?.title || item.product?.name || `Item ${i + 1}`} × {item.quantity}
                          </span>
                          <span>₹ {item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-grand-total">
                      <span>Total Paid</span>
                      <span>₹ {order.totalAmount}</span>
                    </div>

                    {/* Payment IDs */}
                    <div className="order-meta">
                      {order.razorpayOrderId && (
                        <div className="order-meta-row">
                          <span>Razorpay Order</span>
                          <span>{order.razorpayOrderId}</span>
                        </div>
                      )}
                      {order.paymentId && (
                        <div className="order-meta-row">
                          <span>Payment ID</span>
                          <span>{order.paymentId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default OrderDetail
