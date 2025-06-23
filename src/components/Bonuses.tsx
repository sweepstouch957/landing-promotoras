import React from 'react';
import styles from '../styles/Bonuses.module.css';

const Bonuses = () => {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>BONOS ADICIONALES</h2>
      <p className={styles.subtitle}>Recompensamos tu esfuerzo y dedicación.</p>
      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.iconLight}>🎖️</span>
          <h3>Bono Semanal</h3>
          <p>
            Gana un bono de $25 por cada 100 participaciones registradas en la
            semana.
          </p>
        </div>
        <div className={styles.card}>
          <span className={styles.iconPink}>🏅</span>
          <h3>Bono Mensual</h3>
          <p>
            Alcanza 1000 participaciones en el mes y recibe un bono adicional de
            $100.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Bonuses;
