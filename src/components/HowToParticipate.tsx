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
          <span className={styles.icon}>📍</span>
          <h3>Supermercados Afiliados</h3>
          <p>
            Promueve la participación en sorteos en supermercados afiliados a
            Sweepstouch.
          </p>
        </div>
        <div className={styles.card}>
          <span className={styles.icon}>👥</span>
          <h3>Función “Share” en la App</h3>
          <p>
            Aumenta la participación compartiendo con amigos y familiares del
            participante, aumentando sus probabilidades de ganar.
          </p>
        </div>
        <div className={styles.card}>
          <span className={styles.icon}>📅</span>
          <h3>Eventos y Ferias</h3>
          <p>
            Aprovecha eventos y ferias en tu área para registrar más
            participaciones y ganar más dinero.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowToParticipate;
