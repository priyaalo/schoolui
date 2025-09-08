import React, { useState } from "react";
import styles from "./PoliciesApp.module.css";

import Terms from "./Pages/Terms";
import Privacy from "./Pages/Privacy";
import Leave from "./Pages/Leave";
import Fee from "./Pages/Fee";

function PoliciesApp() {
  const [activePage, setActivePage] = useState("privacy"); // default: Privacy

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {activePage === "terms" && <Terms />}
        {activePage === "privacy" && <Privacy />}
        {activePage === "leave" && <Leave />}
        {activePage === "fee" && <Fee />}
      </div>

      {/* Right Sidebar */}
      <div className={styles.sideNav}>
      <div className={styles.sidebar}>
        <ul>
          <li className={activePage === "privacy" ? styles.active : ""}>
            <button onClick={() => setActivePage("privacy")}>
              Privacy Policies
            </button>
          </li>
          <li className={activePage === "terms" ? styles.active : ""}>
            <button onClick={() => setActivePage("terms")}>
              Terms & Conditions
            </button>
          </li>
          <li className={activePage === "leave" ? styles.active : ""}>
            <button onClick={() => setActivePage("leave")}>
              Leave Policies
            </button>
          </li>
          <li className={activePage === "fee" ? styles.active : ""}>
            <button onClick={() => setActivePage("fee")}>
              Fee Structure
            </button>
          </li>
        </ul>
      </div>
    </div>
    </div>
  );
}

export default PoliciesApp;
