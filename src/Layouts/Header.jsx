import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import logo from "../assets/AloLogo/alo-logo.png";
import LogoutModal from "../Logout/LogoutModal";
import { getUserId, getNotification, updateNotification } from "../api/serviceapi";
import { FaUserCircle } from "react-icons/fa";

const Header = ({ handleLogout }) => {
  const userId = localStorage.getItem("userId");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [notifi, setNotifi] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);
  const notifyIconRef = useRef(null);

  // Fetch notifications
  const fetchNotification = async () => {
    try {
      if (!userId) return;
      const response = await getNotification(userId);
      const data = response.data?.data?.data || [];
      setNotifi(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  // Fetch user profile
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

  // Close dropdown when clicking outside
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

  // Close notifications when route changes
  useEffect(() => {
    setShowNotifications(false);
  }, [location.pathname]);

  const confirmLogout = () => {
    if (typeof handleLogout === "function") handleLogout();
    navigate("/login", { replace: true });
  };

  // Handle bell click: open dropdown and mark unread as read
  const handleBellClick = async () => {
    setShowNotifications((prev) => !prev);

    const unreadNotifications = notifi.filter(n => !n.isRead);
    if (unreadNotifications.length > 0) {
      try {
        // Mark all unread notifications as read
        await Promise.all(
          unreadNotifications.map(n => updateNotification(n._id, true))
        );

        // Update local state immediately
        setNotifi(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error(err.message);
      }
    }
  };

  return (
    <header className={styles.headerContainer}>
      {/* Logo + Hamburger */}
      <div className={styles.logoWrapper}>
        <img src={logo} alt="ALO School Logo" className={styles.logo} />
        <button
          className={styles.hamburger}
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
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
        {/* Profile */}
        <div className={styles.profile}>
          {userProfile?.profileURL ? (
            <img src={userProfile.profileURL} alt={userProfile.name || "User"} className={styles.profilePic} />
          ) : (
            <FaUserCircle size={50} color="#ccc" className={styles.profilePic} />
          )}
          <div className={styles.profileInfo}>
            <h4>{userProfile?.name ? userProfile.name.charAt(0).toUpperCase() + userProfile.name.slice(1) : "Loading..."}</h4>
            <p>{userProfile?.courseDetails?.courseName || ""}</p>
          </div>
        </div>

        {/* Logout */}
        <div className={styles.logoutWrapper}>
          <i className={`fa-solid fa-arrow-right-from-bracket ${styles.logoutIcon}`} onClick={() => setShowLogoutModal(true)} />
        </div>

        {/* Notifications */}
        <div className={styles.notificationWrapper}>
          <i
            ref={notifyIconRef}
            className={`fa-solid fa-bell ${styles.notificationIcon}`}
            onClick={handleBellClick}
          />
          {notifi.some(n => !n.isRead) && <span className={styles.redDot}></span>}

          {showNotifications && (
            <div className={styles.dropdown} ref={dropdownRef}>
              {/* Dropdown Title + Close Icon */}
              <div className={styles.dropdownHeaderWrapper}>
  <h3 className={styles.dropdownHeader}>Notifications</h3>
  <button
    className={styles.closeBtn}
    onClick={() => setShowNotifications(false)}
  >
    &times;
  </button>
</div>


              {/* Notifications */}
              {notifi.length === 0 ? (
                <p className={styles.noNotifications}>No notifications</p>
              ) : (
                notifi.map((n) => {
                  const dateObj = new Date(n.date);
                  const day = dateObj.getDate();
                  const monthYear = dateObj.toLocaleString("default", { month: "short", year: "2-digit" });

                  return (
                    <div key={n._id} className={styles.notificationItem}>
                      <div className={styles.textBlock}>
                        {/* Message */}
                        <div className={styles.messageWrapper}>
                          <span className={styles.message}>{n.message}</span>
                          {n.subMessage && <span className={styles.subMessage}>{n.subMessage}</span>}
                        </div>
                        {/* Date */}
                        <div className={styles.dateBlock}>
                          <span className={styles.day}>{day}</span>
                          <span className={styles.monthYear}>{monthYear}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {showLogoutModal && (
        <LogoutModal closeModal={() => setShowLogoutModal(false)} onConfirmLogout={confirmLogout} />
      )}
    </header>
  );
};

export default Header;
