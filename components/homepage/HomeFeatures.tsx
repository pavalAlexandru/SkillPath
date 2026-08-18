import styles from "./HomePage.module.css";

const featureCards = [
  {
    label: "Students",
    title: "Follow your path",
    description: "Access learning modules, milestones, and personalized guidance in one place.",
  },
  {
    label: "Mentors",
    title: "Guide progress",
    description: "Track learner performance, provide feedback, and keep growth on schedule.",
  },
  {
    label: "Admins",
    title: "Manage everything",
    description: "Control workflows, oversee teams, and make informed decisions across the platform.",
  },
];

export function HomeFeatures() {
  return (
    <section id="features" className={styles.featuresSection}>
      {featureCards.map((feature) => (
        <article key={feature.label} className={styles.featureCard}>
          <p className={styles.featureLabel}>{feature.label}</p>
          <h2 className={styles.featureTitle}>{feature.title}</h2>
          <p className={styles.featureText}>{feature.description}</p>
        </article>
      ))}
    </section>
  );
}
