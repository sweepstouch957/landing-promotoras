import React from 'react';
import styles from '../styles/HowToParticipate.module.css';

const HowToParticipate = () => {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>¿CÓMO CONSEGUIR PARTICIPACIONES?</h2>
      <p className={styles.subtitle}>
        Maximiza tus ganancias y tus posibilidades en el sorteo del carro.
      </p>
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
          <h3 className={styles.cardTitle}>Supermercados Afiliados</h3>
          <p className={styles.cardDescription}>
            Promueve la participación en sorteos en supermercados afiliados a
            Sweepstouch.
          </p>
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
                d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2.01.99l-2.54 3.4c-.09.12-.15.27-.15.42 0 .39.32.71.71.71.2 0 .39-.08.53-.22l1.63-2.18.81 2.7L12 16h-2c-1.11 0-2 .89-2 2s.89 2 2 2h8z"
                fill="currentColor"
              />
              <circle cx="6" cy="6" r="2" fill="currentColor" />
              <path
                d="M10 22v-6h-2.5l2.54-7.63A1.5 1.5 0 0 1 11.46 8H14c.8 0 1.54.37 2.01.99l2.54 3.4c.09.12.15.27.15.42 0 .39-.32.71-.71.71-.2 0-.39-.08-.53-.22L16.83 10.7 16.02 13.4 18 16h2c1.11 0 2 .89 2 2s-.89 2-2 2h-8z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h3 className={styles.cardTitle}>Función "Share" en la App</h3>
          <p className={styles.cardDescription}>
            Aumenta la participación compartiendo con amigos y familiares del
            participante, aumentando sus probabilidades de ganar.
          </p>
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
          <h3 className={styles.cardTitle}>Eventos y Ferias</h3>
          <p className={styles.cardDescription}>
            Aprovecha eventos y ferias en tu área para registrar más
            participaciones y ganar más dinero.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowToParticipate;
