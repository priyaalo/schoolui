import React, { useState } from "react";
import styles from "./LogoutModal.module.css";
import logoutImg from "../assets/AloLogo/logout.png"// <-- Add your image in the same folder

const LogoutModal = ({ closeModal, onConfirmLogout }) => {
   const [loading, setLoading] = useState(false);
  const handleLogout = async () => {
    setLoading(true);
    try {
      await onConfirmLogout(); // wait until logout is done
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };
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
            onClick={handleLogout}
            disabled={loading}
          >
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
                                                "Yes"
                                              )}
          </button>
          <button
            className={`${styles.btn} ${styles.cancel}`}
            onClick={closeModal}
            disabled={loading}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;