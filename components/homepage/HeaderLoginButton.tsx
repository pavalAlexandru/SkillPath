"use client";

import { useRouter } from "next/navigation";
import styles from "./HomePage.module.css";

export function HeaderLoginButton() {
  const router = useRouter();

  return (
    <button type="button" onClick={() => router.push("/login")} className={styles.loginButton}>
      Login
    </button>
  );
}
