import React from "react";
import styles from "./Terms.module.css"; /* Import the CSS module */

function Terms() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Terms & Conditions</h1>
      
      <h4 className={styles.subHeading}>1. Acceptance Of Terms</h4>
      <p className={styles.paragraph}>By enrolling in our courses, you agree to abide by</p>

      <h4 className={styles.subHeading}>2. Eligibility & Admission</h4>
      <p className={styles.paragraph}>Must meet academic qualifications (e.g., high school / any degree). Applicants are required to submit genuine documents, as providing false information may result in the cancellation of their admission.</p>

      <h4 className={styles.subHeading}>3. Enrollment & Fees</h4>
      <p className={styles.paragraph}>All admissions are subject to eligibility and availability. Fees once paid are nonrefundable. Students must comply with payment schedules as communicated at the time of admission.</p>

      <h4 className={styles.subHeading}>4. Code Of Conduct</h4>
      <p className={styles.paragraph}>Students are expected to maintain professional behavior and respect towards faculty, peers, and institute property. ALO School of Design & Technology reserves the right to suspend or expel students violating these rules.</p>
      
      <h4 className={styles.subHeading}>5. Intellectual Property</h4>
      <p className={styles.paragraph}>All course content, materials, and resources are the intellectual property of ALO School of Design & Technology. Reproduction, distribution, or sharing without written permission is strictly prohibited.</p>

      <h4 className={styles.subHeading}>6. CERTIFICATE ISSUANCE</h4>
      <p className={styles.paragraph}>Certificates will only be awarded upon successful completion of the program and fulfillment of all requirements.</p>

      <h4 className={styles.subHeading}>7. CHANGES TO COURSES</h4>
      <p className={styles.paragraph}>We reserve the right to update or modify course content, structure, or faculty as necessary.</p>

      <h4 className={styles.subHeading}>8. PARTICIPATION IN EVENTS</h4>
      <p className={styles.paragraph}>Students are expected to maintain professional behavior and respect towards faculty, peers, and institute property. ALO School of Design & Technology reserves the right to suspend or expel students violating these rules.</p>
    </div>
  );
}

export default Terms;