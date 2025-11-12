import React from "react";
import styles from "./EndBreakModal.module.css";

const EndBreakModal = ({ isOpen, onClose, handleEndBreak }) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await handleEndBreak(); // ✅ Call parent’s end break logic
    onClose(); // ✅ Close modal after confirming
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>End Break</h2>
        <p>Are you sure you want to end your break?</p>

        <div className={styles.modalButtons}>
          <button onClick={handleConfirm} className={styles.confirmBtn}>
            End Break
          </button>
          <button onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndBreakModal;
