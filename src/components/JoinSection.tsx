'use client';

import React from 'react';
import styles from '../styles/JoinSection.module.css';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const JoinSection = () => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const handleApplyClick = () => {
    router.push('/formulario');
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{t('join_title')}</h2>
      <p className={styles.subtitle}>{t('join_subtitle')}</p>
      <button className={styles.button} onClick={handleApplyClick}>
        {t('join_button')}
      </button>
    </section>
  );
};

export default JoinSection;
