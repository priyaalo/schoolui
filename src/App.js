import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./Dashboard/Dashboard";
import LeaveManagement from "./LeaveManagement/LeaveManagement";
import Policies from "./Policies/PoliciesApp";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Login from "./Login/Login";
import PrivateRoute from "./api/PrivateRouter";
import Header from "./Layouts/Header";
import { useState, useEffect } from "react";
import ScrollToTop from "./ScrollToTop";   // ✅ import here

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const location = useLocation();

  // On first render, check auth token
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) setIsAuthenticated(true);
    setCheckingAuth(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
  };

  const showHeader = isAuthenticated && location.pathname !== "/login";

  if (checkingAuth) return null;

  return (
    <>
      {/* ✅ This makes every route change reset scroll */}
      <ScrollToTop />

      {showHeader && <Header handleLogout={handleLogout} />}

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login Page */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              
              <Navigate to={ `/dashboard/${localStorage.getItem("userId")}`} replace />
            ) : (
              <Login setLoginUser={setIsAuthenticated} />
            )
          }
        />

       
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
