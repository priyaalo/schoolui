// src/Dashboard/CheckoutModal.jsx
import React, { useState } from "react";
import styles from "./CheckoutModal.module.css";

const CheckoutModal = ({ isOpen, onClose, onCheckout }) => {
  const [remarks, setRemarks] = useState(""); // state for remarks
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isOpen) return null; // don't render unless open

  const handleCheckout = () => {
    onCheckout(remarks); // pass remarks back to parent
    setRemarks(""); // clear input after checkout
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.title}>Want to check out?</p>

       <div className={styles.remarks}>
  <textarea
    id="remarks"
    value={remarks} // bind value to state
    onChange={(e) => {
      let val = e.target.value;
      if (val.length > 0) {
        // capitalize first character
        val = val.charAt(0).toUpperCase() + val.slice(1);
      }
      setRemarks(val);
    }}
    placeholder="Remarks"
    className={styles.textarea}
  />
</div>


        {/* Actions */}
        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancel}>
            Cancel
          </button>
          <button onClick={handleCheckout} className={styles.confirm}>
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
