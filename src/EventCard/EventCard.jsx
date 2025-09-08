import React from "react";
import styles from "./EventCard.module.css";
import { FaBirthdayCake } from "react-icons/fa";
import { GiFireworkRocket } from "react-icons/gi"; // festival icon
import { FaRegSmile } from "react-icons/fa"; // optional: festival smiley icon

const EventCard = ({ title, subtitle, date, type }) => {
  // Choose icon and wrapper color based on type
  let icon = null;
  let wrapperClass = "";

  if (type === "birthday") {
    icon = <FaBirthdayCake />;
    wrapperClass = styles.birthday; // existing birthday style
  } else if (type === "festival") {
    icon = <FaRegSmile />; // festival smiley icon
    wrapperClass = styles.festival; // we'll style this with yellow
  }

  // split date → day + monthYear
  const [day, ...rest] = date.split(" ");
  const monthYear = rest.join(" ");

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        {icon && (
          <div className={`${styles.iconWrapper} ${wrapperClass}`}>
            {icon}
          </div>
        )}
        <div className={styles.text}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>
      <div className={styles.right}>
        <span className={styles.day}>{day}</span>
        <span className={styles.monthYear}>{monthYear}</span>
      </div>
    </div>
  );
};

export default EventCard;
