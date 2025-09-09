import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import logo from "../assets/AloLogo/image.png";
import LogoutModal from "../Logout/LogoutModal";
import { getUserId } from "../api/serviceapi";

const Header = ({ handleLogout }) => {
  const userId = localStorage.getItem("userId");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);
  const notifyIconRef = useRef(null);

  // sample notifications
  const notifications = [
    { id: 1, type: "birthday", title: "User01 Birthday", subtitle: "AK0009", date: "22 Jan 2025", unread: true },
    { id: 2, type: "birthday", title: "User02 Birthday", subtitle: "AK0012", date: "22 Jan 2025", unread: true },
    { id: 3, type: "leave", title: "Your Sick Leave Approved", subtitle: "AK0010", date: "24 Jan 2025", unread: false },
  ];

  const fetchUser = async () => {
    try {
      if (!userId) return;
      const res = await getUserId(userId);
      const profileData = res.data?.data?.data?.[0] || res.data?.data;
      setUserProfile(profileData);
    } catch (err) {
      console.error("Error fetching user:", err.message);
    }
  };

  useEffect(() => {
  //   if (!userId) {
  //     navigate("/login", { replace: true });
  //     return;
  //   }
   fetchUser();
  }, [userId, navigate]);

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

  const confirmLogout = () => {
    if (typeof handleLogout === "function") handleLogout();
    navigate("/login", { replace: true });
  };

  return (
    <header className={styles.headerContainer}>
      {/* Logo + Nav */}
      <div className={styles.nav}>
        <div className={styles.logoWrapper}>
          <img src={logo} alt="ALO School Logo" className={styles.logo} />
        </div>

        <div className={styles.links}>
          <button
            className={`${styles.linkBtn} ${
              location.pathname.includes("/dashboard") ? styles.activeLink : ""
            }`}
            onClick={() => navigate(`/dashboard/${userId}`)}
          >
            Attendance
          </button>

          <button
            className={`${styles.linkBtn} ${
              location.pathname.includes("/leave-management") ? styles.activeLink : ""
            }`}
            onClick={() => navigate(`/leave-management/${userId}`)}
          >
            Leave Management
          </button>

          <button
            className={`${styles.linkBtn} ${
              location.pathname.includes("/policies") ? styles.activeLink : ""
            }`}
            onClick={() => navigate(`/policies/${userId}`)}
          >
            Policies
          </button>
        </div>
      </div>

      {/* Profile + Logout + Notifications */}
      <div className={styles.rightSection}>
        <div className={styles.profile}>
          <img
            src={userProfile?.profileURL || "/default-avatar.png"}
            alt={userProfile?.name || "User"}
            className={styles.profilePic}
          />
          <div className={styles.profileInfo}>
            <h4>{userProfile?.name || "Loading..."}</h4>
            <p>{userProfile?.courseDetails?.courseName || ""}</p>
          </div>
        </div>

        {/* Logout */}
        <div className={styles.logoutWrapper}>
          <i
            className={`fa-solid fa-arrow-right-from-bracket ${styles.logoutIcon}`}
            onClick={() => setShowLogoutModal(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setShowLogoutModal(true);
            }}
            aria-label="Logout"
          />
        </div>

        {/* Notifications (after logout) */}
        <div className={styles.notificationWrapper} style={{ position: "relative" }}>
          <i
            ref={notifyIconRef}
            className={`fa-solid fa-bell ${styles.notificationIcon}`}
            onClick={() => setShowNotifications((s) => !s)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setShowNotifications((s) => !s);
            }}
            aria-expanded={showNotifications}
            aria-label="Notifications"
          />

          {/* Dropdown */}
          {showNotifications && (
            <div className={styles.dropdown} ref={dropdownRef}>
              <h3 className={styles.dropdownHeader}>Notifications</h3>
              {notifications.map((n) => (
                <div key={n.id} className={styles.notificationItem}>
                  <div>
                    <button
                      className={n.type === "birthday" ? styles.circleBlue : styles.circleOrange}
                      aria-hidden
                    >
                      {n.type === "birthday" ? "BD" : "SL"}
                    </button>
                  </div>

                  <div className={styles.textBlock}>
                    <h4>{n.title}</h4>
                    <p>{n.subtitle}</p>
                  </div>

                  <div className={styles.dateBlock}>
                    <span className={styles.day}>{n.date.split(" ")[0]}</span>
                    <span className={styles.monthYear}>{n.date.split(" ").slice(1).join(" ")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logout modal */}
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
