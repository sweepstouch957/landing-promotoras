'use client';

import React from 'react';
import styles from '../styles/JoinSection.module.css';
import { useRouter } from 'next/navigation';

const JoinSection = () => {
  const router = useRouter();

  const handleApplyClick = () => {
    router.push('/formulario');
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>
        Forma Parte de la Comunidad Sweepstouch Hoy
      </h2>
      <p className={styles.subtitle}>
        No pierdas la oportunidad de ganar dinero, flexibilidad y experiencia.
      </p>
      <button className={styles.button} onClick={handleApplyClick}>
        Aplicar Ahora
      </button>
    </section>
  );
};

export default JoinSection;
