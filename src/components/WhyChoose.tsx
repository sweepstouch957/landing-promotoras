'use client';
import { useTranslation } from 'react-i18next';
import styles from '../styles/WhyChoose.module.css';

export default function WhyChoose() {
  const { t } = useTranslation('common');
  const features = t('why_features', { returnObjects: true }) as {
    title: string;
    items: string[];
  }[];

  const icons = [
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line
        x1="12"
        y1="20"
        x2="12"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="18"
        y1="20"
        x2="18"
        y2="4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="6"
        y1="20"
        x2="6"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>,
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <polyline
        points="12,6 12,12 16,14"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>,
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="5"
        y="2"
        width="14"
        height="20"
        rx="2"
        ry="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="12"
        y1="18"
        x2="12.01"
        y2="18"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>,
  ];

  const CheckIcon = () => (
    <svg
      className={styles.checkIcon}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="m9 12 2 2 4-4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{t('why_title')}</h2>
      <div className={styles.featuresGrid}>
        {features.map((feature, index) => (
          <div key={index} className={styles.featureCard}>
            <div className={styles.iconContainer}>{icons[index]}</div>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <ul className={styles.featureList}>
              {feature.items.map((item, itemIndex) => (
                <li key={itemIndex} className={styles.featureItem}>
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
