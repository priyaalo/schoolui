import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import logo from "../assets/AloLogo/image.png";
import LogoutModal from "../Logout/LogoutModal";
import { getUserId, getNotification, updateNotification } from "../api/serviceapi";

const Header = ({ handleLogout }) => {
  const userId = localStorage.getItem("userId");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [notifi, setNotifi] = useState([]);
  const [fetchCount, setFetchCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);
  const notifyIconRef = useRef(null);

  const fetchNotification = async () => {
    try {
      if (!userId) return;
      const response = await getNotification(userId);
      const data = response.data?.data?.data || [];
      const count = response.data?.data?.fetchCount || 0;
      setNotifi(data);
      setFetchCount(count);
    } catch (err) {
      console.error(err.message);
    }
  };

  const fetchUser = async () => {
    try {
      if (!userId) return;
      const res = await getUserId(userId);
      const profileData = res.data?.data?.data?.[0] || res.data?.data;
      setUserProfile(profileData);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchNotification();
    const interval = setInterval(fetchNotification, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showNotifications &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        notifyIconRef.current &&
        !notifyIconRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  useEffect(() => {
    setShowNotifications(false);
  }, [location.pathname]);

  const notificationClick = async (id) => {
    try {
      await updateNotification(id, true);
      fetchNotification();
    } catch (err) {
      console.error(err.message);
    }
  };

  const confirmLogout = () => {
    if (typeof handleLogout === "function") handleLogout();
    navigate("/login", { replace: true });
  };

  return (
    <header className={styles.headerContainer}>
      {/* Logo + Hamburger */}
      <div className={styles.logoWrapper}>
        <img src={logo} alt="ALO School Logo" className={styles.logo} />
        <button
          className={styles.hamburger}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          <span className={`${styles.bar} ${isMobileMenuOpen ? styles.open : ""}`} />
          <span className={`${styles.bar} ${isMobileMenuOpen ? styles.open : ""}`} />
          <span className={`${styles.bar} ${isMobileMenuOpen ? styles.open : ""}`} />
        </button>
      </div>

      {/* Nav Links */}
      <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.mobileOpen : ""}`}>
        <div className={styles.links}>
          <button
            className={`${styles.linkBtn} ${location.pathname.includes("/dashboard") ? styles.activeLink : ""}`}
            onClick={() => navigate(`/dashboard/${userId}`)}
          >
            Attendance
          </button>
          <button
            className={`${styles.linkBtn} ${location.pathname.includes("/leave-management") ? styles.activeLink : ""}`}
            onClick={() => navigate(`/leave-management/${userId}`)}
          >
            Leave Management
          </button>
          <button
            className={`${styles.linkBtn} ${location.pathname.includes("/policies") ? styles.activeLink : ""}`}
            onClick={() => navigate(`/policies/${userId}`)}
          >
            Policies
          </button>
        </div>
      </nav>

      {/* Right Section */}
      <div className={styles.rightSection}>
        <div className={styles.profile}>
          <img src={userProfile?.profileURL || "/default-avatar.png"} alt={userProfile?.name || "User"} className={styles.profilePic} />
          <div className={styles.profileInfo}>
            <h4>{userProfile?.name || "Loading..."}</h4>
            <p>{userProfile?.courseDetails?.courseName || ""}</p>
          </div>
        </div>

        <div className={styles.logoutWrapper}>
          <i className={`fa-solid fa-arrow-right-from-bracket ${styles.logoutIcon}`} onClick={() => setShowLogoutModal(true)} />
        </div>

        <div className={styles.notificationWrapper}>
          <i
            ref={notifyIconRef}
            className={`fa-solid fa-bell ${styles.notificationIcon}`}
            onClick={() => setShowNotifications((s) => !s)}
          />
          {fetchCount > 0 && <span className={styles.redDot}></span>}

          {showNotifications && (
            <div className={styles.dropdown} ref={dropdownRef}>
              <h3 className={styles.dropdownHeader}>Notifications</h3>
              {notifi.length === 0 ? (
                <p className={styles.noNotifications}>No notifications</p>
              ) : (
                notifi.map((n) => (
                  <div key={n._id} className={styles.notificationItem} onClick={() => notificationClick(n._id)}>
                    <div className={styles.textBlock}>
                      <h4>{n.message}</h4>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showLogoutModal && <LogoutModal closeModal={() => setShowLogoutModal(false)} onConfirmLogout={confirmLogout} />}
    </header>
  );
};

export default Header;
