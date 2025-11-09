import React from "react";
import styles from "./Fee.module.css"; /* Import the CSS module */

function Fee() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Fee Structures</h1>

      <p className={styles.paragraph}>
        At ALO School of Design & Technology, we maintain a clear and firm no-refund policy for all fees paid, regardless of the reason or situation.<br></br>
        <br></br>
        1. Application, registration, and course fees are non-refundable under any circumstances.<br></br>
        <br></br>
        2. This includes withdrawals due to personal reasons, medical issues, relocation, or dissatisfaction with the course.<br></br>
        <br></br>
        3. Fees will also not be refunded in the case of dismissal due to disciplinary action or poor attendance.
      </p>
    </div>
  );
}

export default Fee;