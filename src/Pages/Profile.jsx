import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast, Toaster } from "react-hot-toast"
import { fetchProfile, updateProfile, clearProfileError } from "../Slices/ProfileSlice"
import { logout } from "../Slices/authSlice"
import { useNavigate } from "react-router-dom"
import TopNav from "../Components/TopNav"
import "./Profile.css"

const Profile = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading, updating, error } = useSelector((state) => state.profile)
  const authUser = useSelector((state) => state.auth.user)

  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [editing, setEditing]   = useState(false)

  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  // Populate form when profile loads
  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
    }
  }, [user])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearProfileError())
    }
  }, [error, dispatch])

  const handleUpdate = (e) => {
    e.preventDefault()
    const updates = {}
    if (name  !== user?.name)  updates.name  = name
    if (email !== user?.email) updates.email = email
    if (password)              updates.password = password

    if (Object.keys(updates).length === 0) {
      return toast.error("No changes to save")
    }

    dispatch(updateProfile(updates))
      .unwrap()
      .then(() => {
        toast.success("Profile updated successfully")
        setPassword("")
        setEditing(false)
      })
      .catch((err) => toast.error(err || "Update failed"))
  }

  const handleCancel = () => {
    if (user) { setName(user.name || ""); setEmail(user.email || "") }
    setPassword("")
    setEditing(false)
  }

  const displayName = user?.name || authUser?.name || "User"
  const displayEmail = user?.email || authUser?.email || ""
  const initials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="app-shell">
      <Toaster />
      <TopNav title="Profile" />
      <main className="page">
        <div className="container">
          <div className="profile-layout">

            {/* Left — Avatar card */}
            <div className="profile-avatar-card card">
              <div className="card-body">
                <div className="profile-avatar">{initials}</div>
                <h2 className="profile-name">{displayName}</h2>
                <p className="profile-email">{displayEmail}</p>
                <div className="profile-role-badge">
                  {user?.role || authUser?.role || "user"}
                </div>
                <div className="profile-meta">
                  <div className="profile-meta-row">
                    <span>Member since</span>
                    <span>
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                        : "—"}
                    </span>
                  </div>
                </div>
                {!editing && (
                  <button className="btn btn-primary profile-edit-btn" onClick={() => setEditing(true)}>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Right — Form card */}
            <div className="profile-form-card card">
              <div className="card-body">
                <h2 className="profile-form-title">
                  {editing ? "Edit Profile" : "Profile Details"}
                </h2>

                {loading ? (
                  <p style={{ color: "var(--muted)" }}>Loading…</p>
                ) : (
                  <form onSubmit={handleUpdate}>

                    <div className="profile-field">
                      <label>Full Name</label>
                      <input
                        className="input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!editing}
                        placeholder="Your name"
                      />
                    </div>

                    <div className="profile-field">
                      <label>Email Address</label>
                      <input
                        className="input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!editing}
                        placeholder="your@email.com"
                      />
                    </div>

                    {editing && (
                      <div className="profile-field">
                        <label>New Password <span className="profile-optional">(optional)</span></label>
                        <input
                          className="input"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 characters"
                        />
                      </div>
                    )}

                    {editing && (
                      <div className="profile-actions">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={updating}
                        >
                          {updating ? "Saving…" : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          className="btn"
                          onClick={handleCancel}
                          disabled={updating}
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile
