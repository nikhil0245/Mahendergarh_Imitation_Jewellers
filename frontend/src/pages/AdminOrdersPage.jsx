import { useEffect, useState } from "react";
import { API_URL } from "../api";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/api/orders`);
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔥 STATUS CHANGE
  const updateStatus = async (id, status) => {
    await fetch(`${API_URL}/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    fetchOrders(); // refresh
  };

  return (
    <div className="container page">
      <h2>👨‍💼 Admin Orders</h2>

      {orders.map((order) => (
        <div key={order._id} className="card" style={{ marginBottom: "20px" }}>
          <h3>Order ID: {order._id}</h3>
          <p>Total: ₹ {order.totalAmount}</p>

          {/* STATUS */}
          <select
            value={order.status}
            onChange={(e) => updateStatus(order._id, e.target.value)}
          >
            <option>Pending</option>
            <option>Shipped</option>
            <option>Delivered</option>
          </select>

          <hr />

          {/* ITEMS */}
          {order.items.map((item) => (
            <div key={item.product} className="summary-item">
              <img src={`${API_URL}${item.image}`} alt={item.name} />

              <div className="summary-info">
                <p>{item.name}</p>
                <span>Qty: {item.quantity}</span>
              </div>

              <div className="summary-price">
                ₹ {item.price * item.quantity}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default AdminOrdersPage;
