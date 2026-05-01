import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { toast, Toaster } from "react-hot-toast"
import { registerUser } from '../Slices/authSlice'
import { useNavigate } from "react-router-dom"
import "./Signup.css"

const Signup = () => {
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector((state) => state.auth)
  const token = useSelector((state) => state.auth.token)
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  // Track whether the user just submitted the form
  const [submitted, setSubmitted] = useState(false)

  // If already logged in, redirect immediately — don't show signup
  useEffect(() => {
    if (token) {
      navigate(user?.role === "admin" ? "/dashboard" : "/home", { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name || !email || !password)
      return toast.error("Please fill all the details")
    setSubmitted(true)
    dispatch(registerUser({ name, email, password }))
  }

  // Only navigate after a form submission, not on initial mount
  useEffect(() => {
    if (submitted && user) {
      toast.success("Account created 🎉")
      setTimeout(() => navigate("/login"), 1000)
    }
  }, [user, submitted, navigate])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  return (
    <div className="signup-container">
      <Toaster />

      {/* LEFT IMAGE PANEL */}
      <div className="signup-left">
        <img
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da"
          alt="ecommerce"
        />
        <div className="signup-left-badge">
          <h3>Shop the latest<br />trends today.</h3>
          <p>Thousands of products. One account.</p>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="signup-right">
        <div className="signup-box">

          {/* Brand */}
          <div className="signup-brand">
            <div className="signup-brand-dot">🛍️</div>
            <span className="signup-brand-name">ShopLux</span>
          </div>

          <h2>Create Account</h2>
          <p className="signup-sub">Join us and start shopping today</p>

          <form onSubmit={handleSubmit}>

            <div className="signup-field">
              <label htmlFor="su-name">Full Name</label>
              <input
                id="su-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="signup-field">
              <label htmlFor="su-email">Email Address</label>
              <input
                id="su-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={error ? "error-input" : ""}
              />
            </div>

            <div className="signup-field">
              <label htmlFor="su-password">Password</label>
              <input
                id="su-password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </button>

          </form>

          <div className="signup-divider">or</div>

          <p className="login-text">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Sign in</span>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Signup
