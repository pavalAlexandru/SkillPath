"use client";

import { useRouter } from "next/navigation";
import styles from "./HomePage.module.css";

export function HomeHeroActions() {
  const router = useRouter();

  return (
    <div className={styles.heroActions}>
      <button type="button" onClick={() => router.push("/login")} className={styles.primaryButton}>
        Get started
      </button>

      <button type="button" onClick={() => window.location.hash = "#features"} className={styles.secondaryButton}>
        Explore features
      </button>
    </div>
  );
}
