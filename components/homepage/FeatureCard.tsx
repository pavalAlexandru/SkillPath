import styles from "./HomePage.module.css";

type FeatureCardProps = {
  label: string;
  title: string;
  description: string;
};

export function FeatureCard({ label, title, description }: FeatureCardProps) {
  return (
    <article className={styles.featureCard}>
      <p className={styles.featureLabel}>{label}</p>
      <h2 className={styles.featureTitle}>{title}</h2>
      <p className={styles.featureText}>{description}</p>
    </article>
  );
}
