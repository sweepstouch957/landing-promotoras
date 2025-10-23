'use client';
import React from 'react';
import styles from './cashiers-banner.module.css';
export default function CashiersBannerPlaceholder() {
  return (
    <section className={styles.banner}>
      <div className={styles.container}>
        <div className={styles.content}></div>
      </div>
    </section>
  );
}
