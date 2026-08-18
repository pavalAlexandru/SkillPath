"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/server/supabase";
import { getUserRole, signOut, type AppRole } from "@/server/supabase/auth";
import styles from "./DashboardContent.module.css";

export function DashboardContent() {
  const router = useRouter();
  const [role, setRole] = useState<AppRole | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user ?? null;

      if (!user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? null);
      setRole(getUserRole(user));
      setIsReady(true);
    }

    void loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      setEmail(session.user.email ?? null);
      setRole(getUserRole(session.user));
      setIsReady(true);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  if (!isReady) {
    return <main className={styles.loading}>Loading...</main>;
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.kicker}>Dashboard</p>
            <h1 className={styles.title}>Welcome</h1>
          </div>

          <button type="button" onClick={handleSignOut} className={styles.logoutButton}>
            Logout
          </button>
        </div>

        <div className={styles.grid}>
          <div className={styles.infoCard}>
            <p className={styles.label}>Email</p>
            <p className={styles.value}>{email ?? "Unknown"}</p>
          </div>

          <div className={styles.infoCard}>
            <p className={styles.label}>Role</p>
            <p className={styles.value}>{role ?? "Not assigned"}</p>
          </div>

          <div className={styles.infoCard}>
            <p className={styles.label}>Status</p>
            <p className={styles.success}>Authenticated</p>
          </div>
        </div>

        <div className={styles.notice}>
          This app is ready for the next step: store the user role in Supabase profiles and guard routes by role.
        </div>
      </div>
    </main>
  );
}
