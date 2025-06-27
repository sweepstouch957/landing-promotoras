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
          <div className={styles.icon}>
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              fill="#fc0680"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8v5h4M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <h3>Trabajar en Turnos Flexibles</h3>
          <p>Turnos de 4 horas que se adaptan a tu horario universitario.</p>
        </div>
        <div className={styles.card}>
          <div className={styles.icon}>
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              fill="#fc0680"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
            </svg>
          </div>
          <h3>Promocionar Participación en Sorteo</h3>
          <p>
            Promover la participación en el sorteo gratuito de un carro o millas
            por ser cliente del supermercado.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              fill="#fc0680"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <h3>Interactuar con Clientes</h3>
          <p>
            De manera amigable y profesional, resolviendo dudas y registrando
            participantes.
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.icon}>
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              fill="#fc0680"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 4h16v16H4V4Zm3 4h10M7 12h6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <h3>Registrar Participaciones</h3>
          <p>Usando nuestra app intuitiva para el sorteo del carro o millas.</p>
        </div>
      </div>
    </section>
  );
};

export default Responsibilities;
