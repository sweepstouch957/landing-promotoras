'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../styles/Bonuses.module.css';

const Bonuses = () => {
  const { t } = useTranslation('common');

  const MedalIcon = ({ className }: { className: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M8 12L6 22L12 19L18 22L16 12"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{t('bonuses_title')}</h2>
      <p className={styles.subtitle}>{t('bonuses_subtitle')}</p>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <MedalIcon className={`${styles.icon} ${styles.iconLight}`} />
          </div>
          <h3 className={styles.cardTitle}>{t('bonuses_weekly_title')}</h3>
          <p className={styles.cardDescription}>{t('bonuses_weekly_desc')}</p>
        </div>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <MedalIcon className={`${styles.icon} ${styles.iconPink}`} />
          </div>
          <h3 className={styles.cardTitle}>{t('bonuses_monthly_title')}</h3>
          <p className={styles.cardDescription}>{t('bonuses_monthly_desc')}</p>
        </div>
      </div>
    </section>
  );
};

export default Bonuses;
