import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useSelector } from "react-redux"

// Lazy load every page — only the current route's JS is downloaded on first load
const Login        = lazy(() => import("./Pages/Login"))
const Signup       = lazy(() => import("./Pages/Signup"))
const Home         = lazy(() => import("./Pages/Home"))
const Dashboard    = lazy(() => import("./Pages/Dashboard"))
const Cart         = lazy(() => import("./Pages/Cart"))
const Orders       = lazy(() => import("./Pages/Orders"))
const OrderDetail  = lazy(() => import("./Pages/OrderDetail"))
const Profile      = lazy(() => import("./Pages/Profile"))
const GetSingleProduct = lazy(() => import("./Components/GetSingleProduct"))

const Loader = () => (
  <div style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  }}>
    Loading…
  </div>
)

const App = () => {
  const { user, token } = useSelector((state) => state.auth)

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Signup />} />

          <Route
            path="/home"
            element={token ? <Home /> : <Navigate to="/login" />}
          />

          <Route
            path="/product/:id"
            element={token ? <GetSingleProduct /> : <Navigate to="/login" />}
          />

          <Route
            path="/cart"
            element={
              token && user?.role !== "admin"
                ? <Cart />
                : <Navigate to="/login" />
            }
          />

          <Route
            path="/orders"
            element={
              token && user?.role !== "admin"
                ? <Orders />
                : <Navigate to="/login" />
            }
          />

          <Route
            path="/orders/:id"
            element={
              token && user?.role !== "admin"
                ? <OrderDetail />
                : <Navigate to="/login" />
            }
          />

          <Route
            path="/profile"
            element={token ? <Profile /> : <Navigate to="/login" />}
          />

          <Route
            path="/dashboard"
            element={
              token && user?.role === "admin"
                ? <Dashboard />
                : <Navigate to="/login" />
            }
          />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
