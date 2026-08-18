import { FeatureCard } from "./FeatureCard";
import styles from "./HomePage.module.css";

const features = [
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

export function FeatureSection() {
  return (
    <section id="features" className={styles.featuresSection}>
      {features.map((feature) => (
        <FeatureCard
          key={feature.label}
          label={feature.label}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </section>
  );
}
