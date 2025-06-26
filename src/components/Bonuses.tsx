import React from 'react';
import styles from '../styles/Bonuses.module.css';

const Bonuses = () => {
  const MedalIcon = ({ className }:{className:string}) => (
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
      <h2 className={styles.title}>BONOS ADICIONALES</h2>
      <p className={styles.subtitle}>Recompensamos tu esfuerzo y dedicación.</p>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <MedalIcon className={`${styles.icon} ${styles.iconLight}`} />
          </div>
          <h3 className={styles.cardTitle}>Bono Semanal</h3>
          <p className={styles.cardDescription}>
            Gana un bono de $25 por cada 100 participaciones registradas en la
            semana.
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <MedalIcon className={`${styles.icon} ${styles.iconPink}`} />
          </div>
          <h3 className={styles.cardTitle}>Bono Mensual</h3>
          <p className={styles.cardDescription}>
            Alcanza 1000 participaciones en el mes y recibe un bono adicional de
            $100.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Bonuses;
