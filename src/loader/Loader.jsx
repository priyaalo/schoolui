import React from 'react'
import styles from "./loader.module.css";

const Loader = () => {
    return (
        <div className={styles.dotsSpinner}>
            <span className={styles.dot1}></span>
            <span className={styles.dot2}></span>
            <span className={styles.dot3}></span>
        
        </div>
        
    )
}

export default Loader