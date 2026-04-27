import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { request } from "../api";
import ProductCard from "../components/ProductCard";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedCategory = useMemo(
    () => decodeURIComponent(categoryName || ""),
    [categoryName],
  );

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!selectedCategory) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await request(
          `/api/products?category=${encodeURIComponent(selectedCategory)}`,
        );

        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [selectedCategory]);

  return (
    <div className="container page category-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Category</p>
          <h2>{selectedCategory || "Products"}</h2>
        </div>
        <Link to="/" className="category-page-back-link">
          Back to All Products
        </Link>
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p className="no-products">No products found in this category.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="products-container">
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
