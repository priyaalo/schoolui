import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./Dashboard/Dashboard";
import LeaveManagement from "./LeaveManagement/LeaveManagement";
import Policies from "./Policies/PoliciesApp";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Login from "./Login/Login";
import PrivateRoute from "./api/PrivateRouter";
import Header from "./Layouts/Header";
import { useState } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
  };

  // Show Header only for authenticated users
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
              <Navigate
                to={`/dashboard/${localStorage.getItem("userId")}`}
                replace
              />
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App; 