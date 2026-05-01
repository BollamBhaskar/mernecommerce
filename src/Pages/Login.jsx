import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from "react-redux"
import { toast, Toaster } from "react-hot-toast"
import { loginUser } from '../Slices/authSlice'
import { useNavigate } from "react-router-dom"
import "./Login.css"

const Login = () => {
  const dispatch = useDispatch()
  const { loading, error, token, user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  // Track whether the user just submitted the form
  const [submitted, setSubmitted] = useState(false)

  // If already logged in, redirect immediately — don't show login
  useEffect(() => {
    if (token) {
      navigate(user?.role === "admin" ? "/dashboard" : "/home", { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = (e) => {
    e.preventDefault()
    if (!email || !password)
      return toast.error("Fill email and password")
    setSubmitted(true)
    dispatch(loginUser({ email, password }))
  }

  // Only navigate after a form submission, not on initial mount
  useEffect(() => {
    if (submitted && token) {
      toast.success("Login successful 🎉")
      setTimeout(() => {
        navigate(user?.role === "admin" ? "/dashboard" : "/home")
        setEmail("")
        setPassword("")
      }, 1000)
    }
  }, [token, submitted, user, navigate])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  return (
    <div className="login-container">
      <Toaster />

      {/* LEFT IMAGE PANEL */}
      <div className="login-left">
        <img
          src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a"
          alt="ecommerce"
        />
        <div className="login-left-badge">
          <h3>Welcome back<br />to ShopLux.</h3>
          <p>Your cart is waiting for you.</p>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="login-right">
        <div className="login-box">

          {/* Brand */}
          <div className="login-brand">
            <div className="login-brand-dot">🛍️</div>
            <span className="login-brand-name">ShopLux</span>
          </div>

          <h2>Welcome Back 👋</h2>
          <p className="login-sub">Sign in to continue shopping</p>

          <form onSubmit={handleLogin}>

            <div className="login-field">
              <label htmlFor="lg-email">Email Address</label>
              <input
                id="lg-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="login-field">
              <label htmlFor="lg-password">Password</label>
              <input
                id="lg-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>

          </form>

          <div className="login-divider">or</div>

          <p className="signup-text">
            Don't have an account?{" "}
            <span onClick={() => navigate("/")}>Sign Up</span>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Login
