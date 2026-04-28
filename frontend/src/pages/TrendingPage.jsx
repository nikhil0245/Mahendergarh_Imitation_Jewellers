import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { request } from "../api";
import {
  getProductFallbackImage,
  getProductImageUrl,
} from "../utils/productImages";

const TrendingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await request("/api/products?trending=true");
        setProducts(data);
      } catch (err) {
        setError(err.message || "Failed to load trending products");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  return (
    <div className="container page">
      <div className="recent-views-page-header">
        <div>
          <p className="eyebrow">Popular Picks</p>
          <h2 className="page-title">Trending Products</h2>
          <p className="muted">
            Explore the products highlighted by the admin in the trending section.
          </p>
        </div>
      </div>

      {loading && <p>Loading trending products...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="muted">No trending products available yet.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="recent-views-page-grid">
          {products.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="recent-view-card"
            >
              <div className="recent-view-image-wrap">
                <img
                  src={getProductImageUrl(product)}
                  alt={product.name}
                  className="recent-view-image"
                  onError={(event) => {
                    event.currentTarget.src = getProductFallbackImage(product);
                  }}
                />
              </div>
              <div className="recent-view-content">
                <h3>{product.name}</h3>
                <p>{product.category}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingPage;
