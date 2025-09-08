import React, { useState, useEffect } from "react";
import styles from "./Login.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { LoginUser } from "../api/serviceapi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import schoolLogo from "../assets/AloLogo/alo-logo.png";

const Login = ({ setLoginUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});

  const navigate = useNavigate();

  function Validation() {
    let newErrors = {};
    if (!email.trim()) {
      newErrors.userName = "Username is required";
    } else if (
      !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email.trim())
    ) {
      newErrors.userName = "Enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.passWord = "Password is required";
    }
    setError(newErrors);
    return newErrors;
  }

  const handleClick = async (e) => {
    e.preventDefault();
    let validation = Validation();

    if (Object.keys(validation).length === 0) {
      try {
        setLoading(true);
        const res = await LoginUser(email, password);

        if (res?.data?.data?.data.role === "user") {
          let token = res?.data?.data.token;
          let userId = res?.data?.data?.data.userId;
          let studentId = res?.data?.data?.data.studentId;
          let checkInStatus = res?.data?.data?.data.checkInStatus;

          localStorage.setItem("authToken", token);
          localStorage.setItem("userId", userId);
          localStorage.setItem("studentId", studentId);
          

          setLoginUser(true);
          navigate(`/dashboard/${userId}`, { replace: true });
        }
      } catch (err) {
        const errorMsg =
          err?.response?.data?.message || "Invalid username or password!";
        toast.error(errorMsg, {
          className: `${styles.customToast}`,
          closeButton: false,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const id = localStorage.getItem("userId");
    if (token && id) {
      navigate(`/dashboard/${id}`, { replace: true });
    }
  }, [navigate]);

  return (
    <div className={styles.loginPage}>
      {/* Floating Logo */}
      <div className={styles.logoWrapper}>
         <img src={schoolLogo} alt="ALO School Logo" /> 
      </div>

      {/* Card */}
      <div className={styles.card}>
        <h2>Welcome Back!</h2>
        <p className={styles.subTitle}>Power up your productivity</p>

        <form onSubmit={handleClick}>
          {/* Username */}
          <div className={styles.inputBox}>
            <input
              type="text"
              placeholder="User name"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className={styles.errorMsg}>{error.userName}</p>
          </div>

          {/* Password */}
          <div className={styles.inputBox}>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeIcon}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
            <p className={styles.errorMsg}>{error.passWord}</p>
          </div>

          {/* Forgot password */}
          

          {/* Submit */}
          <button
            type="submit"
            className={styles.loginBtn}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>
      </div>

      <ToastContainer position="top-center" autoClose={1000} />
    </div>
  );
};

export default Login;
