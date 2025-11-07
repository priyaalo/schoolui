import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ isAuthenticated, children }) => {
  const location = useLocation();
  const userId = localStorage.getItem("userId");

  if (!isAuthenticated || !userId) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default PrivateRoute;