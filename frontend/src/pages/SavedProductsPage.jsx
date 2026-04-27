import { useEffect, useState } from "react";
import { request } from "../api";
import ProductCard from "../components/ProductCard";
import { useSavedProducts } from "../context/SavedProductsContext";

const SavedProductsPage = () => {
  const { savedIds } = useSavedProducts();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSavedProducts = async () => {
      try {
        setLoading(true);
        setError("");

        if (savedIds.length === 0) {
          setProducts([]);
          return;
        }

        const data = await request("/api/products");
        setProducts(data.filter((product) => savedIds.includes(product._id)));
      } catch (err) {
        setError(err.message || "Failed to load saved products");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProducts();
  }, [savedIds]);

  return (
    <div className="container page">
      <div className="saved-header">
        <h2 className="page-title">Saved Products</h2>
        <p className="muted">Keep your favorite items here for later.</p>
      </div>

      {loading && <p>Loading saved products...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="muted">No saved products yet.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="product-grid saved-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedProductsPage;
