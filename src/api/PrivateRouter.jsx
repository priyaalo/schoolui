import { Navigate } from "react-router-dom";

const PrivateRoute = ({ isAuthenticated, loading, children }) => {
  if (loading) return <p>Loading...</p>; // show loader while checking auth
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
