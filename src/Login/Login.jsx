import React, { useState } from "react";
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

  // Validation function
  const validateField = (name, value) => {
    let msg = "";
    if (name === "email") {
      if (!value.trim()) {
        msg = "Username is required";
      } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value)) {
        msg = "Enter a valid email address";
      }
    } else if (name === "password") {
      if (!value.trim()) {
        msg = "Password is required";
      }
    }
    setError((prev) => ({ ...prev, [name === "email" ? "userName" : "passWord"]: msg }));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    validateField("email", e.target.value); // validate on change
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    validateField("password", e.target.value); // validate on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields on submit
    let newErrors = {};
    if (!email.trim()) newErrors.userName = "Username is required";
    else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email))
      newErrors.userName = "Enter a valid email address";

    if (!password.trim()) newErrors.passWord = "Password is required";

    setError(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        const res = await LoginUser(email, password);

        if (res?.data?.data?.data.role === "user") {
          const token = res?.data?.data.token;
          const userId = res?.data?.data?.data.userId;
          const studentId = res?.data?.data?.data.studentId;

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

  return (
    <div className={styles.loginPage}>
      <div className={styles.logoWrapper}>
        <img src={schoolLogo} alt="ALO School Logo" />
      </div>

      <div className={styles.card}>
        <h2>Welcome Back!</h2>
        <p className={styles.subTitle}>Stay on top of your attendance</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputBox}>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
            />
            <p className={styles.errorMsg}>{error.userName}</p>
          </div>

          <div className={styles.inputBox}>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={handlePasswordChange}
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

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>
      </div>

      <ToastContainer position="top-center" autoClose={1000} />
    </div>
  );
};

export default Login;
