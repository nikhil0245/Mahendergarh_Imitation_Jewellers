import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OrderSuccessPage = () => {
  const navigate = useNavigate();

  // auto redirect after 3 sec
  useEffect(() => {
    setTimeout(() => {
      navigate("/");
    }, 3000);
  }, []);

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="checkmark">✔</div>

        <h2>Order Placed Successfully!</h2>
        <p>Your order has been confirmed 🎉</p>

        <button onClick={() => navigate("/")}>Continue Shopping</button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
