// src/logout/LogoutModal.jsx
import React from "react";
import styles from "./LogoutModal.module.css";
import logoutImg from "../assets/AloLogo/logout.png"// <-- Add your image in the same folder

const LogoutModal = ({ closeModal, onConfirmLogout }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Image */}
        <img src={logoutImg} alt="Logout" className={styles.image} />

        {/* Message */}
        <p className={styles.message}>Are you sure you want to logout?</p>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.confirm}`}
            onClick={onConfirmLogout}
          >
            Yes
          </button>
          <button
            className={`${styles.btn} ${styles.cancel}`}
            onClick={closeModal}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
