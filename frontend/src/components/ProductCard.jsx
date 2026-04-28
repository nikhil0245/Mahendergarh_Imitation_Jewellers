import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { useSavedProducts } from "../context/SavedProductsContext";
import {
  getProductFallbackImage,
  getProductImagePath,
  getProductImageUrl,
} from "../utils/productImages";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { isSaved, toggleSaved } = useSavedProducts();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);

  const imagePaths = product.images?.length > 0 ? product.images : [getProductImagePath(product)];
  const imageUrl = getProductImageUrl(product, currentImageIndex);

  useEffect(() => {
    if (!isHovering || imagePaths.length <= 1) {
      return undefined;
    }

    let transitionTimeoutId;
    const intervalId = window.setInterval(() => {
      setIsImageTransitioning(true);

      transitionTimeoutId = window.setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imagePaths.length);
        setIsImageTransitioning(false);
      }, 320);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
      if (transitionTimeoutId) {
        window.clearTimeout(transitionTimeoutId);
      }
    };
  }, [isHovering, imagePaths.length]);

  useEffect(() => {
    if (!isHovering) {
      setIsImageTransitioning(false);
      setCurrentImageIndex(0);
    }
  }, [isHovering]);

  // 🔥 Add to Cart
  const handleAdd = async () => {
    try {
      setLoading(true);
      await addToCart(product._id, 1);

      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    } catch (error) {
      console.error("Add to Cart Error:", error);
      alert(error.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 ✅ FINAL Buy Now (FIXED)
  const handleBuyNow = () => {
    navigate("/checkout", {
      state: {
        buyNowItem: product,
      },
    });
  };

  const handleToggleSaved = () => {
    try {
      toggleSaved(product._id);
    } catch (error) {
      alert(error.message || "Please log in first.");
    }
  };

  // 🔥 PRICE CHECK
  const hasDiscount =
    product.originalPrice &&
    Number(product.originalPrice) > Number(product.price);

  return (
    <div className="card product-card">
      {/* IMAGE */}
      <div
        className="product-media"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <button
          className={`save-product-btn ${isSaved(product._id) ? "saved" : ""}`}
          onClick={handleToggleSaved}
          type="button"
          aria-label={
            isSaved(product._id)
              ? "Remove from saved products"
              : "Save product"
          }
          title={isSaved(product._id) ? "Remove from saved products" : "Save product"}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" role="img"><path d="M12 21.35 10.55 20C5.4 15.24 2 12.09 2 8.25 2 5.26 4.24 3 7.2 3c1.67 0 3.27.79 4.3 2.03A5.66 5.66 0 0 1 15.8 3C18.76 3 21 5.26 21 8.25c0 3.84-3.4 6.99-8.55 11.76L12 21.35Z" fill="currentColor"/></svg>
        </button>

        <Link to={`/product/${product._id}`} className="product-image-link">
          <img
            src={imageUrl}
            alt={product.name}
            className={`product-image ${isImageTransitioning ? "is-transitioning" : ""}`}
            onError={(event) => {
              event.currentTarget.src = getProductFallbackImage(product);
            }}
          />
        </Link>
      </div>

      {/* CONTENT */}
      <div className="card-body">
        <h3>{product.name}</h3>
        <p className="muted">{product.category}</p>
        {/* PRICE */}
        <div className="price-box">
          <span className="new-price">Rs. {product.price}</span>

          {hasDiscount && (
            <span className="old-price">Rs. {product.originalPrice}</span>
          )}
        </div>

        {/* BUTTONS */}
        <div className="btn-group">
          <button
            className={`button add-btn ${added ? "added" : ""}`}
            onClick={handleAdd}
            disabled={loading}
          >
            {added ? "Added ✓" : loading ? "Adding..." : "Add to Cart"}
          </button>

          <button className="button buy-btn" onClick={handleBuyNow}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
