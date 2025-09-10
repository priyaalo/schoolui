import { Navigate } from "react-router-dom";

const PrivateRoute = ({ isAuthenticated, children }) => {
  const userId = localStorage.getItem("userId");

  if (!isAuthenticated || !userId) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;