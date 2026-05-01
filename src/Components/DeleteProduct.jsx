import { useState } from "react"
import { useDispatch } from "react-redux"
import { deleteProduct } from "../Slices/ProductSlice"
import { toast } from "react-hot-toast"
import "./DeleteProduct.css"

const DeleteProduct = ({ id, title }) => {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await dispatch(deleteProduct(id)).unwrap()
      toast.success("Product deleted")
      setOpen(false)
    } catch (err) {
      toast.error(err || "Failed to delete")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button className="btn btn-danger" onClick={() => setOpen(true)}>
        Delete
      </button>

      {open && (
        <div className="confirm-overlay" onClick={() => !loading && setOpen(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>

            <div className="confirm-icon">🗑️</div>
            <h3 className="confirm-title">Delete Product</h3>
            <p className="confirm-msg">
              Are you sure you want to delete
              {title ? <> <strong>"{title}"</strong></> : " this product"}?
              <br />
              <span className="confirm-warn">This action cannot be undone.</span>
            </p>

            <div className="confirm-actions">
              <button
                className="btn"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default DeleteProduct
