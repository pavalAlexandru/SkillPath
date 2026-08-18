"use client";

import { type SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmail } from "@/server/supabase";
import styles from "./LoginForm.module.css";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmail(email, password);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.headerBlock}>
          <p className={styles.brand}>SkillPath</p>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.subtitle}>Use your email and password to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={styles.input}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          {error ? <div className={styles.error}>{error}</div> : null}

          <div className={styles.actions}>
            <button type="button" onClick={() => router.push("/")} className={styles.cancelButton}>
              Cancel
            </button>

            <button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
