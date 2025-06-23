import React from 'react';
import styles from '../styles/Responsabilities.module.css';

const Responsibilities = () => {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>¿QUÉ HARÁS?</h2>
      <p className={styles.subtitle}>
        Como impulsadora de Sweepstouch, tus responsabilidades incluirán:
      </p>
      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.icon}>👥</span>
          <h3>Promocionar Participación en Sorteo</h3>
          <p>
            Promover la participación en el sorteo gratuito de un carro o millas
            por ser cliente del supermercado.
          </p>
        </div>
        <div className={styles.card}>
          <span className={styles.icon}>💬</span>
          <h3>Interactuar con Clientes</h3>
          <p>
            De manera amigable y profesional, resolviendo dudas y registrando
            participantes.
          </p>
        </div>
        <div className={styles.card}>
          <span className={styles.icon}>📱</span>
          <h3>Registrar Participaciones</h3>
          <p>Usando nuestra app intuitiva para el sorteo del carro o millas.</p>
        </div>
        <div className={styles.card}>
          <span className={styles.icon}>🕒</span>
          <h3>Trabajar en Turnos Flexibles</h3>
          <p>Turnos de 4 horas que se adaptan a tu horario universitario.</p>
        </div>
      </div>
    </section>
  );
};

export default Responsibilities;
