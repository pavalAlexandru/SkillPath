import { HomeHeroActions } from "./HomeHeroActions";
import styles from "./HomePage.module.css";

export function HomeHero() {
  return (
    <section className={styles.heroSection}>
      <span className={styles.kicker}>Learning platform</span>

      <h1 className={styles.heroTitle}>Build skills with a mentor-led path for every learner.</h1>

      <p className={styles.heroText}>
        SkillPath helps students, mentors, and admins manage learning journeys, track progress,
        and support growth with a simple, clear workflow.
      </p>

      <HomeHeroActions />
    </section>
  );
}
