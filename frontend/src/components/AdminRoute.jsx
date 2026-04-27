import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  // 🔥 jab tak localStorage load nahi hota
  if (user === null) {
    return <div>Checking admin...</div>;
  }

  // 🔥 admin check
  if (user && user.isAdmin) {
    return children;
  }

  return <Navigate to="/" replace />;
};

export default AdminRoute;
