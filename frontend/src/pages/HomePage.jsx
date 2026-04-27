import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { request, API_URL } from "../api";
import ProductCard from "../components/ProductCard";
import { useNavigate, useLocation, Link } from "react-router-dom";
import heroBg from "../assets/hero-bg.png";
import heroBg2 from "../assets/hero-bg2.png";

const categoryIconModules = import.meta.glob(
  "../assets/category-icons/*.{png,jpg,jpeg,webp,avif,svg}",
  {
    eager: true,
    import: "default",
  },
);

const normalizeCategoryKey = (value = "") =>
  value.toString().trim().toLowerCase().replace(/\s+/g, "-");

const getProductImageUrl = (product, imageIndex = 0) => {
  const imagePath =
    product.images?.length > 0
      ? product.images[imageIndex] || product.images[0]
      : product.image || "/placeholder.png";

  return imagePath.startsWith("http") || imagePath === "/placeholder.png"
    ? imagePath
    : `${API_URL}${imagePath}`;
};

const FeaturePreviewTile = ({ product }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const imageCount = product.images?.length || 0;

  useEffect(() => {
    setImageIndex(0);

    if (imageCount <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setImageIndex((currentIndex) => (currentIndex + 1) % imageCount);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [imageCount, product._id]);

  return (
    <Link to={`/product/${product._id}`} className="home-feature-tile">
      <div className="home-feature-image-wrap">
        <img
          src={getProductImageUrl(product, imageIndex)}
          alt={product.name}
          className="home-feature-image"
        />
      </div>
    </Link>
  );
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [canScrollTrendingLeft, setCanScrollTrendingLeft] = useState(false);
  const [canScrollTrendingRight, setCanScrollTrendingRight] = useState(false);
  const [activeHeroImage, setActiveHeroImage] = useState(0);
  const trendingScrollRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const heroImages = [heroBg, heroBg2];
  const customCategoryImages = useMemo(() => {
    const normalizedIconMap = Object.entries(categoryIconModules).reduce(
      (acc, [path, src]) => {
        const fileName = path.split("/").pop() || "";
        const key = normalizeCategoryKey(fileName.replace(/\.[^.]+$/, ""));
        acc[key] = src;
        return acc;
      },
      {},
    );

    const pick = (...keys) => {
      for (const key of keys) {
        const found = normalizedIconMap[normalizeCategoryKey(key)];
        if (found) return found;
      }
      return "";
    };

    return {
      Watch: pick("watch", "watches", "chain-watch", "girls-watch"),
      Bags: pick("bag", "bags", "purse", "handbag"),
      Necklace: pick("necklace", "necklaces", "pendent-necklace"),
      Earrings: pick("earring", "earrings"),
      Bracelet: pick("bracelet", "bracelets"),
      Rings: pick("ring", "rings"),
      Bangles: pick("bangle", "bangles"),
    };
  }, []);
  const categoryItems = useMemo(
    () => [
      { value: "Watch", label: "Watches" },
      { value: "Bags", label: "Bags" },
      { value: "Necklace", label: "Necklace" },
      { value: "Earrings", label: "Earrings" },
      { value: "Bracelet", label: "Bracelet" },
      { value: "Rings", label: "Rings" },
      { value: "Bangles", label: "Bangles" },
    ],
    [],
  );

  const query = new URLSearchParams(location.search);
  const searchFromURL = query.get("search") || "";
  const categoryFromURL = query.get("category") || "";

  const buildCatalogPath = useCallback((keyword, cat) => {
    const params = new URLSearchParams();
    if (keyword) params.set("search", keyword);
    const basePath = cat ? `/category/${encodeURIComponent(cat)}` : "/";
    const nextQuery = params.toString();
    return nextQuery ? `${basePath}?${nextQuery}` : basePath;
  }, []);

  const navigateIfNeeded = useCallback(
    (keyword, cat) => {
      const nextPath = buildCatalogPath(keyword, cat);
      const currentPath = `${location.pathname}${location.search}`;
      if (nextPath !== currentPath) {
        navigate(nextPath);
      }
    },
    [buildCatalogPath, location.pathname, location.search, navigate],
  );

  const fetchProducts = async (keyword = "", cat = "") => {
    try {
      setLoading(true);
      setError("");

      const data = await request(
        `/api/products?search=${encodeURIComponent(keyword)}&category=${encodeURIComponent(cat)}`,
      );

      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearch(searchFromURL);
    setCategory(categoryFromURL);
    fetchProducts(searchFromURL, categoryFromURL);
  }, [searchFromURL, categoryFromURL]);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigateIfNeeded(search, category);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, navigateIfNeeded]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveHeroImage((currentIndex) => (currentIndex + 1) % heroImages.length);
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [heroImages.length]);

  const handleCategorySelect = (nextCategory) => {
    setCategory(nextCategory);
    navigateIfNeeded(search, nextCategory);
  };

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const data = await request("/api/products?trending=true");
        let items = Array.isArray(data) ? data : [];

        // Backfill to 6 cards when trending list is short.
        if (items.length < 6) {
          const allProducts = await request("/api/products");
          const existingIds = new Set(items.map((item) => item._id));
          const fallbackItems = (
            Array.isArray(allProducts) ? allProducts : []
          ).filter((item) => item?._id && !existingIds.has(item._id));
          items = [...items, ...fallbackItems].slice(0, 6);
        }

        setTrendingProducts(items);
      } catch (err) {
        console.error("Failed to load trending products:", err);
        setTrendingProducts([]);
      }
    };

    fetchTrendingProducts();
  }, []);

  const updateTrendingScrollState = useCallback(() => {
    const scroller = trendingScrollRef.current;
    if (!scroller) return;

    const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
    setCanScrollTrendingLeft(scroller.scrollLeft > 4);
    setCanScrollTrendingRight(scroller.scrollLeft < maxScrollLeft - 4);
  }, []);

  useEffect(() => {
    updateTrendingScrollState();

    const scroller = trendingScrollRef.current;
    if (!scroller) return undefined;

    scroller.addEventListener("scroll", updateTrendingScrollState, {
      passive: true,
    });
    window.addEventListener("resize", updateTrendingScrollState);

    return () => {
      scroller.removeEventListener("scroll", updateTrendingScrollState);
      window.removeEventListener("resize", updateTrendingScrollState);
    };
  }, [trendingProducts.length, updateTrendingScrollState]);

  const scrollTrending = (direction) => {
    const scroller = trendingScrollRef.current;
    if (!scroller) return;

    const firstTile = scroller.querySelector(".home-feature-tile");
    const tileWidth = firstTile
      ? firstTile.getBoundingClientRect().width
      : scroller.clientWidth * 0.7;
    const gap = parseFloat(getComputedStyle(scroller).gap || "0");
    const offset = tileWidth + gap;

    scroller.scrollBy({
      left: direction === "next" ? offset : -offset,
      behavior: "smooth",
    });
  };

  const categoryImageMap = useMemo(() => {
    const map = {};
    const sourceProducts = [...trendingProducts, ...products];

    sourceProducts.forEach((product) => {
      const categoryKey = product?.category;
      if (!categoryKey || map[categoryKey]) return;
      map[categoryKey] = getProductImageUrl(product);
    });

    return map;
  }, [products, trendingProducts]);

  return (
    <div className="container page home-page">
      <section className="hero hero--slider">
        <div className="hero-bg-slider" aria-hidden="true">
          <div
            className="hero-bg-track"
            style={{ transform: `translateX(-${activeHeroImage * 100}%)` }}
          >
            {heroImages.map((image) => (
              <img key={image} src={image} alt="" className="hero-bg-slide" />
            ))}
          </div>
        </div>

        <div className="hero-copy">
          <p className="hero-title-main">ELEGANCE</p>
          <h1 className="hero-title-script">In Every Detail♡</h1>

          <div className="hero-divider" aria-hidden="true">
            <span className="hero-divider-line" />
            <span className="hero-divider-heart">♥</span>
            <span className="hero-divider-line" />
          </div>

          <p className="hero-description">
            Discover beautiful jewelry & accessories that define your style.
          </p>

          <a href="#catalog-start" className="hero-shop-btn">
            Shop Now
          </a>
        </div>

      </section>

      <div className="category-bar category-bar-visual" id="catalog-start">
        {categoryItems.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`category-visual-item ${category === item.value ? "active" : ""}`}
            onClick={() => handleCategorySelect(item.value)}
            aria-label={`Open ${item.label} category`}
          >
            <div className="category-visual-thumb-wrap">
              {(customCategoryImages[item.value] || categoryImageMap[item.value]) ? (
                <img
                  src={customCategoryImages[item.value] || categoryImageMap[item.value]}
                  alt={item.label}
                  className="category-visual-thumb"
                  onError={(event) => {
                    const fallback = categoryImageMap[item.value];
                    if (fallback && event.currentTarget.src !== fallback) {
                      event.currentTarget.src = fallback;
                    } else {
                      event.currentTarget.style.display = "none";
                    }
                  }}
                />
              ) : (
                <div className="category-visual-fallback" aria-hidden="true">
                  {item.label.charAt(0)}
                </div>
              )}
            </div>
            <p className="category-visual-label">{item.label}</p>
          </button>
        ))}
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && !category && trendingProducts.length > 0 && (
        <section className="home-feature-showcase single-panel">
          <aside className="home-feature-panel">
            <div className="home-feature-header home-feature-header-row">
              <div>
                <h2>Trending Items</h2>
              </div>
            </div>

            <div className="home-feature-slider">
              {canScrollTrendingLeft && (
                <button
                  type="button"
                  className="home-feature-nav-btn home-feature-nav-btn-prev"
                  onClick={() => scrollTrending("prev")}
                  aria-label="Scroll trending left"
                >
                  ‹
                </button>
              )}

              <div className="home-feature-grid" ref={trendingScrollRef}>
                {trendingProducts.map((product) => (
                  <FeaturePreviewTile key={product._id} product={product} />
                ))}
              </div>

              {canScrollTrendingRight && (
                <button
                  type="button"
                  className="home-feature-nav-btn home-feature-nav-btn-next"
                  onClick={() => scrollTrending("next")}
                  aria-label="Scroll trending right"
                >
                  ›
                </button>
              )}
            </div>

            <Link to="/trending" className="home-feature-more">
              View all
            </Link>
          </aside>
        </section>
      )}

      <div className="products-container">
        {products.length === 0 && !loading ? (
          <p className="no-products">No products found 😢</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
