import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import logo from "../assets/AloLogo/image.png";
import LogoutModal from "../Logout/LogoutModal";
import { getUserId,getNotification,
  updateNotification, } from "../api/serviceapi";

const Header = ({ handleLogout }) => {
  const userId = localStorage.getItem("userId");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
   const [notifi, setNotifi] = useState([]);
  const [attId,setAttId]=useState("")
  const [fetchCount, setFetchCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);

  const notifyIconRef = useRef(null);
   const fetchNotification = async () => {
    try {
      if (!userId) return;
      const response = await getNotification(userId);
      const data = response.data?.data?.data || [];
      const id = response.data?.data?.data?.[0]?._id;
      const count = response.data?.data?.fetchCount || 0;
      console.log("noti", response.data?.data?.data);
      setNotifi(data);
      setAttId(id)
      console.log("idddd", id);
      setFetchCount(count);
    } catch (err) {
      console.error("Error fetching notifications:", err.message);
    }
  };

  useEffect(() => {
    fetchNotification();
    const interval = setInterval(() => {
      fetchNotification();
    }, 10000);

    return () => clearInterval(interval);
  }, [userId]);

  // sample notifications
  const notifications = notifi.map((n) => ({
    id: n._id,
    title: n.message,
    date: n.date,
  }));
  const notificationClick = async (id) => {
  try {
    console.log("Clicked notification id:", id);
    await updateNotification(id, true); // ✅ mark as read
    fetchNotification(); // refresh list after update
  } catch (err) {
    console.error("Error updating notification:", err.message);
  }
};

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
  
   fetchUser();
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
        
        <div
          className={styles.notificationWrapper}
          style={{ position: "relative" }}
        >
          <i
            ref={notifyIconRef}
            className={`fa-solid fa-bell ${styles.notificationIcon}`}
            onClick={() => setShowNotifications((s) => !s)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                setShowNotifications((s) => !s);
            }}
            aria-expanded={showNotifications}
            aria-label="Notifications"
          />

          {/* ✅ Red Dot */}
          {fetchCount > 0 && <span className={styles.redDot}></span>}
          {/* Dropdown */}
          {showNotifications && (
            <div className={styles.dropdown} ref={dropdownRef}>
              <h3 className={styles.dropdownHeader}>Notifications</h3>

              {notifications.length === 0 ? (
                <p className={styles.noNotifications}>No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={styles.notificationItem}
                    onClick={() => notificationClick(n.id)}
                  >
                    <div className={styles.textBlock}>
                      <h4>{n.title}</h4>
                    </div>
                  </div>
                ))
              )}
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
