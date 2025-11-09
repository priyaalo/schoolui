import React, { useState, useEffect } from "react";
import styles from "./CheckoutModal.module.css";

const CheckoutModal = ({ isOpen, onClose, onCheckout }) => {
  const [remarks, setRemarks] = useState(""); 
  const [loading, setLoading] = useState(false);

  // Reset remarks whenever modal closes
  useEffect(() => {
    if (!isOpen) {
      setRemarks("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    try {
      setLoading(true);
      await onCheckout(remarks);
      setRemarks(""); // also clear after successful checkout
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.title}>Want to check out?</p>

        {/* Remarks box */}
        <div className={styles.remarks}>
          <textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Remarks"
            className={styles.textarea}
          />
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            onClick={onClose}
            className={styles.cancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleCheckout}
            className={styles.confirm}
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
              "Check Out"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
