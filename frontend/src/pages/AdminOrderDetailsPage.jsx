import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL, request } from "../api";

const orderStatuses = ["Placed", "Packed", "Shipped", "Delivered"];

const AdminOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    request(`/api/admin/orders/${id}`)
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message || "Failed to fetch order details"));
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      const updated = await request(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrder(updated);
    } catch (err) {
      setError(err.message || "Failed to update order status");
    }
  };

  if (error) {
    return (
      <div className="container page">
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container page">
        <p>Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="admin-header">
        <h2>Order Details</h2>
        <button className="button" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="admin-order-details-grid">
        <div className="card">
          <h3>Order Overview</h3>
          <p>
            <strong>Order ID:</strong> #{order._id}
          </p>
          <p>
            <strong>User:</strong> {order.user?.name || "Guest"}
          </p>
          <p>
            <strong>Email:</strong> {order.user?.email || order.shippingAddress?.email}
          </p>
          <p>
            <strong>Payment Status:</strong> {order.isPaid ? "Paid" : "Pending"}
          </p>
          <p>
            <strong>Payment Method:</strong> {order.paymentMethod || "COD"}
          </p>
          <p>
            <strong>Payment ID:</strong> {order.paymentId || "N/A"}
          </p>
          <p>
            <strong>Order Status:</strong> {order.status}
          </p>
          <div className="admin-order-status-control">
            <label htmlFor="order-status">Update Status</label>
            <select
              id="order-status"
              className="admin-status-select"
              value={order.status}
              onChange={(event) => handleStatusChange(event.target.value)}
            >
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <p>
            <strong>Total Amount:</strong> ₹ {order.totalAmount}
          </p>
        </div>

        <div className="card">
          <h3>Shipping Address</h3>
          <p>{order.shippingAddress?.fullName}</p>
          <p>{order.shippingAddress?.email}</p>
          <p>{order.shippingAddress?.address}</p>
          <p>
            {order.shippingAddress?.city}, {order.shippingAddress?.state}
          </p>
          <p>{order.shippingAddress?.pincode}</p>
          <p>{order.shippingAddress?.contact}</p>
        </div>
      </div>

      <div className="card admin-order-items-card">
        <h3>Products</h3>
        {order.items.map((item) => (
          <div key={`${item.product}-${item.name}`} className="summary-item">
            <img src={`${API_URL}${item.image}`} alt={item.name} />
            <div className="summary-info">
              <p>{item.name}</p>
              <span>Qty: {item.quantity}</span>
            </div>
            <div className="summary-price">₹ {item.price * item.quantity}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrderDetailsPage;
