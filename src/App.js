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
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem("authToken"));

  const handleLogout = () => {
    sessionStorage.clear(); // remove token & userId
    setIsAuthenticated(false);
  };

  const showHeader = isAuthenticated && location.pathname !== "/login";

  return (
    <>
      {showHeader && <Header handleLogout={handleLogout} />}

      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login page */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate
                to={`/dashboard/${sessionStorage.getItem("userId")}`}
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
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/leave-management/:userId"
          element={
            <PrivateRoute>
              <LeaveManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/policies/:userId"
          element={
            <PrivateRoute>
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