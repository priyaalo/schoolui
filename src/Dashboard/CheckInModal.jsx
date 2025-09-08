// src/components/CheckInModal.jsx
import React from "react";
import styles from "./CheckInModal.module.css";
import checkInImg from "../assets/AloLogo/checkin.png" // <-- Add your check-in image in the same folder

const CheckInModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Image */}
        <img src={checkInImg} alt="Check In" className={styles.image} />

        {/* Message */}
        <h2>Are you sure you want to check in now?</h2>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.confirm} onClick={onConfirm}>
            Yes
          </button>
          <button className={styles.cancel} onClick={onClose}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInModal;
