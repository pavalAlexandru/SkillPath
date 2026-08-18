import { HeaderLoginButton } from "./HeaderLoginButton";
import styles from "./HomePage.module.css";

export function HomeHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>SkillPath</div>
      <HeaderLoginButton />
    </header>
  );
}
