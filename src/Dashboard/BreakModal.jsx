import React from "react";
import styles from "./BreakModal.module.css";

const BreakModal = ({
  isOpen,
  onClose,
  handleStartBreak, // use this to start break
}) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await handleStartBreak(); // ✅ use parent’s logic
    onClose(); // close modal after action
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Take a Break</h2>
        <p>Are you sure you want to take a break?</p>
        <div className={styles.modalButtons}>
          <button onClick={handleConfirm} className={styles.confirmBtn}>
             Take Break
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
