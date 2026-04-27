import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import MyOrdersPage from "./pages/MyOrdersPage";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage"; // ✅ FIX
import PaymentPage from "./pages/PaymentPage";
import SavedProductsPage from "./pages/SavedProductsPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminProductFormPage from "./pages/AdminProductFormPage";
import AdminOrderDetailsPage from "./pages/AdminOrderDetailsPage";
import ShippingPage from "./pages/ShippingPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrderFailurePage from "./pages/OrderFailurePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RecentViewsPage from "./pages/RecentViewsPage";
import TrendingPage from "./pages/TrendingPage";

const App = () => {
  return (
    <>
      <Header />

      <Routes>
        {/* 🏠 MAIN */}
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/products" element={<Navigate to="/" replace />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/recent-views" element={<RecentViewsPage />} />
        <Route path="/trending" element={<TrendingPage />} />
        <Route path="/saved" element={<SavedProductsPage />} />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <MyOrdersPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/success"
          element={
            <PrivateRoute>
              <OrderSuccessPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment-failed"
          element={
            <PrivateRoute>
              <OrderFailurePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminProductsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders/:id"
          element={
            <AdminRoute>
              <AdminOrderDetailsPage />
            </AdminRoute>
          }
        />
        {/* 🔐 AUTH */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* 🛒 CART */}
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <CartPage />
            </PrivateRoute>
          }
        />
        {/* {PaymentPage} */}
        <Route
          path="/payment"
          element={
            <PrivateRoute>
              <PaymentPage />
            </PrivateRoute>
          }
        />

        {/* 🔥 CHECKOUT (FIXED) */}
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/shipping"
          element={
            <PrivateRoute>
              <ShippingPage />
            </PrivateRoute>
          }
        />

        {/* 🔐 ADMIN */}
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProductsPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/products/new"
          element={
            <AdminRoute>
              <AdminProductFormPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/products/:id/edit"
          element={
            <AdminRoute>
              <AdminProductFormPage />
            </AdminRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
