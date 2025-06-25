import React from 'react';
import styles from '../styles/PaymentStructure.module.css';

export default function PaymentStructure() {
  const paymentData = [
    { participaciones: 100, pagoTurno: '$40', pagoHora: '$10' },
    { participaciones: 150, pagoTurno: '$60', pagoHora: '$15' },
    { participaciones: 175, pagoTurno: '$70', pagoHora: '$17.50' },
    {
      participaciones: '200 (Meta)',
      pagoTurno: '$80',
      pagoHora: '$20',
      highlighted: true,
    },
    { participaciones: 250, pagoTurno: '$86', pagoHora: '$21.50' },
    { participaciones: 300, pagoTurno: '$92', pagoHora: '$23' },
    {
      participaciones: 350,
      pagoTurno: '$100',
      pagoHora: '$25',
      highlighted: true,
    },
  ];

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Estructura de Pagos Transparente</h2>
      <p className={styles.subtitle}>
        Gana más según tu rendimiento - ¡Tú decides cuánto ganar!
      </p>

      <div className={styles.tableContainer}>
        <h3 className={styles.tableTitle}>Tabla de Ganancias</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.paymentTable}>
            <thead>
              <tr className={styles.headerRow}>
                <th className={styles.headerCell}>Participaciones</th>
                <th className={styles.headerCell}>Pago por Turno</th>
                <th className={styles.headerCell}>Pago por Hora</th>
              </tr>
            </thead>
            <tbody>
              {paymentData.map((row, index) => (
                <tr
                  key={index}
                  className={`${styles.dataRow} ${
                    row.highlighted ? styles.highlighted : ''
                  }`}
                >
                  <td className={styles.dataCell}>{row.participaciones}</td>
                  <td className={styles.dataCell}>{row.pagoTurno}</td>
                  <td className={styles.dataCell}>{row.pagoHora}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
