// components/JoinSection.tsx
import React from 'react';
import styles from '../styles/JoinSection.module.css';

const JoinSection = () => {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>
        Forma Parte de la Comunidad Sweepstouch Hoy
      </h2>
      <p className={styles.subtitle}>
        No pierdas la oportunidad de ganar dinero, flexibilidad y experiencia.
      </p>
      <button className={styles.button}>Aplicar Ahora</button>
    </section>
  );
};

export default JoinSection;
