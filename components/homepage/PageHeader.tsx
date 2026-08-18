import { Brand } from "./Brand";
import { HeaderLoginButton } from "./HeaderLoginButton";
import styles from "./HomePage.module.css";

export function PageHeader() {
  return (
    <header className={styles.header}>
      <Brand />
      <HeaderLoginButton />
    </header>
  );
}
