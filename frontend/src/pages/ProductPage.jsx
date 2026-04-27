import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL, request } from "../api";
import { useCart } from "../context/CartContext";
import { useSavedProducts } from "../context/SavedProductsContext";
import { useAuth } from "../context/AuthContext";

const RECENT_VIEWS_KEY = "recentViews";

const toImageUrl = (path) => {
  if (!path) return "/placeholder.png";
  return path.startsWith("http") ? path : `${API_URL}${path}`;
};

const renderStars = (ratingValue = 0) => {
  const fullStars = Math.round(Number(ratingValue) || 0);
  return Array.from({ length: 5 }, (_, index) => (
    <span key={index} aria-hidden="true">
      {index < fullStars ? "★" : "☆"}
    </span>
  ));
};

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isSaved, toggleSaved } = useSavedProducts();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewPhotos, setReviewPhotos] = useState([]);
  const [reviewPhotoPreviews, setReviewPhotoPreviews] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState("");
  const [reviewSort, setReviewSort] = useState("newest");
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [selectedReviewImage, setSelectedReviewImage] = useState("");

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await request(`/api/products/${id}`);
      setProduct(data);
      setSelectedImageIndex(0);
    } catch (err) {
      setError(err.message || "Failed to load product.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    try {
      const stored = localStorage.getItem(RECENT_VIEWS_KEY);
      const recentIds = stored ? JSON.parse(stored) : [];
      const nextIds = [id, ...recentIds.filter((itemId) => itemId !== id)].slice(0, 20);
      localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(nextIds));
    } catch {
      // no-op: keep UX intact even if localStorage is unavailable
    }
  }, [id]);

  const images = useMemo(() => {
    if (!product?.images || product.images.length === 0) {
      return ["/placeholder.png"];
    }
    return product.images;
  }, [product]);

  const selectedImage = images[selectedImageIndex] || images[0];
  const hasDiscount =
    product?.originalPrice && Number(product.originalPrice) > Number(product.price);

  const maxQty = Math.max(1, Math.min(product?.countInStock || 1, 10));
  const reviews = product?.reviews || [];
  const averageRating = reviews.length
    ? reviews.reduce((total, item) => total + Number(item.rating || 0), 0) / reviews.length
    : 0;
  const roundedAverage = Number(averageRating.toFixed(2));
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((item) => Number(item.rating) === stars).length,
  }));
  const sortedReviews = useMemo(() => {
    const copy = [...reviews];
    if (reviewSort === "highest") {
      return copy.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }
    if (reviewSort === "lowest") {
      return copy.sort((a, b) => Number(a.rating || 0) - Number(b.rating || 0));
    }
    return copy.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [reviews, reviewSort]);

  const handleAddToCart = async () => {
    if (!product?._id) return;

    try {
      setAddingToCart(true);
      await addToCart(product._id, quantity);
      setAddSuccess(true);
      window.setTimeout(() => setAddSuccess(false), 1200);
    } catch (err) {
      alert(err.message || "Failed to add item.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    navigate("/checkout", {
      state: {
        buyNowItem: product,
      },
    });
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!user) {
      alert("Please log in to write a review.");
      return;
    }

    try {
      setSubmittingReview(true);
      const payload = new FormData();
      payload.append("rating", String(reviewRating));
      payload.append("comment", reviewComment.trim());
      reviewPhotos.forEach((file) => {
        payload.append("images", file);
      });

      await request(`/api/products/${id}/reviews`, {
        method: "POST",
        body: payload,
      });

      setReviewComment("");
      setReviewRating(5);
      setReviewPhotos([]);
      setReviewPhotoPreviews([]);
      setIsWriteReviewOpen(false);
      await fetchProduct();
    } catch (err) {
      alert(err.message || "Failed to save review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!reviewId) return;

    const confirmed = window.confirm("Delete this review?");
    if (!confirmed) return;

    try {
      setDeletingReviewId(reviewId);
      await request(`/api/products/${id}/reviews/${reviewId}`, {
        method: "DELETE",
      });
      await fetchProduct();
    } catch (err) {
      alert(err.message || "Failed to delete review.");
    } finally {
      setDeletingReviewId("");
    }
  };

  useEffect(() => {
    if (!reviewPhotos.length) {
      setReviewPhotoPreviews([]);
      return;
    }

    const localUrls = reviewPhotos.map((file) => URL.createObjectURL(file));
    setReviewPhotoPreviews(localUrls);
    return () => {
      localUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [reviewPhotos]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedReviewImage("");
      }
    };

    if (selectedReviewImage) {
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedReviewImage]);

  return (
    <div className="container page product-page">
      <Link to="/" className="detail-back-link">
        ← Back to products
      </Link>

      {loading && <p>Loading product...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && product && (
        <div className="details-layout">
          <div className="card details-card">
            <div className="details-image-frame">
              <button
                className={`save-detail-btn ${isSaved(product._id) ? "saved" : ""}`}
                onClick={() => {
                  try {
                    toggleSaved(product._id);
                  } catch (err) {
                    alert(err.message || "Please log in first.");
                  }
                }}
                type="button"
                aria-label={
                  isSaved(product._id)
                    ? "Remove from saved products"
                    : "Save product"
                }
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" role="img">
                  <path
                    d="M12 21.35 10.55 20C5.4 15.24 2 12.09 2 8.25 2 5.26 4.24 3 7.2 3c1.67 0 3.27.79 4.3 2.03A5.66 5.66 0 0 1 15.8 3C18.76 3 21 5.26 21 8.25c0 3.84-3.4 6.99-8.55 11.76L12 21.35Z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              <img
                src={toImageUrl(selectedImage)}
                alt={product.name}
                className="details-image"
                onError={(event) => {
                  event.currentTarget.src = "/placeholder.png";
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="thumbs">
                {images.map((imagePath, index) => (
                  <img
                    key={`${imagePath}-${index}`}
                    src={toImageUrl(imagePath)}
                    alt={`${product.name} ${index + 1}`}
                    className={`thumb ${selectedImageIndex === index ? "active" : ""}`}
                    onClick={() => setSelectedImageIndex(index)}
                    onError={(event) => {
                      event.currentTarget.src = "/placeholder.png";
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="details-side-column">
            <div className="card details-card details-info-box">
              <p className="eyebrow">{product.category}</p>
              <h1>{product.name}</h1>

              <div className="rating-row">
                <span className="rating-stars">{renderStars(product.rating)}</span>
                <span className="rating-meta">
                  {(Number(product.rating) || 0).toFixed(1)} ({product.numReviews || 0} reviews)
                </span>
              </div>

              <p>{product.description}</p>

              <div className="tracking-strip">
                <span className="tracking-pill active">Material: {product.material}</span>
                <span className="tracking-pill">Color: {product.color}</span>
                <span className="tracking-pill">
                  Stock: {product.countInStock > 0 ? "Available" : "Out of stock"}
                </span>
              </div>

              <div className="price-box">
                <span className="new-price">Rs. {product.price}</span>
                {hasDiscount && (
                  <span className="old-price">Rs. {product.originalPrice}</span>
                )}
              </div>

              <label htmlFor="detail-qty">Quantity</label>
              <select
                id="detail-qty"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
              >
                {Array.from({ length: maxQty }, (_, idx) => idx + 1).map((qty) => (
                  <option key={qty} value={qty}>
                    {qty}
                  </option>
                ))}
              </select>

              <div className="btn-group">
                <button
                  className={`button add-btn ${addSuccess ? "added" : ""}`}
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  {addSuccess ? "Added ✓" : addingToCart ? "Adding..." : "Add to Cart"}
                </button>
                <button className="button buy-btn" onClick={handleBuyNow}>
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          <section className="card details-card details-reviews-box review-panel">
            <h3>Reviews</h3>

            <div className="review-summary-grid">
              <div className="review-summary-score">
                <div className="rating-stars">{renderStars(averageRating)}</div>
                <p>
                  <strong>{roundedAverage}</strong> out of 5
                </p>
                <p className="muted">Based on {reviews.length} reviews</p>
              </div>

              <div className="review-summary-bars">
                {ratingDistribution.map((row) => {
                  const widthPercent =
                    reviews.length > 0 ? (row.count / reviews.length) * 100 : 0;
                  return (
                    <div key={row.stars} className="review-bar-row">
                      <span className="review-bar-stars">{row.stars}★</span>
                      <div className="review-bar-track" aria-hidden="true">
                        <div
                          className="review-bar-fill"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                      <span className="review-bar-count">{row.count}</span>
                    </div>
                  );
                })}
              </div>

              <div className="review-summary-action">
                <button
                  type="button"
                  className={`button review-write-btn ${isWriteReviewOpen ? "is-open" : ""}`}
                  onClick={() => setIsWriteReviewOpen((open) => !open)}
                >
                  {isWriteReviewOpen ? "Cancel review" : "Write a review"}
                </button>
              </div>
            </div>

            {isWriteReviewOpen &&
              (user ? (
                <form id="review-form" className="review-form" onSubmit={handleSubmitReview}>
                  <h4 className="review-form-title">Write a review</h4>

                  <label className="review-field-label">Rating</label>
                  <div className="review-stars-input" role="radiogroup" aria-label="Choose rating">
                    {[1, 2, 3, 4, 5].map((starValue) => (
                      <button
                        key={starValue}
                        type="button"
                        className={`review-star-btn ${
                          reviewRating >= starValue ? "active" : ""
                        }`}
                        onClick={() => setReviewRating(starValue)}
                        aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
                        aria-pressed={reviewRating === starValue}
                      >
                        {reviewRating >= starValue ? "★" : "☆"}
                      </button>
                    ))}
                  </div>

                  <label className="review-field-label" htmlFor="review-comment">
                    Review content
                  </label>

                  <textarea
                    id="review-comment"
                    placeholder="Write your review..."
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                  />

                  <label className="review-field-label" htmlFor="review-photo">
                    Picture (optional)
                  </label>
                  <input
                    id="review-photo"
                    type="file"
                    accept="image/*"
                    multiple
                    className="review-photo-input"
                    onChange={(event) => {
                      const files = Array.from(event.target.files || []).slice(0, 5);
                      setReviewPhotos(files);
                    }}
                  />
                  <label htmlFor="review-photo" className="review-photo-uploader">
                    <span className="upload-icon" aria-hidden="true">
                      ⇧
                    </span>
                    <span>
                      {reviewPhotos.length > 0
                        ? `${reviewPhotos.length} image(s) selected`
                        : "Upload images"}
                    </span>
                  </label>

                  {reviewPhotoPreviews.length > 0 && (
                    <div className="review-photo-preview-grid">
                      {reviewPhotoPreviews.map((previewUrl, index) => (
                        <div className="review-photo-preview" key={previewUrl}>
                          <img src={previewUrl} alt={`Review upload preview ${index + 1}`} />
                        </div>
                      ))}
                    </div>
                  )}

                  <button type="submit" className="button" disabled={submittingReview}>
                    {submittingReview ? "Saving..." : "Submit Review"}
                  </button>
                </form>
              ) : (
                <p className="muted">Please log in to write a review.</p>
              ))}

            <div className="review-sort-row">
              <select
                value={reviewSort}
                onChange={(event) => setReviewSort(event.target.value)}
              >
                <option value="newest">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>

            <div className="review-panel-body">
                {sortedReviews.length > 0 ? (
                  <ul className="product-review-list">
                    {sortedReviews.map((review) => (
                      <li key={review._id} className="product-review-item">
                        <div className="product-review-row">
                          <div className="product-review-copy">
                            <div className="product-review-head">
                              <span className="rating-stars">{renderStars(review.rating)}</span>
                              {user && String(review.user) === String(user._id) && (
                                <button
                                  type="button"
                                  className="review-delete-btn"
                                  onClick={() => handleDeleteReview(review._id)}
                                  disabled={deletingReviewId === review._id}
                                  aria-label="Delete review"
                                  title="Delete review"
                                >
                                  🗑
                                </button>
                              )}
                            </div>
                            <div className="product-review-meta">
                              <strong>{review.name}</strong>
                              <span className="review-verified">Verified</span>
                            </div>
                            {review.comment && <p>{review.comment}</p>}
                          </div>
                          {((review.images && review.images.length > 0) ||
                            review.image) && (
                            <div className="product-review-photos">
                              {(review.images && review.images.length > 0
                                ? review.images
                                : [review.image]
                              ).map((imgPath, index) => (
                                <button
                                  key={`${review._id}-photo-${index}`}
                                  type="button"
                                  className="product-review-photo-button"
                                  onClick={() => setSelectedReviewImage(toImageUrl(imgPath))}
                                  aria-label={`Open review photo ${index + 1}`}
                                >
                                  <img
                                    src={toImageUrl(imgPath)}
                                    alt={`${review.name} review ${index + 1}`}
                                    className="product-review-photo"
                                    onError={(event) => {
                                      event.currentTarget.parentElement.style.display = "none";
                                    }}
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
              ) : (
                <p className="muted">No reviews yet.</p>
              )}
            </div>
          </section>
        </div>
      )}

      {selectedReviewImage && (
        <div
          className="review-image-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedReviewImage("")}
        >
          <div
            className="review-image-lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="review-image-lightbox-close"
              onClick={() => setSelectedReviewImage("")}
              aria-label="Close image viewer"
            >
              ×
            </button>
            <img src={selectedReviewImage} alt="Full review upload" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
