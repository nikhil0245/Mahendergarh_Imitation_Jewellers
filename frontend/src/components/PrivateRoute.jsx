import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, authChecked } = useAuth();

  if (!authChecked) {
    return <div>Checking login...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
