import React, { useState, useEffect } from "react";
import styles from "./PoliciesApp.module.css";

import Terms from "./Pages/Terms";
import Privacy from "./Pages/Privacy";
import Leave from "./Pages/Leave";
import Fee from "./Pages/Fee";
import Loader from "../loader/Loader";

function PoliciesApp() {
  const [activePage, setActivePage] = useState("privacy"); // default: Privacy
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to top on page change
    }, 500);

    return () => clearTimeout(timer);
  }, [activePage]); // run when activePage changes

  return (
    <div className={styles.container}>
      {loading && <Loader />} {/* show loader only while loading */}
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
