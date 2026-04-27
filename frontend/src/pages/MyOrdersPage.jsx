import { useEffect, useState } from "react";
import { API_URL, request } from "../api";

const orderStages = ["Placed", "Packed", "Shipped", "Delivered"];

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    request("/api/orders/my")
      .then((data) => setOrders(data))
      .catch((err) => console.error(err));
  }, []);

  const handleInvoiceDownload = (order) => {
    const invoiceWindow = window.open("", "_blank", "width=900,height=700");

    if (!invoiceWindow) return;

    const rows = order.items
      .map(
        (item) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #ddd;">${item.name}</td>
            <td style="padding:8px;border-bottom:1px solid #ddd;">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #ddd;">₹ ${item.price}</td>
            <td style="padding:8px;border-bottom:1px solid #ddd;">₹ ${item.price * item.quantity}</td>
          </tr>
        `,
      )
      .join("");

    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${order._id}</title>
        </head>
        <body style="font-family:Arial,sans-serif;padding:24px;">
          <h1>Mahendergarh Imitation Jewellers</h1>
          <p><strong>Invoice:</strong> #${order._id}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Payment:</strong> ${order.isPaid ? "Paid" : "Pending"}</p>
          <p><strong>Total:</strong> ₹ ${order.totalAmount}</p>
          <h3>Shipping Address</h3>
          <p>${order.shippingAddress?.fullName || ""}</p>
          <p>${order.shippingAddress?.address || ""}</p>
          <p>${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""}</p>
          <p>${order.shippingAddress?.pincode || ""}</p>
          <table style="width:100%;border-collapse:collapse;margin-top:20px;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px;border-bottom:2px solid #ccc;">Product</th>
                <th style="text-align:left;padding:8px;border-bottom:2px solid #ccc;">Qty</th>
                <th style="text-align:left;padding:8px;border-bottom:2px solid #ccc;">Price</th>
                <th style="text-align:left;padding:8px;border-bottom:2px solid #ccc;">Total</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    invoiceWindow.document.close();
    invoiceWindow.focus();
    invoiceWindow.print();
  };

  return (
    <div className="container page">
      <h2>🧾 My Orders</h2>

      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="card"
            style={{ marginBottom: "20px" }}
          >
            <h3>Order ID: {order._id}</h3>
            <p>Status: {order.status}</p>
            <p>Total: ₹ {order.totalAmount}</p>
            <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>

            <div className="tracking-strip">
              {orderStages.map((stage) => (
                <span
                  key={stage}
                  className={`tracking-pill ${
                    orderStages.indexOf(stage) <= orderStages.indexOf(order.status)
                      ? "active"
                      : ""
                  }`}
                >
                  {stage}
                </span>
              ))}
            </div>

            <hr />

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

            <button
              className="button"
              type="button"
              onClick={() => handleInvoiceDownload(order)}
            >
              Download Invoice
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrdersPage;
