"use client";

import styles from "./HomePage.module.css";

export function SecondaryCtaButton() {
  return (
    <button type="button" onClick={() => (window.location.hash = "#features")} className={styles.secondaryButton}>
      Explore features
    </button>
  );
}
