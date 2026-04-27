import { useState } from "react";
import { useCart } from "../context/CartContext";
import { API_URL, request } from "../api";
import { Link, useNavigate, useLocation } from "react-router-dom";

const PaymentPage = () => {
  const { cart, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const buyNowItem = location.state?.buyNowItem;
  const items = buyNowItem
    ? [
        {
          ...buyNowItem,
          quantity: 1,
          product: { _id: buyNowItem._id },
          image: buyNowItem.images?.[0],
        },
      ]
    : cart.items;

  // 🔥 TOTAL
  const total = buyNowItem ? buyNowItem.price : subtotal;

  const handlePay = async () => {
    try {
      setLoading(true);

      // ✅ COD
      if (method === "cod") {
        await saveOrder("COD");
        clearCart();
        navigate("/success");
        return;
      }

      // ✅ CREATE ORDER (RAZORPAY)
      const res = await fetch(`${API_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total * 100,
        }),
      });

      const order = await res.json();

      if (!order || !order.id) {
        throw new Error("Unable to create payment order");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "Mahendergarh Imitation Jewellers",
        description: "Order Payment",

        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(response),
            });

            const data = await verifyRes.json();

            if (data.success) {
              await saveOrder(response.razorpay_payment_id);
              clearCart();
              navigate("/success", {
                state: { paymentId: response.razorpay_payment_id },
              });
            } else {
              navigate("/payment-failed", {
                state: { message: "Payment verification failed. Please try again." },
              });
            }
          } catch (error) {
            navigate("/payment-failed", {
              state: {
                message:
                  error.message || "We could not verify your payment. Please try again.",
              },
            });
          }
        },

        prefill: {
          name: "Nikhil",
          email: "test@gmail.com",
          contact: "9999999999",
        },

        theme: {
          color: "#f59e0b",
        },

        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        navigate("/payment-failed", {
          state: { message: "Payment failed or was cancelled. Please try again." },
        });
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      navigate("/payment-failed", {
        state: { message: err.message || "Payment failed. Please try again." },
      });
    } finally {
      setLoading(false);
    }
  };

  const saveOrder = async (paymentId) => {
    const shippingAddress = JSON.parse(
      localStorage.getItem("shippingAddress") || "{}",
    );

    await request("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        items,
        totalAmount: total,
        shippingAddress,
        paymentId,
        paymentMethod: method,
        isPaid: paymentId !== "COD",
        paidAt: paymentId !== "COD" ? new Date().toISOString() : null,
        status: "Placed",
      }),
    });
  };

  return (
    <div className="container page payment-page">
      <h2 className="page-title">💳 Complete Payment</h2>

      <div className="payment-layout">
        {/* LEFT */}
        <div className="payment-methods card">
          <h3>Payment Options</h3>

          <div
            className={`payment-option ${method === "card" ? "active" : ""}`}
            onClick={() => setMethod("card")}
          >
            💳 Card
          </div>

          <div
            className={`payment-option ${method === "upi" ? "active" : ""}`}
            onClick={() => setMethod("upi")}
          >
            📱 UPI
          </div>

          <div
            className={`payment-option ${
              method === "netbanking" ? "active" : ""
            }`}
            onClick={() => setMethod("netbanking")}
          >
            🏦 Net Banking
          </div>

          <div
            className={`payment-option ${method === "cod" ? "active" : ""}`}
            onClick={() => setMethod("cod")}
          >
            💵 Cash on Delivery
          </div>

          <button
            className="button pay-btn"
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? "Processing..." : `Pay Rs. ${total}`}
          </button>
        </div>

        {/* RIGHT */}
        <div className="card summary-card">
          <h3>Order Summary</h3>

          <div className="payment-summary-scroll">
            {items.map((item) => (
              <div key={item.product._id} className="summary-item">
                <Link
                  to={`/product/${item.product._id}`}
                  className="summary-image-link"
                  aria-label={`View details for ${item.name}`}
                >
                  <img
                    src={`${API_URL}${item.image}`}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/60";
                    }}
                  />
                </Link>

                <div className="summary-info">
                  <Link
                    to={`/product/${item.product._id}`}
                    className="summary-title-link"
                  >
                    <p className="product-name">{item.name}</p>
                  </Link>
                  <span className="muted">Qty: {item.quantity}</span>
                </div>

                <div className="summary-price">
                  Rs. {item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          <div className="payment-summary-footer">
            <div className="summary-row total">
              <span>Total</span>
              <span>Rs. {total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
