'use client';
import { useTranslation } from 'react-i18next';
import styles from '../styles/Responsabilities.module.css';

const Responsibilities = () => {
  const { t } = useTranslation('common');

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{t('responsibilities_title')}</h2>
      <p className={styles.subtitle}>{t('responsibilities_subtitle')}</p>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.icon}>
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              fill="#ED1F80"
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
          <p>{t('responsibility_1_desc')}</p>
        </div>
        <div className={styles.card}>
          <div className={styles.icon}>
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              fill="#ED1F80"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
            </svg>
          </div>
          <h3>{t('responsibility_2_title')}</h3>
          <p>{t('responsibility_2_desc')}</p>
        </div>
        <div className={styles.card}>
          <div className={styles.icon}>
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              fill="#ED1F80"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <h3>{t('responsibility_3_title')}</h3>
          <p>{t('responsibility_3_desc')}</p>
        </div>
        <div className={styles.card}>
          <div className={styles.icon}>
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              fill="#ED1F80"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 4h16v16H4V4Zm3 4h10M7 12h6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <h3>{t('responsibility_4_title')}</h3>
          <p>{t('responsibility_4_desc')}</p>
        </div>
      </div>
    </section>
  );
};

export default Responsibilities;
