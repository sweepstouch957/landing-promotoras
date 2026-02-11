'use client';
import { useTranslation } from 'react-i18next';
import styles from '../styles/Responsabilities.module.css';

const Responsibilities = () => {
  const { t } = useTranslation('common');

  return (
    <section className={styles.container}>

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.icon}>
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8v5h4M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <h3>{t('responsibility_1_title')}</h3>

        </div>
        <div className={styles.card}>
          <div className={styles.icon}>
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Academic cap (mejor para "No interfiere con tus clases") */}
              <path
                d="M12 3 2 8l10 5 10-5-10-5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M6 10.5V16c0 2 3 4 6 4s6-2 6-4v-5.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M22 8v6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3>{t('responsibility_2_title')}</h3>

        </div>
        <div className={styles.card}>
          <div className={styles.icon}>
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Map pin (mejor para "Trabajo cerca de tu casa") */}
              <path
                d="M12 22s7-4.5 7-12a7 7 0 1 0-14 0c0 7.5 7 12 7 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                fill="none"
              />
              <circle
                cx="12"
                cy="10"
                r="2.5"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <h3>{t('responsibility_3_title')}</h3>

        </div>
        <div className={styles.card}>
          <div className={styles.icon}>
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Banknote (mejor para "Pagos semanales") */}
              <rect
                x="3"
                y="6"
                width="18"
                height="12"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="12"
                cy="12"
                r="2.5"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M7 9h0M17 15h0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3>{t('responsibility_4_title')}</h3>

        </div>
      </div>
    </section>
  );
};

export default Responsibilities;
