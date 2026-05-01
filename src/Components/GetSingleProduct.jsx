import { useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { useParams, useNavigate } from "react-router-dom"
import { fetchSingleProduct } from '../Slices/ProductSlice'
import TopNav from "./TopNav"
import "./GetSingleProduct.css"

const GetSingleProduct = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { singleProduct, loading, error } = useSelector(
    (state) => state.products
  )

  useEffect(() => {
    dispatch(fetchSingleProduct(id))
  }, [dispatch, id])

  if (loading) return (
    <div className="app-shell">
      <TopNav title="Product" />
      <main className="page">
        <div className="container">
          <div className="sp-skeleton">
            <div className="sp-skeleton-img" />
            <div className="sp-skeleton-body">
              <div className="sp-skeleton-line sp-skeleton-line--title" />
              <div className="sp-skeleton-line" />
              <div className="sp-skeleton-line sp-skeleton-line--short" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )

  if (error || !singleProduct) return (
    <div className="app-shell">
      <TopNav title="Product" />
      <main className="page">
        <div className="container">
          <div className="card card-body">{error || "No product found."}</div>
        </div>
      </main>
    </div>
  )

  return (
    <div className="app-shell">
      <TopNav title="Product details" />
      <main className="page">
        <div className="container">

          <button className="btn btn-ghost sp-back" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <div className="sp-layout">

            {/* IMAGE */}
            <div className="sp-image-wrap">
              {singleProduct.image?.url ? (
                <img
                  src={singleProduct.image.url}
                  alt={singleProduct.title}
                  className="sp-image"
                />
              ) : (
                <div className="sp-no-image">No image</div>
              )}
            </div>

            {/* DETAILS */}
            <div className="sp-details">

              <p className="sp-category">Product Details</p>
              <h1 className="sp-title">{singleProduct.title}</h1>
              <p className="sp-desc">{singleProduct.description}</p>

              <div className="sp-price-block">
                <span className="sp-price">₹ {singleProduct.price}</span>
                <span className="sp-badge">In Stock</span>
              </div>

              <div className="sp-divider" />

              <div className="sp-meta">
                <div className="sp-meta-item">
                  <span className="sp-meta-label">Shipping</span>
                  <span className="sp-meta-value">Free delivery</span>
                </div>
                <div className="sp-meta-item">
                  <span className="sp-meta-label">Returns</span>
                  <span className="sp-meta-value">30-day returns</span>
                </div>
                <div className="sp-meta-item">
                  <span className="sp-meta-label">Payment</span>
                  <span className="sp-meta-value">Secure checkout</span>
                </div>
              </div>

              <div className="sp-divider" />

              <div className="sp-actions">
                <button className="btn btn-primary sp-btn-buy">
                  Buy Now
                </button>
                <button className="btn sp-btn-cart">
                  Add to Cart
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default GetSingleProduct
