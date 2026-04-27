import { useEffect, useState } from "react";
import { API_URL } from "../api";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cart, subtotal, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate(); // 🔥 ADD
  const [quantityInputs, setQuantityInputs] = useState({});
  const safeItems = Array.isArray(cart?.items)
    ? cart.items.filter((item) => item?.product?._id)
    : [];

  useEffect(() => {
    setQuantityInputs(
      safeItems.reduce((accumulator, item) => {
        accumulator[item.product._id] = String(item.quantity);
        return accumulator;
      }, {}),
    );
  }, [safeItems]);

  const totalQuantity = safeItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const showStockMessage = (stock) => {
    alert(`Only ${stock} items are currently available in stock`);
  };

  const syncQuantity = async (productId, nextQuantity, stock) => {
    if (nextQuantity < 1) {
      nextQuantity = 1;
    }

    if (nextQuantity > stock) {
      showStockMessage(stock);
      nextQuantity = stock;
    }

    setQuantityInputs((current) => ({
      ...current,
      [productId]: String(nextQuantity),
    }));

    try {
      await updateQuantity(productId, nextQuantity);
    } catch (error) {
      alert(error.message || `Only ${stock} items are currently available in stock`);
    }
  };

  const handleManualQuantityChange = (productId, value) => {
    const sanitizedValue = value.replace(/[^\d]/g, "");
    const nextValue = sanitizedValue === "0" ? "1" : sanitizedValue;

    setQuantityInputs((current) => ({
      ...current,
      [productId]: nextValue,
    }));
  };

  const commitManualQuantity = async (item) => {
    const productId = item.product._id;
    const stock = Number(item.product.countInStock || 1);
    const rawValue = quantityInputs[productId] ?? String(item.quantity);
    let nextQuantity = Number.parseInt(rawValue, 10);

    if (!rawValue || Number.isNaN(nextQuantity) || nextQuantity <= 0) {
      nextQuantity = 1;
    }

    await syncQuantity(productId, nextQuantity, stock);
  };

  const handleDecrease = async (item) => {
    await syncQuantity(
      item.product._id,
      Number(item.quantity) - 1,
      Number(item.product.countInStock || 1),
    );
  };

  const handleIncrease = async (item) => {
    const stock = Number(item.product.countInStock || 1);
    if (Number(item.quantity) >= stock) {
      showStockMessage(stock);
      return;
    }

    await syncQuantity(item.product._id, Number(item.quantity) + 1, stock);
  };

  return (
    <div className="container page">
      <h2 className="page-title">
        <span className="page-title-icon" aria-hidden="true">🛒</span>
        Your Cart
      </h2>

      {safeItems.length === 0 ? (
        <p className="muted">Your cart is empty.</p>
      ) : (
        <div className="cart-layout">
          {/* LEFT SIDE */}
          <div className="cart-list-shell">
            <div className="cart-list">
              {safeItems.map((item) => (
                <div key={item.product._id} className="cart-item">
                  <Link
                    to={`/product/${item.product._id}`}
                    className="cart-image-link"
                    aria-label={`View details for ${item.name}`}
                  >
                    <img src={`${API_URL}${item.image}`} alt={item.name} />
                  </Link>

                  <div className="cart-item-details">
                    <Link
                      to={`/product/${item.product._id}`}
                      className="cart-title-link"
                    >
                      <h3>{item.name}</h3>
                    </Link>
                    <p className="cart-item-price">Rs. {item.price}</p>
                  </div>

                  <div className="cart-item-actions">
                    <label className="cart-qty-control">
                      <span>Quantity</span>
                      <div className="cart-qty-stepper">
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => handleDecrease(item)}
                          aria-label={`Decrease quantity for ${item.name}`}
                        >
                          −
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={quantityInputs[item.product._id] ?? String(item.quantity)}
                          onChange={(e) =>
                            handleManualQuantityChange(
                              item.product._id,
                              e.target.value,
                            )
                          }
                          onBlur={() => commitManualQuantity(item)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              commitManualQuantity(item);
                            }
                          }}
                          aria-label={`Quantity for ${item.name}`}
                        />
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => handleIncrease(item)}
                          aria-label={`Increase quantity for ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </label>

                    <button
                      className="danger-button cart-remove-btn"
                      onClick={() => removeFromCart(item.product._id)}
                      aria-label={`Remove ${item.name} from cart`}
                      title="Remove from cart"
                    >
                      <svg
                        className="cart-remove-icon"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M4 7h16" />
                        <path d="M9.5 3.5h5L15 7H9z" />
                        <path d="M8 7l1 12h6l1-12" />
                        <path d="M10 10.5v6.5" />
                        <path d="M14 10.5v6.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="card summary-card">
            <div className="summary-card-header">
              <h3>Order Summary</h3>
              <span>{totalQuantity} item{totalQuantity !== 1 ? "s" : ""}</span>
            </div>

            <div className="summary-row">
              <span>Total Items</span>
              <span>{totalQuantity}</span>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>Rs. {subtotal}</span>
            </div>

            <div className="summary-row summary-row-total">
              <span>Total</span>
              <span>Rs. {subtotal}</span>
            </div>

            <button
              className="button checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              🚀 Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
