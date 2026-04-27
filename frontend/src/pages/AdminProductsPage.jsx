import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_URL, request } from "../api";

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const location = useLocation();
  const [tab, setTab] = useState(
    location.pathname.includes("/admin/orders") ? "orders" : "dashboard",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [userJoinedSort, setUserJoinedSort] = useState("desc");
  const [revenueFilter, setRevenueFilter] = useState("overall");
  const navigate = useNavigate();
  const orderStatuses = ["Placed", "Packed", "Shipped", "Delivered"];

  const fetchProducts = async () => {
    const data = await request("/api/products");
    const sortedProducts = [...data].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    setProducts(sortedProducts);
  };

  const fetchAdminOrders = async () => {
    const data = await request("/api/admin/orders");
    setOrders(data);
  };

  const fetchUsers = async () => {
    const data = await request("/api/admin/users");
    setUsers(data);
  };

  const fetchStats = async () => {
    const data = await request("/api/admin/stats");
    setStats(data);
  };

  const loadAdminData = async () => {
    await Promise.all([
      fetchProducts(),
      fetchAdminOrders(),
      fetchUsers(),
      fetchStats(),
    ]);
  };

  useEffect(() => {
    loadAdminData().catch((error) => {
      console.error("Failed to load admin data", error);
    });
  }, []);

  useEffect(() => {
    if (location.pathname.includes("/admin/orders")) {
      setTab("orders");
      return;
    }

    if (location.pathname.includes("/admin/products")) {
      setTab("products");
      return;
    }

    setTab("dashboard");
  }, [location.pathname]);

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    await request(`/api/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    fetchProducts();
    fetchStats();
  };

  const toggleTrending = async (product) => {
    try {
      const formData = new FormData();
      formData.append("isTrending", String(!product.isTrending));

      const res = await fetch(`${API_URL}/api/products/${product._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update trending status");
      }

      fetchProducts();
    } catch (error) {
      console.error("Failed to toggle trending", error);
      alert(error.message || "Failed to update trending status");
    }
  };

  const markDelivered = async (id) => {
    await request(`/api/admin/orders/${id}/deliver`, {
      method: "PATCH",
    });

    fetchAdminOrders();
    fetchStats();
  };

  const updateOrderStatus = async (id, status) => {
    await request(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    fetchAdminOrders();
  };

  const toggleUserRole = async (id) => {
    await request(`/api/admin/users/${id}/role`, {
      method: "PATCH",
    });

    fetchUsers();
  };

  const categories = useMemo(() => {
    return [
      "all",
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];
  }, [products]);

  const filteredProducts = products.filter((product) => {
    const keyword = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !keyword ||
      product.name?.toLowerCase().includes(keyword) ||
      product.category?.toLowerCase().includes(keyword);

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const filteredUsers = [...users]
    .filter((user) => {
      const keyword = userSearchTerm.trim().toLowerCase();

      if (!keyword) {
        return true;
      }

      return (
        user.name?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => {
      if (a.isAdmin !== b.isAdmin) {
        return a.isAdmin ? -1 : 1;
      }

      const firstDate = new Date(a.createdAt).getTime();
      const secondDate = new Date(b.createdAt).getTime();
      return userJoinedSort === "asc"
        ? firstDate - secondDate
        : secondDate - firstDate;
    });

  const filteredRevenue = useMemo(() => {
    const now = new Date();

    const isInRange = (date) => {
      const orderDate = new Date(date);

      if (Number.isNaN(orderDate.getTime())) {
        return false;
      }

      switch (revenueFilter) {
        case "overall":
          return true;
        case "daily":
          return orderDate.toDateString() === now.toDateString();
        case "weekly": {
          const weekStart = new Date(now);
          weekStart.setHours(0, 0, 0, 0);
          weekStart.setDate(now.getDate() - 6);
          return orderDate >= weekStart && orderDate <= now;
        }
        case "monthly":
          return (
            orderDate.getFullYear() === now.getFullYear() &&
            orderDate.getMonth() === now.getMonth()
          );
        case "yearly":
        default:
          return orderDate.getFullYear() === now.getFullYear();
      }
    };

    return orders
      .filter((order) => order.isPaid && isInRange(order.createdAt))
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  }, [orders, revenueFilter]);

  const revenueFilterLabelMap = {
    overall: "Overall",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
  };

  return (
    <div className="container page admin-page">
      <div className="admin-tabs" role="tablist" aria-label="Admin sections">
        {["dashboard", "products", "orders", "users"].map((item) => (
          <button
            key={item}
            className={`admin-tab-btn ${tab === item ? "active" : ""}`}
            onClick={() => setTab(item)}
            type="button"
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <section>
          <div className="admin-header">
            <h2>Admin Dashboard</h2>
          </div>

          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <span>Total Products</span>
              <strong>{stats?.totalProducts ?? 0}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Total Orders</span>
              <strong>{stats?.totalOrders ?? 0}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Total Users</span>
              <strong>{stats?.totalUsers ?? 0}</strong>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card-head">
                <span>Total Revenue</span>
                <select
                  className="admin-stat-filter"
                  value={revenueFilter}
                  onChange={(e) => setRevenueFilter(e.target.value)}
                  aria-label="Filter revenue by period"
                >
                  <option value="overall">Overall</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <strong>₹ {filteredRevenue}</strong>
              <small className="admin-stat-subtext">
                {revenueFilterLabelMap[revenueFilter]} paid revenue
              </small>
            </div>
          </div>

          <div className="admin-dashboard-panels">
            <div className="card">
              <h3>Business Snapshot</h3>
              <p className="muted">
                Low stock products needing attention:{" "}
                <strong>{stats?.lowStockCount ?? 0}</strong>
              </p>
              <p className="muted">
                Paid orders contribute directly to the revenue shown above.
              </p>
            </div>
            <div className="card">
              <h3>Quick Actions</h3>
              <div className="admin-quick-actions">
                <button
                  className="button add-btn"
                  onClick={() => {
                    setTab("products");
                    navigate("/admin/products/new");
                  }}
                >
                  + Add Product
                </button>
                <button className="button" onClick={() => setTab("orders")}>
                  Manage Orders
                </button>
                <button className="button" onClick={() => setTab("users")}>
                  Manage Users
                </button>
              </div>
            </div>
          </div>

          <div className="admin-dashboard-panels analytics-panels">
            <div className="card">
              <h3>Orders Per Day</h3>
              <div className="analytics-list">
                {stats?.ordersPerDay?.length ? (
                  stats.ordersPerDay.map((day) => (
                    <div key={day._id} className="analytics-row">
                      <div className="analytics-label">
                        <strong>{day._id}</strong>
                        <span>{day.orders} orders</span>
                      </div>
                      <div className="analytics-bar-track">
                        <div
                          className="analytics-bar-fill"
                          style={{
                            width: `${Math.max(
                              18,
                              (day.orders /
                                Math.max(...stats.ordersPerDay.map((item) => item.orders), 1)) *
                                100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="muted">No orders yet.</p>
                )}
              </div>
            </div>

            <div className="card">
              <h3>Top Selling Products</h3>
              <div className="analytics-list">
                {stats?.topSellingProducts?.length ? (
                  stats.topSellingProducts.map((product) => (
                    <div key={product._id || product.name} className="analytics-row">
                      <div className="analytics-label">
                        <strong>{product.name}</strong>
                        <span>{product.quantity} sold</span>
                      </div>
                      <div className="analytics-bar-track">
                        <div
                          className="analytics-bar-fill accent"
                          style={{
                            width: `${Math.max(
                              18,
                              (product.quantity /
                                Math.max(
                                  ...stats.topSellingProducts.map((item) => item.quantity),
                                  1,
                                )) *
                                100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="muted">No sales data available yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === "products" && (
        <section>
          <div className="admin-header">
            <h2>Admin Products</h2>

            <button
              className="button add-btn"
              onClick={() => navigate("/admin/products/new")}
            >
              + Add Product
            </button>
          </div>

          <div className="admin-search-row">
            <div className="admin-search-box">
              <span className="admin-search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="admin-search-icon-svg">
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
              <input
                type="text"
                placeholder="Search by product name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="admin-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Trending</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <Link
                          to={`/product/${product._id}`}
                          className="admin-product-link admin-product-image-link"
                          aria-label={`View details for ${product.name}`}
                        >
                          <img
                            src={
                              product.images?.[0]
                                ? `${API_URL}${product.images[0]}`
                                : "/placeholder.png"
                            }
                            alt={product.name}
                            className="admin-img"
                          />
                        </Link>
                      </td>

                      <td>
                        <Link
                          to={`/product/${product._id}`}
                          className="admin-product-link admin-product-name-link"
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td>{product.category || "-"}</td>
                      <td>₹ {product.price}</td>
                      <td>
                        <span
                          className={`stock-pill ${
                            product.countInStock <= 5 ? "low" : ""
                          }`}
                        >
                          {product.countInStock <= 5
                            ? `Low: ${product.countInStock}`
                            : product.countInStock}
                        </span>
                      </td>

                      <td>
                        <label className="trending-toggle" title="Show in Trending">
                          <input
                            type="checkbox"
                            checked={Boolean(product.isTrending)}
                            onChange={() => toggleTrending(product)}
                          />
                          <span
                            className={`trending-toggle-pill ${
                              product.isTrending ? "active" : ""
                            }`}
                          >
                            {product.isTrending ? "Trending" : "Off"}
                          </span>
                        </label>
                      </td>

                      <td>
                        <button
                          className="edit-btn"
                          onClick={() =>
                            navigate(`/admin/products/${product._id}/edit`)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => deleteProduct(product._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="admin-empty-state">
                      No products found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "orders" && (
        <section>
          <div className="admin-header">
            <h2>Order Management</h2>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User Name</th>
                  <th>Total Price</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order._id}>
                      <td className="order-id-cell">#{order._id.slice(-8)}</td>
                      <td>{order.user?.name || "Guest"}</td>
                      <td>₹ {order.totalAmount}</td>
                      <td>
                        <span
                          className={`status-pill ${order.isPaid ? "paid" : "pending"}`}
                        >
                          {order.isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${order.status.toLowerCase()}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="admin-status-select"
                          value={order.status}
                          onChange={(event) =>
                            updateOrderStatus(order._id, event.target.value)
                          }
                        >
                          {orderStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          className="edit-btn"
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                        >
                          View Details
                        </button>
                        <button
                          className="button deliver-btn"
                          onClick={() => markDelivered(order._id)}
                          disabled={order.status === "Delivered"}
                        >
                          {order.status === "Delivered"
                            ? "Delivered"
                            : "Mark as Delivered"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="admin-empty-state">
                      No orders available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "users" && (
        <section>
          <div className="admin-header">
            <h2>User Management</h2>
          </div>

          <div className="admin-search-row">
            <div className="admin-search-box">
              <span className="admin-search-icon" aria-hidden="true">
                <svg
                  className="admin-search-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M16 16L21 21"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by user name, email, or phone..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </div>

            <div className="admin-inline-stat">
              <span>Total Users</span>
              <strong>{filteredUsers.length}</strong>
            </div>

            <select
              className="admin-category-filter"
              value={userJoinedSort}
              onChange={(e) => setUserJoinedSort(e.target.value)}
            >
              <option value="desc">Joined: Latest First</option>
              <option value="asc">Joined: Oldest First</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Joined</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email || user.phone || "—"}</td>
                      <td>
                        {new Date(user.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td>
                        <span
                          className={`status-pill ${user.isAdmin ? "delivered" : "pending"}`}
                        >
                          {user.isAdmin ? "Admin" : "User"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="button"
                          onClick={() => toggleUserRole(user._id)}
                        >
                          {user.isAdmin ? "Remove Admin" : "Make Admin"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="admin-empty-state">
                      No users found for this search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminProductsPage;
