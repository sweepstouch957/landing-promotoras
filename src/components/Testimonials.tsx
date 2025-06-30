'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../styles/Testimonial.module.css';

export default function Testimonials() {
  const { t } = useTranslation('common');
  const testimonials = t('testimonials', { returnObjects: true }) as {
    rating: number;
    text: string;
    name: string;
    school: string;
  }[];

  return (
    <section className={styles.testimonials}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>{t('testimonials_title')}</h2>
        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles.testimonialCard}>
              <div className={styles.rating}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={styles.star}>
                    ★
                  </span>
                ))}
              </div>
              <p className={styles.testimonialText}>
                &quot;{testimonial.text}&quot;
              </p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>
                  {testimonial.name.charAt(0)}
                </div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>{testimonial.name}</div>
                  <div className={styles.authorSchool}>
                    {testimonial.school}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
