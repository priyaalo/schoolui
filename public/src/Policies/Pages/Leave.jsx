import React from "react";
import styles from "./Leave.module.css"; /* Import the CSS module */

function Leave() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Leave Policy</h1>

      <h4 className={styles.subHeading}>1. Minimum Attendance Requirement</h4>
      <p className={styles.paragraph}>Students must maintain a minimum of 80% attendance in all classes, workshops, and practical sessions.
Attendance will be monitored regularly, and records will be maintained by the academic coordinator.</p>

      <h4 className={styles.subHeading}>2. Late Arrivals and Early Departures</h4>
      <p className={styles.paragraph}>Arriving 15 minutes or more late or leaving class before official dismissal without prior permission will be considered a half-day absence.
Repeated tardiness may lead to disciplinary action or affect eligibility for placement assistance.</p>

      <h4 className={styles.subHeading}>3.Leave of Absence</h4>
      <p className={styles.paragraph}>Students must apply for leave in advance by submitting a Leave Request Form (written or digital) to the program coordinator.
Emergency leave must be notified as soon as possible and require valid documentation for approval.</p>

      <div className={styles.consequences}>
        <h4 className={styles.subHeading}>4.Consequences of Low Attendance</h4>
        <p className={styles.paragraph}>Students falling below the 80% attendance threshold: May not be allowed for final evaluations. May face delayed certificate issuance. May become ineligible for internship or placement support.
        </p>
      </div>
    </div>
  );
}

export default Leave;