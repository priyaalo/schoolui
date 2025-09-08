import React from "react";
import styles from "./Privacy.module.css"; /* Import the CSS module */

function Privacy() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Privacy Policies</h1>

      <h4 className={styles.subHeading}>1. Information Collection</h4>
      <p className={styles.paragraph}>We may collect personal information such as name, email, phone number, educational background, and payment details during registration or while using our services.</p>

      <h4 className={styles.subHeading}>2. Use of Information</h4>
      <p className={styles.paragraph}>Must meet academic qualifications (e.g., high school / any degree). Applicants are required to submit genuine documents, as providing false information may result in the cancellation of their admission.</p>

      <h4 className={styles.subHeading}>3. Data Protection</h4>
      <p className={styles.paragraph}>Your personal data is stored securely and will not be sold or shared with third parties without your consent. We implement appropriate security measures to prevent unauthorized access.</p>

      <h4 className={styles.subHeading}>4. Third Party Tools</h4>
      <p className={styles.paragraph}>We may use third-party platforms for learning, communication, and payment processing. These platforms have their own privacy policies.</p>
    </div>
  );
}

export default Privacy;