import React from "react";
import styles from "./CheckInModal.module.css";
import  { useState } from "react";

import checkInImg from "../assets/AloLogo/checkin.png" // <-- Add your check-in image in the same folder

const CheckInModal = ({ isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;
   const handleConfirmClick = async () => {
     try {
       setLoading(true);
       await onConfirm(); // parent function (handleCheckIn)
     } finally {
       setLoading(false);
     }
   };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Image */}
        <img src={checkInImg} alt="Check In" className={styles.image} />

        {/* Message */}
        <h2>Are you sure you want to check in now?</h2>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.confirm}
            onClick={handleConfirmClick}
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
            className={styles.cancel}
            onClick={onClose}
            disabled={loading}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInModal;