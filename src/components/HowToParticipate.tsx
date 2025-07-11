'use client';
import { useTranslation } from 'react-i18next';
import styles from '../styles/HowToParticipate.module.css';

const HowToParticipate = () => {
  const { t } = useTranslation('common');

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{t('how_to_title')}</h2>
      <p className={styles.subtitle}>{t('how_to_subtitle')}</p>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h3 className={styles.cardTitle}>{t('how_to_card_1_title')}</h3>
          <p className={styles.cardDescription}>{t('how_to_card_1_desc')}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 12l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
          </div>
          <h3 className={styles.cardTitle}>{t('how_to_card_2_title')}</h3>
          <p className={styles.cardDescription}>{t('how_to_card_2_desc')}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h3 className={styles.cardTitle}>{t('how_to_card_3_title')}</h3>
          <p className={styles.cardDescription}>{t('how_to_card_3_desc')}</p>
        </div>
      </div>
    </section>
  );
};

export default HowToParticipate;
