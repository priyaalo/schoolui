import React, { useState } from "react";
import styles from "./Login.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { LoginUser } from "../api/serviceapi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import schoolLogo from "../assets/AloLogo/Frame 29135.png";

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
        msg = "Email is required";
      } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value)) {
        msg = "Enter a valid email address";
      }
    } else if (name === "password") {
      if (!value.trim()) {
        msg = "Password is required";
      }
    }
    setError((prev) => ({
      ...prev,
      [name === "email" ? "userName" : "passWord"]: msg,
    }));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    validateField("email", e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    validateField("password", e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!email.trim()) newErrors.userName = "Email is required";
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
          sessionStorage.setItem("authToken", token);
          sessionStorage.setItem("userId", userId);
          sessionStorage.setItem("studentId", studentId);

          setLoginUser(true);
          navigate(`/dashboard/${userId}`, { replace: true });
        }
      } catch (err) {
        const errorMsg =
          err?.response?.data?.message || "Invalid Email or password!";
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
      <div className={styles.card}>
        {/* ✅ Everything inside form */}
       <form onSubmit={handleSubmit}>
  <div className={styles.logoWrapper}>
    <img src={schoolLogo} alt="ALO School Logo" />
  </div>
  <div className={styles.content}>
    <h2>Welcome Back!</h2>
  <p className={styles.subTitle}>Stay on top of your attendance</p>
  </div>
  

  <div className={styles.inputBox}>
    <input
      type="text"
      placeholder="Enter your Email"
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

  {/* ✅ Forgot Password link inside form */}
  

  <button type="submit" className={styles.loginBtn} disabled={loading}>
    {loading ? (
      <div className={styles.loader} title="1">
        <svg
          version="1.1"
          id="loader-1"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="24px"
          height="24px"
          viewBox="0 0 50 50"
          xmlSpace="preserve"
        >
          <path
            fill="#fff"
            d="M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068
               c0-8.071,6.543-14.615,14.615-14.615V6.461z"
          >
            <animateTransform
              attributeType="xml"
              attributeName="transform"
              type="rotate"
              from="0 25 25"
              to="360 25 25"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
    ) : (
      "Login"
    )}
  </button>
</form>

      </div>

      <ToastContainer position="top-right" autoClose={1000} />
    </div>
  );
};

export default Login;