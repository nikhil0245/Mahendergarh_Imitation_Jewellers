import { useCart } from "../context/CartContext";
import { API_URL } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // ✅ ADD
import { useLocation } from "react-router-dom";

const CheckoutPage = () => {
  const [buyQty, setBuyQty] = useState(1);
  const [quantityDrafts, setQuantityDrafts] = useState({});
  const { cart, subtotal, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ ADD
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const location = useLocation(); // 🔥 yaha
  // const buyNowProduct = location.state?.buyNowProduct;
  const buyNowItem = location.state?.buyNowItem;
  const calculatedSubtotal = buyNowItem ? buyNowItem.price * buyQty : subtotal;
  const handleChangeAddress = () => {
    navigate("/shipping", {
      state: {
        previousAddress: savedAddress || address,
        userEmail: user?.email || "",
      },
    });
  };

  const finalItems = buyNowItem
    ? [
        {
          ...buyNowItem,
          quantity: 1,
          product: { _id: buyNowItem._id },
          image: buyNowItem.images?.[0],
        },
      ]
    : cart.items;
  // ADDRESS
  const [address, setAddress] = useState({
    fullName: "",
    email: "",
    address: "",
    Contact: "",
    city: "",
    pincode: "",
    state: "",
  });

  const getQuantityKey = (item) => (buyNowItem ? "buyNow" : item.product._id);

  const getDisplayedQuantity = (item) => {
    const key = getQuantityKey(item);
    const draftValue = quantityDrafts[key];

    if (draftValue !== undefined) {
      return draftValue;
    }

    return String(buyNowItem ? buyQty : item.quantity);
  };

  const getCurrentQuantity = (item) => {
    const draftValue = Number(quantityDrafts[getQuantityKey(item)]);

    if (!Number.isNaN(draftValue) && draftValue > 0) {
      return draftValue;
    }

    return buyNowItem ? buyQty : item.quantity;
  };

  const commitQuantity = (item, rawValue) => {
    const stock = item.product.countInStock || 10;
    const key = getQuantityKey(item);
    let nextValue = Number(rawValue);

    if (!rawValue || Number.isNaN(nextValue) || nextValue < 1) {
      nextValue = 1;
    }

    if (nextValue > stock) {
      alert(`Only ${stock} items available`);
      nextValue = stock;
    }

    if (buyNowItem) {
      setBuyQty(nextValue);
    } else {
      updateQuantity(item.product._id, nextValue);
    }

    setQuantityDrafts((prev) => ({
      ...prev,
      [key]: String(nextValue),
    }));
  };

  const [savedAddress, setSavedAddress] = useState(null);
  const [shippingMethod, setShippingMethod] = useState("standard");

  // ✅ AUTO EMAIL FILL

  useEffect(() => {
    const saved = localStorage.getItem("shippingAddress");

    if (saved) {
      const parsed = JSON.parse(saved);
      setAddress(parsed);
      setSavedAddress(parsed);
    } else {
      setAddress((prev) => ({
        ...prev,
        email: user?.email || "",
      }));
    }
  }, [user]);

  // SAVE ADDRESS
  const handleAddressSubmit = () => {
    if (!validateAddress()) return;

    const updatedAddress = {
      ...address,
      email: user?.email || "",
    };

    localStorage.setItem("shippingAddress", JSON.stringify(updatedAddress));

    setSavedAddress(updatedAddress);
    setStep(2);
  };
  const validateAddress = () => {
    if (
      !address.fullName ||
      !address.email ||
      !address.address ||
      !address.city ||
      !address.pincode ||
      !address.state ||
      !address.Contact
    ) {
      alert("⚠️ Please fill all shipping details");
      return false;
    }
    setError("");
    return true;
  };

  const handlePlaceOrder = () => {
    if (!savedAddress) {
      alert("⚠️ Please fill shipping address first");
      return;
    }

    navigate("/payment", {
      state: {
        buyNowItem,
      },
    });
  };

  return (
    <div className="checkout-container">
      <div className="checkout-title-sticky">
        <span className="checkout-title">Checkout</span>
        <p className="checkout-subtitle">
          Review your delivery details and confirm your order securely.
        </p>
      </div>
      <div className="checkout-main">
        {/* LEFT */}
        <div className="checkout-left sticky-address">
          {/* STEP 1 */}
          <div className="checkout-step">
            <div className="checkout-step-header">
              <span className="checkout-step-badge">1</span>
              <div>
                <h3>Shipping Address</h3>
              </div>
            </div>

            {/* FORM */}
            {!savedAddress && (
              <>
                <div className="form-grid">
                  <input
                    name="fullName"
                    autoComplete="name"
                    placeholder="Full Name"
                    value={address.fullName}
                    onChange={(e) =>
                      setAddress({ ...address, fullName: e.target.value })
                    }
                  />

                  <input
                    name="email"
                    autoComplete="email"
                    value={user?.email || ""}
                    readOnly
                  />

                  <input
                    name="address"
                    autoComplete="street-address" // 🔥 IMPORTANT
                    placeholder="Address"
                    value={address.address}
                    onChange={(e) =>
                      setAddress({ ...address, address: e.target.value })
                    }
                  />

                  <input
                    name="Contact"
                    autoComplete="tel"
                    placeholder="Contact Number"
                    value={address.Contact}
                    onChange={(e) =>
                      setAddress({ ...address, Contact: e.target.value })
                    }
                  />

                  <input
                    name="city"
                    autoComplete="address-level2"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                  />

                  <input
                    name="pincode"
                    autoComplete="postal-code"
                    placeholder="Pincode"
                    value={address.pincode}
                    onChange={(e) =>
                      setAddress({ ...address, pincode: e.target.value })
                    }
                  />

                  <input
                    name="state"
                    autoComplete="address-level1"
                    placeholder="State"
                    value={address.state}
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                  />
                </div>
                {error && <p className="error">{error}</p>}
                <button
                  className="primary-btn"
                  onClick={() => {
                    if (!validateAddress()) return;
                    handleAddressSubmit();
                  }}
                >
                  Continue
                </button>
              </>
            )}

            {/* SAVED ADDRESS */}
            {savedAddress && (
              <div className="saved-address">
                <div className="row">
                  <span>Full Name</span>
                  <span>:</span>
                  <span>{savedAddress.fullName}</span>
                </div>

                <div className="row">
                  <span>Email</span>
                  <span>:</span>
                  <span>{savedAddress.email}</span>
                </div>

                <div className="row">
                  <span>Address</span>
                  <span>:</span>
                  <span>{savedAddress.address}</span>
                </div>

                <div className="row">
                  <span>City</span>
                  <span>:</span>
                  <span>{savedAddress.city}</span>
                </div>

                <div className="row">
                  <span>Pincode</span>
                  <span>:</span>
                  <span>{savedAddress.pincode}</span>
                </div>

                <div className="row">
                  <span>State</span>
                  <span>:</span>
                  <span>{savedAddress.state}</span>
                </div>

                <div className="row">
                  <span>Contact</span>
                  <span>:</span>
                  <span>{savedAddress.Contact}</span>
                </div>

                <button type="button" onClick={handleChangeAddress}>
                  Change Address
                </button>
              </div>
            )}
          </div>

          {/* STEP 2 */}
          {savedAddress && (
            <div className="checkout-step">
              <div className="checkout-step-header">
                <span className="checkout-step-badge">2</span>
                <div>
                  <h3>Shipping Method</h3>
                  <p>Select the delivery speed that suits your order.</p>
                </div>
              </div>

              <label className="checkout-option">
                <input
                  type="radio"
                  checked={shippingMethod === "standard"}
                  onChange={() => setShippingMethod("standard")}
                />
                <span className="checkout-option-copy">
                  <strong>Standard Delivery</strong>
                  <small>Free shipping, reliable delivery</small>
                </span>
                <span className="checkout-option-price">Free</span>
              </label>

              <label className="checkout-option">
                <input
                  type="radio"
                  checked={shippingMethod === "express"}
                  onChange={() => setShippingMethod("express")}
                />
                <span className="checkout-option-copy">
                  <strong>Express Delivery</strong>
                  <small>Priority dispatch for faster arrival</small>
                </span>
                <span className="checkout-option-price">₹100</span>
              </label>
            </div>
          )}
        </div>

        {/* RIGHT */}

        <div className="checkout-right">
          <div className="checkout-summary-head">
            <h3>Order Summary</h3>
            <p>{finalItems.length} item{finalItems.length > 1 ? "s" : ""} in this order</p>
          </div>

          <div className="summary-scroll">
            {finalItems.map((item) => {
              const stock = item.product.countInStock || 10; // fallback

              return (
                <div key={item.product._id} className="summary-item">
                  <Link
                    to={`/product/${item.product._id}`}
                    className="summary-image-link"
                    aria-label={`View details for ${item.name}`}
                  >
                    <img src={`${API_URL}${item.image}`} alt={item.name} />
                  </Link>

                  <div className="summary-info">
                    <Link
                      to={`/product/${item.product._id}`}
                      className="summary-title-link"
                    >
                      <p className="product-name">{item.name}</p>
                    </Link>

                    {/* QUANTITY */}
                    <div className="qty-box">
                      <button
                        onClick={() => {
                          if (buyNowItem) {
                            setBuyQty((prev) => Math.max(1, prev - 1));
                          } else {
                            updateQuantity(item.product._id, item.quantity - 1);
                          }

                          setQuantityDrafts((prev) => ({
                            ...prev,
                            [getQuantityKey(item)]: undefined,
                          }));
                        }}
                      >
                        -
                      </button>

                      <input
                        type="number"
                        min="1"
                        max={stock}
                        value={getDisplayedQuantity(item)}
                        onChange={(e) => {
                          const nextValue = e.target.value;

                          if (/^\d*$/.test(nextValue)) {
                            if (nextValue !== "" && Number(nextValue) > stock) {
                              alert(`Only ${stock} items available`);
                              setQuantityDrafts((prev) => ({
                                ...prev,
                                [getQuantityKey(item)]: String(stock),
                              }));
                              return;
                            }

                            setQuantityDrafts((prev) => ({
                              ...prev,
                              [getQuantityKey(item)]: nextValue,
                            }));
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        onBlur={(e) => commitQuantity(item, e.target.value)}
                      />

                      <button
                        onClick={() => {
                          if (buyNowItem) {
                            if (buyQty >= stock) {
                              alert(`Only ${stock} items available`);
                              return;
                            }
                            setBuyQty((prev) => prev + 1);
                          } else {
                            if (item.quantity >= stock) {
                              alert(`Only ${stock} items available`);
                              return;
                            }
                            updateQuantity(item.product._id, item.quantity + 1);
                          }

                          setQuantityDrafts((prev) => ({
                            ...prev,
                            [getQuantityKey(item)]: undefined,
                          }));
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* 🔥 REMOVE  */}
                    {!buyNowItem && (
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.product._id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* 🔥 PRICE RIGHT */}
                  <div className="summary-price">
                    ₹ {item.price * (buyNowItem ? buyQty : item.quantity)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="summary-sticky-footer">
            <div className="price-row">
              <span>Subtotal</span>₹ {calculatedSubtotal}
            </div>

            <div className="price-row">
              <span>Shipping</span>
              <span>{shippingMethod === "express" ? "₹100" : "Free"}</span>
            </div>

            <div className="price-row total">
              <span>Total</span>
              <span>
                ₹{" "}
                {shippingMethod === "express"
                  ? calculatedSubtotal + 100
                  : calculatedSubtotal}
              </span>
            </div>

            <button
              className="checkout-btn"
              onClick={handlePlaceOrder}
              disabled={!savedAddress}
            >
              🚀 Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
