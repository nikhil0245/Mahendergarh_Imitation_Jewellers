import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { request } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useSavedProducts } from "../context/SavedProductsContext";
import siteLogo from "../assets/logo.jpg";

const Header = () => {
  const instagramUrl =
    "https://www.instagram.com/mahendergarh_imitation_jewels/";
  const emailAddress = "maheshbagaria341@gmail.com";
  const whatsappNumber = "918168386457";
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { savedCount } = useSavedProducts();
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [headerSearch, setHeaderSearch] = useState("");
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);
  const [hasBrandWordmarkError, setHasBrandWordmarkError] = useState(false);
  const searchWrapRef = useRef(null);
  const searchInputRef = useRef(null);
  const displayName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : "";

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await request("/api/products");
        const uniqueCategories = Array.from(
          new Set((data || []).map((product) => product.category).filter(Boolean)),
        ).sort((a, b) => a.localeCompare(b));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setHeaderSearch(params.get("search") || "");
  }, [location.search]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(event.target)
      ) {
        setIsHeaderSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (isHeaderSearchOpen) {
      const focusTimer = window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 30);
      return () => window.clearTimeout(focusTimer);
    }
    return undefined;
  }, [isHeaderSearchOpen]);

  const menuCategories = ["All", ...categories];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleHeaderSearchSubmit = (event) => {
    event.preventDefault();
    const keyword = headerSearch.trim();
    const normalizedKeyword = keyword.toLowerCase();

    const matchedCategory =
      categories.find(
        (categoryName) => categoryName.toLowerCase() === normalizedKeyword,
      ) ||
      categories.find(
        (categoryName) =>
          categoryName.toLowerCase().includes(normalizedKeyword) ||
          normalizedKeyword.includes(categoryName.toLowerCase()),
      );

    if (matchedCategory) {
      navigate(`/category/${encodeURIComponent(matchedCategory)}`);
      setIsHeaderSearchOpen(false);
      return;
    }

    const params = new URLSearchParams();
    if (keyword) params.set("search", keyword);
    const queryString = params.toString();
    navigate(queryString ? `/?${queryString}` : "/");
    setIsHeaderSearchOpen(false);
  };

  return (
    <header className="header">
      <div className="container navbar">
        {/* LOGO */}
        <Link to="/" className="logo">
          <img
            src={siteLogo}
            alt="Mahendergarh Imitation Jewellers"
            className="logo-mark"
          />
          {!hasBrandWordmarkError ? (
            <img
              src="/brand-wordmark.png"
              alt="Mahendergarh Imitation Jewellers"
              className="logo-wordmark"
              onError={() => setHasBrandWordmarkError(true)}
            />
          ) : (
            <span className="logo-text-stack">
              <span className="logo-text-main">Mahendergarh</span>
              <span className="logo-text-divider" aria-hidden="true">
                <span className="logo-text-divider-line" />
                <span className="logo-text-divider-diamond">◆</span>
                <span className="logo-text-divider-line" />
              </span>
              <span className="logo-text-sub">Imitation Jewellers</span>
            </span>
          )}
        </Link>

        {/* NAV */}
        <nav className="nav-links">
          <div className="products-menu">
            <button
              type="button"
              className="products-menu-trigger"
              aria-haspopup="menu"
              aria-expanded="false"
            >
              <span>Products</span>
              <span className="products-menu-caret" aria-hidden="true">
                ▾
              </span>
            </button>

            <div className="products-menu-dropdown" role="menu" aria-label="Product categories">
              {menuCategories.map((categoryName) => (
                <Link
                  key={categoryName}
                  to={
                    categoryName === "All"
                      ? "/"
                      : `/category/${encodeURIComponent(categoryName)}`
                  }
                  role="menuitem"
                  className="products-menu-item"
                >
                  {categoryName}
                </Link>
              ))}
            </div>
          </div>

          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `saved-nav-link ${isActive ? "active" : ""}`
            }
            aria-label={`Saved products (${savedCount})`}
            title="Saved products"
          >
            <span className="saved-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                <path d="M12 21.35 10.55 20C5.4 15.24 2 12.09 2 8.25 2 5.26 4.24 3 7.2 3c1.67 0 3.27.79 4.3 2.03A5.66 5.66 0 0 1 15.8 3C18.76 3 21 5.26 21 8.25c0 3.84-3.4 6.99-8.55 11.76L12 21.35Z" />
              </svg>
            </span>
            {savedCount > 0 && (
              <span className="saved-nav-count">{savedCount}</span>
            )}
          </NavLink>
          <NavLink to="/cart" className="cart-nav-link">
            <span className="cart-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                <path
                  d="M3 4.8h1.8c.55 0 1.05.35 1.23.87l.8 2.33"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.7 8h13.3l-1.5 7.5H8.7L6.7 8Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.2 8v7.5M14.1 8v7.5M17.9 8l-1 7.5M7.8 11.4h11.4M8.4 13.6h10.7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M7.7 18.8h11.4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="9.3" cy="20.4" r="1.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="16.6" cy="20.4" r="1.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            Cart ({itemCount})
          </NavLink>

          <div className="header-search-wrap" ref={searchWrapRef}>
            <button
              type="button"
              className={`header-search-toggle ${isHeaderSearchOpen ? "is-open" : ""}`}
              aria-label="Open search"
              aria-expanded={isHeaderSearchOpen}
              onClick={() => setIsHeaderSearchOpen((current) => !current)}
            >
              <span className="header-search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M16 16l4 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>

            {isHeaderSearchOpen && (
              <form className="header-search-popover" onSubmit={handleHeaderSearchSubmit}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search categories or products..."
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  aria-label="Search categories or products"
                />
              </form>
            )}
          </div>

          {/* ADMIN */}
          {user && user.isAdmin === true && (
            <NavLink to="/admin/products">Admin</NavLink>
          )}

          <div className="contact-box">
            <button
              className="contact-nav-link"
              type="button"
              aria-label="Contact us"
              title="Contact us"
            >
              <span className="contact-badge">
                <svg
                  className="contact-badge-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M4.5 12a7.5 7.5 0 0 1 15 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 12h3v5H5.5A1.5 1.5 0 0 1 4 15.5V12Z"
                    fill="currentColor"
                  />
                  <path
                    d="M20 12h-3v5h1.5a1.5 1.5 0 0 0 1.5-1.5V12Z"
                    fill="currentColor"
                  />
                  <path
                    d="M17 17.5v.8c0 1.2-1 2.2-2.2 2.2H12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle cx="11" cy="20.5" r="1" fill="currentColor" />
                </svg>
              </span>
            </button>

            <div className="contact-dropdown">
              <a href={instagramUrl} target="_blank" rel="noreferrer">
                <svg
                  className="contact-option-icon instagram"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="contactInstagramGradient"
                      x1="0%"
                      y1="100%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#feda75" />
                      <stop offset="35%" stopColor="#fa7e1e" />
                      <stop offset="65%" stopColor="#d62976" />
                      <stop offset="85%" stopColor="#962fbf" />
                      <stop offset="100%" stopColor="#4f5bd5" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="6"
                    fill="url(#contactInstagramGradient)"
                  />
                  <rect
                    x="6.3"
                    y="6.3"
                    width="11.4"
                    height="11.4"
                    rx="3.6"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3.2"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                  />
                  <circle cx="17.2" cy="6.9" r="1.2" fill="#ffffff" />
                </svg>
                Instagram
              </a>
              <a href={`mailto:${emailAddress}`}>
                <svg
                  className="contact-option-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M4.5 6.5h15a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16V8a1.5 1.5 0 0 1 1.5-1.5Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="m4.5 8 7.5 5 7.5-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Email
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  className="contact-option-icon whatsapp"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="5"
                    fill="#25D366"
                  />
                  <path
                    d="M12 6.7a5.24 5.24 0 0 0-4.45 8.02l-.47 2.58 2.63-.43A5.25 5.25 0 1 0 12 6.7Zm2.82 7.17c-.12.34-.68.64-.94.68-.24.03-.55.05-.88-.06-.2-.06-.46-.15-.79-.29-1.39-.6-2.29-2.02-2.36-2.12-.07-.1-.57-.76-.57-1.45s.36-1.02.49-1.16c.12-.14.27-.17.36-.17h.26c.08 0 .2-.03.31.23.12.29.4 1 .43 1.08.04.09.06.19 0 .3-.06.1-.09.17-.18.27-.09.11-.18.23-.26.31-.09.09-.18.19-.08.38.1.18.43.71.92 1.15.64.57 1.18.75 1.36.83.18.08.29.07.39-.04.1-.12.45-.53.57-.71.12-.19.24-.15.4-.09.17.06 1.05.5 1.23.59.18.09.3.13.34.21.03.08.03.48-.09.82Z"
                    fill="#ffffff"
                  />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>

          {/* NOT LOGGED */}
          {!user ? (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Signup</NavLink>
            </>
          ) : (
            <div className="profile-box">
              <button className="profile-trigger" type="button">
                <span className="profile-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="header-profile-svg">
                    <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z" />
                    <path d="M4.5 19.5a7.5 7.5 0 0 1 15 0" />
                  </svg>
                </span>
              </button>

              <div className="profile-dropdown">
                <p>
                  <strong>{displayName}</strong>
                </p>
                <p>{user.email || user.phone}</p>

                <hr />

                <Link to="/saved">
                  <span className="dropdown-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 20.6 4.9 14a4.8 4.8 0 0 1 6.8-6.8L12 7.5l.3-.3a4.8 4.8 0 0 1 6.8 6.8Z" />
                    </svg>
                  </span>
                  Saved
                </Link>
                <Link to="/orders">
                  <span className="dropdown-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 3 3.5 7.5 12 12l8.5-4.5Z" />
                      <path d="M3.5 7.5V16.5L12 21V12" />
                      <path d="M20.5 7.5V16.5L12 21" />
                    </svg>
                  </span>
                  My Orders
                </Link>

                <button onClick={handleLogout} className="logout-btn">
                  <span className="dropdown-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M15 17l5-5-5-5" />
                      <path d="M20 12H9" />
                      <path d="M11 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5" />
                    </svg>
                  </span>
                  Logout
                </button>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
