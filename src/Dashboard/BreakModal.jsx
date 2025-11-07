// BreakModal.js
import React from "react";
import styles from "./BreakModal.module.css"; // use same css file if you already have one

const BreakModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Take a Break</h2>
        <p>Are you sure you want to take a break?</p>
        <div className={styles.modalButtons}>
          <button onClick={onConfirm} className={styles.confirmBtn}>
            Yes, Take Break
          </button>
          <button onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BreakModal;
