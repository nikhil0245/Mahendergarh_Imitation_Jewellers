import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, authChecked } = useAuth();

  // 🔥 jab tak localStorage load nahi hota
  if (!authChecked) {
    return <div>Checking admin...</div>;
  }

  // 🔥 admin check
  if (user && user.isAdmin) {
    return children;
  }

  return <Navigate to="/" replace />;
};

export default AdminRoute;
