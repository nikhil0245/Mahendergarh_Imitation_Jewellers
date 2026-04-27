import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL, request } from "../api";

const RECENT_VIEWS_KEY = "recentViews";

const getRecentViewIds = () => {
  try {
    const stored = localStorage.getItem(RECENT_VIEWS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const getProductImageUrl = (product) => {
  const imagePath =
    product.images?.length > 0 ? product.images[0] : product.image || "/placeholder.png";

  return imagePath.startsWith("http") || imagePath === "/placeholder.png"
    ? imagePath
    : `${API_URL}${imagePath}`;
};

const RecentViewsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const recentIds = getRecentViewIds();
        if (recentIds.length === 0) {
          setProducts([]);
          return;
        }

        const data = await request("/api/products");
        const productMap = new Map(data.map((product) => [product._id, product]));
        const recentProducts = recentIds
          .map((id) => productMap.get(id))
          .filter(Boolean);

        setProducts(recentProducts);
      } catch (err) {
        setError(err.message || "Failed to load recent views");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProducts();
  }, []);

  return (
    <div className="container page">
      <div className="recent-views-page-header">
        <div>
          <p className="eyebrow">Your History</p>
          <h2 className="page-title">Recent Views</h2>
          <p className="muted">Quickly revisit products you checked recently.</p>
        </div>
      </div>

      {loading && <p>Loading recent views...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="muted">No recently viewed products yet.</p>
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

export default RecentViewsPage;
