import { useLocation, useNavigate } from "react-router-dom";

const OrderFailurePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const message =
    location.state?.message || "Payment could not be completed. Please try again.";

  return (
    <div className="success-page">
      <div className="success-card failure-card">
        <div className="checkmark">!</div>
        <h2>Payment Failed</h2>
        <p>{message}</p>
        <button onClick={() => navigate("/checkout")}>Try Again</button>
      </div>
    </div>
  );
};

export default OrderFailurePage;
