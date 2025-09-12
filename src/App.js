
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./Dashboard/Dashboard";
import LeaveManagement from "./LeaveManagement/LeaveManagement";
import Policies from "./Policies/PoliciesApp";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Login from "./Login/Login";
import PrivateRoute from "./api/PrivateRouter";
import Header from "./Layouts/Header";
import { useState, useEffect } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  // Check localStorage on first render
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
  };

  const showHeader = isAuthenticated && location.pathname !== "/login";

  return (
    <>
      {showHeader && <Header handleLogout={handleLogout} />}

      <Routes>
        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login Page */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              // ✅ Redirect to *last visited page* instead of forcing dashboard
              <Navigate to={location.state?.from || `/dashboard/${localStorage.getItem("userId")}`} replace />
            ) : (
              <Login setLoginUser={setIsAuthenticated} />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard/:userId"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/leave-management/:userId"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <LeaveManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/policies/:userId"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Policies />
            </PrivateRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;