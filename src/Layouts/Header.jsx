import React, { useState, useEffect, useRef, useCallback } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import logo from "../assets/AloLogo/alo-logo.png";
import LogoutModal from "../Logout/LogoutModal";
import {
  getUserId,
  getNotification,
  updateNotification,
} from "../api/serviceapi";
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
  const fetchNotification = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await getNotification(userId);
      const data = response.data?.data?.data || [];
      setNotifi(data);
    } catch (err) {
      console.error(err.message);
    }
  });

  // Fetch user profile
  const fetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await getUserId(userId);
      const profileData = res.data?.data?.data?.[0] || res.data?.data;
      setUserProfile(profileData);
    } catch (err) {
      console.error(err.message);
    }
  });

  useEffect(() => {
    fetchUser();
    fetchNotification();
    const interval = setInterval(fetchNotification, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  // Close dropdown if clicked outside
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

  // Close dropdown & hamburger on route change
  useEffect(() => {
    setShowNotifications(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const confirmLogout = () => {
    if (typeof handleLogout === "function") handleLogout();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("studentId");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("studentId");
        navigate("/login", { replace: true });

  };

  const handleBellClick = async () => {
    setShowNotifications((prev) => !prev);
    const unread = notifi.filter((n) => !n.isRead);
    if (unread.length) {
      try {
        await Promise.all(unread.map((n) => updateNotification(n._id, true)));
        setNotifi((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (err) {
        console.error(err.message);
      }
    }
  };

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={styles.headerContainer}>
      {/* Logo */}
      <div
        className={styles.logoWrapper}
        onClick={() => navigate(`/dashboard/${userId}`)}
        style={{ cursor: "pointer" }} // makes it look clickable
      >
        <img src={logo} alt="ALO Logo" className={styles.logo} />
      </div>

      {/* Hamburger + Mobile Right Section */}
      <div className={styles.rightSectionMobile}>
        {/* Notification */}
        <div className={styles.notificationWrapper}>
          <i
            ref={notifyIconRef}
            className={`fa-solid fa-bell ${styles.notificationIcon}`}
            onClick={handleBellClick}
          />
          {notifi.some((n) => !n.isRead) && (
            <span className={styles.redDot}></span>
          )}
          {showNotifications && (
            <div className={styles.dropdown} ref={dropdownRef}>
              <div className={styles.dropdownHeaderWrapper}>
                <h3 className={styles.dropdownHeader}>Notifications</h3>
                <button
                  className={styles.closeBtn}
                  onClick={() => setShowNotifications(false)}
                >
                  &times;
                </button>
              </div>
              {notifi.length === 0 ? (
                <p className={styles.noNotifications}>No notifications</p>
              ) : (
                notifi.map((n) => {
                  const dateObj = new Date(n.date);
                  return (
                    <div key={n._id} className={styles.notificationItem}>
                      <div className={styles.textBlock}>
                        <h4>{n.message}</h4>
                        {n.subMessage && <p>{n.subMessage}</p>}
                      </div>
                      <div className={styles.dateBlock}>
                        <span className={styles.day}>{dateObj.getDate()}</span>
                        <span className={styles.monthYear}>
                          {dateObj.toLocaleString("default", {
                            month: "short",
                            year: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Logout */}
        <i
          className={`fa-solid fa-arrow-right-from-bracket ${styles.logoutIcon}`}
          onClick={() => setShowLogoutModal(true)}
        />

        {/* Hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          <span
            className={`${styles.bar} ${isMobileMenuOpen ? styles.open : ""}`}
          />
          <span
            className={`${styles.bar} ${isMobileMenuOpen ? styles.open : ""}`}
          />
          <span
            className={`${styles.bar} ${isMobileMenuOpen ? styles.open : ""}`}
          />
        </button>
      </div>

      {/* Nav Links */}
      <nav
        className={`${styles.nav} ${isMobileMenuOpen ? styles.mobileOpen : ""}`}
      >
        <div className={styles.links}>
          <button
            className={`${styles.linkBtn} ${
              location.pathname.includes("/dashboard") ? styles.activeLink : ""
            }`}
            onClick={() => handleNavClick(`/dashboard/${userId}`)}
          >
            Attendance
          </button>
          <button
            className={`${styles.linkBtn} ${
              location.pathname.includes("/leave-management")
                ? styles.activeLink
                : ""
            }`}
            onClick={() => handleNavClick(`/leave-management/${userId}`)}
          >
            Leave Management
          </button>
          <button
            className={`${styles.linkBtn} ${
              location.pathname.includes("/policies") ? styles.activeLink : ""
            }`}
            onClick={() => handleNavClick(`/policies/${userId}`)}
          >
            Policies
          </button>
        </div>
      </nav>

      {/* Desktop Right Section */}
      <div className={`${styles.rightSection} ${styles.hideOnMobile}`}>
        <div className={styles.profile}>
          {userProfile?.profileURL ? (
            <img
              src={userProfile.profileURL}
              alt={userProfile?.name || "User"}
              className={styles.profilePic}
            />
          ) : (
            <FaUserCircle
              size={50}
              color="#ccc"
              className={styles.profilePic}
            />
          )}
          <div className={styles.profileInfo}>
            <h4>{userProfile?.name || "User"}</h4>
            <p>{userProfile?.courseDetails?.courseName || "loading ....."}</p>
          </div>
        </div>

        <i
          className={`fa-solid fa-arrow-right-from-bracket ${styles.logoutIcon}`}
          onClick={() => setShowLogoutModal(true)}
        />

        <div className={styles.notificationWrapper}>
          <i
            ref={notifyIconRef}
            className={`fa-solid fa-bell ${styles.notificationIcon}`}
            onClick={handleBellClick}
          />
          {notifi.some((n) => !n.isRead) && (
            <span className={styles.redDot}></span>
          )}
          {showNotifications && (
            <div className={styles.dropdown} ref={dropdownRef}>
              <div className={styles.dropdownHeaderWrapper}>
                <h3 className={styles.dropdownHeader}>Notifications</h3>
                <button
                  className={styles.closeBtn}
                  onClick={() => setShowNotifications(false)}
                >
                  &times;
                </button>
              </div>
              {notifi.length === 0 ? (
                <p className={styles.noNotifications}>No notifications</p>
              ) : (
                notifi.map((n) => {
                  const dateObj = new Date(n.date);
                  return (
                    <div key={n._id} className={styles.notificationItem}>
                      <div className={styles.textBlock}>
                        <h4>{n.message}</h4>
                        {n.subMessage && <p>{n.subMessage}</p>}
                      </div>
                      <div className={styles.dateBlock}>
                        <span className={styles.day}>{dateObj.getDate()}</span>
                        <span className={styles.monthYear}>
                          {dateObj.toLocaleString("default", {
                            month: "short",
                            year: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutModal
          closeModal={() => setShowLogoutModal(false)}
          onConfirmLogout={confirmLogout}
        />
      )}
    </header>
  );
};

export default Header;
