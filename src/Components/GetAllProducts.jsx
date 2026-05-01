import { useEffect } from 'react'
import { useSelector, useDispatch } from "react-redux"
import { fetchProducts } from '../Slices/ProductSlice'
import { addToCart } from '../Slices/CartSlice'
import { useNavigate } from "react-router-dom"
import { toast, Toaster } from "react-hot-toast"

import DeleteProduct from "./DeleteProduct"
import UpdateProduct from "./UpdateProducts"

const GetAllProducts = () => {
  const { items, loading, error } = useSelector((state) => state.products)
  const { user } = useSelector((state) => state.auth)
  const { actionLoading } = useSelector((state) => state.cart)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const handleAddToCart = async (productId) => {
    if (!productId) {
      toast.error("Unable to add this product right now")
      return
    }
    const res = await dispatch(addToCart({ productId, quantity: 1 }))
    if (!res.error) toast.success("Added to cart 🛒")
    else toast.error(res.payload || "Failed to add")
  }

  if (loading) return <div className="card"><div className="card-body">Loading…</div></div>
  if (error) return <div className="card"><div className="card-body">{error}</div></div>

  return (
    <>
      <Toaster />
      <div className="grid grid-products">
        {items.map((product) => (
          (() => {
            const productId = product._id || product.id
            const hasKnownStock = Number.isFinite(Number(product.stock))
            const outOfStock = hasKnownStock && Number(product.stock) <= 0
            return (
          <div key={product._id || product.id} className="card product-card">
            <div
              className="product-media"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/product/${productId}`)}
            >
              {product.image?.url ? (
                <img src={product.image?.url} alt={product.title} />
              ) : (
                <div className="chip">No image</div>
              )}
            </div>

            <div className="card-body">
              <h3 className="product-title">{product.title}</h3>
              <p className="product-desc">{product.description}</p>

              <div className="price-row">
                <div className="price">₹ {product.price}</div>
                <button className="btn btn-ghost" onClick={() => navigate(`/product/${productId}`)}>
                  View
                </button>
              </div>

              {user?.role === "admin" ? (
                <div className="actions-row">
                  <UpdateProduct product={product} />
                  <DeleteProduct id={product._id} title={product.title} />
                </div>
              ) : (
                <div className="actions-row">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAddToCart(productId)}
                    disabled={actionLoading || outOfStock}
                  >
                    {outOfStock ? "Out of Stock" : "🛒 Add to Cart"}
                  </button>
                </div>
              )}
            </div>
          </div>
            )
          })()
        ))}
      </div>
    </>
  )
}

export default GetAllProducts