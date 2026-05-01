import { useState } from "react"
import { useDispatch } from "react-redux"
import { addProduct, fetchProducts } from "../Slices/ProductSlice"
import { toast } from "react-hot-toast"
import "./AddNewProduct.css"

const AddNewProduct = ({ close }) => {
  const dispatch = useDispatch()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("1")
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title || !description || !price || stock === "")
      return toast.error("Please fill all fields")

    if (!image)
      return toast.error("Please select a product image")

    const priceNumber = Number(price)
    if (!Number.isFinite(priceNumber) || priceNumber <= 0)
      return toast.error("Please enter a valid price")
    const stockNumber = Number(stock)
    if (!Number.isInteger(stockNumber) || stockNumber < 0)
      return toast.error("Please enter valid stock")

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("price", String(priceNumber))
    formData.append("stock", String(stockNumber))
    formData.append("image", image)

    try {
      setLoading(true)
      await dispatch(addProduct(formData)).unwrap()
      toast.success("Product added successfully")
      dispatch(fetchProducts())
      setTitle("")
      setDescription("")
      setPrice("")
      setStock("1")
      setImage(null)
      setPreview(null)
      close?.()
    } catch (err) {
      toast.error(String(err || "Add failed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="anp-form" onSubmit={handleSubmit}>

      {/* Image upload zone */}
      <label className="anp-upload-zone" htmlFor="anp-file-input">
        {preview ? (
          <img src={preview} alt="preview" className="anp-preview" />
        ) : (
          <div className="anp-upload-placeholder">
            <span className="anp-upload-icon">🖼️</span>
            <span className="anp-upload-label">Click to upload product image</span>
            <span className="anp-upload-hint">PNG, JPG, WEBP — required</span>
          </div>
        )}
        <input
          id="anp-file-input"
          type="file"
          accept="image/*"
          onChange={handleImage}
          style={{ display: "none" }}
        />
      </label>

      {/* Fields */}
      <div className="anp-fields">
        <div className="anp-field">
          <label className="anp-label" htmlFor="anp-title">Title</label>
          <input
            id="anp-title"
            className="input anp-input"
            placeholder="e.g. Wireless Headphones"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="anp-field">
          <label className="anp-label" htmlFor="anp-desc">Description</label>
          <textarea
            id="anp-desc"
            className="textarea anp-input"
            placeholder="Short product description…"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="anp-field">
          <label className="anp-label" htmlFor="anp-price">Price ($)</label>
          <input
            id="anp-price"
            className="input anp-input"
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="anp-field">
          <label className="anp-label" htmlFor="anp-stock">Stock</label>
          <input
            id="anp-stock"
            className="input anp-input"
            placeholder="0"
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="anp-actions">
        <button
          type="button"
          className="btn anp-btn-cancel"
          onClick={() => close?.()}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary anp-btn-submit"
          disabled={loading}
        >
          {loading ? (
            <span className="anp-spinner" />
          ) : (
            "Add Product"
          )}
        </button>
      </div>

    </form>
  )
}

export default AddNewProduct
