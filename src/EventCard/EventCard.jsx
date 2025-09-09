import React from "react";
import styles from "./EventCard.module.css";
import { FaBirthdayCake } from "react-icons/fa";
import { GiFireworkRocket } from "react-icons/gi"; // festival icon
import { FaRegSmile } from "react-icons/fa"; // optional: festival smiley icon
import { FaHandshake} from "react-icons/fa";
 
const EventCard = ({ title, subtitle, date, type }) => {
  // Choose icon and wrapper color based on type
  let icon = <FaBirthdayCake />;
  let wrapperClass = "";
 
  if (type === "birthday") {
    icon = <FaBirthdayCake />;
    wrapperClass = styles.birthday; // existing birthday style
  } else if (type=== "function") {
    icon = <GiFireworkRocket />; // festival smiley icon
    wrapperClass = styles.function; // we'll style this with yellow
  } else if (type === "anniversary") {
    icon = <FaRegSmile />;
    wrapperClass = styles.anniversary;
  } else if (type === "meeting") {
    icon = <FaHandshake />;
    wrapperClass = styles.meeting;
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