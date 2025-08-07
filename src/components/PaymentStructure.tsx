'use client';
import { useTranslation } from 'react-i18next';
import styles from '../styles/PaymentStructure.module.css';

export default function PaymentStructure() {
  const { t } = useTranslation('common');

  const paymentData = [
    { participaciones: 100, pagoTurno: '$50', pagoHora: '$12.5' },
    { participaciones: 150, pagoTurno: '$75', pagoHora: '$18.75' },
    {
      participaciones: '200 (Meta)',
      pagoTurno: '$100',
      pagoHora: '$25',
      highlighted: true,
    },
    { participaciones: 250, pagoTurno: '$125', pagoHora: '$31.25' },
    {
      participaciones: 400,
      pagoTurno: '$200',
      pagoHora: '$50',
      highlighted: true,
    },
  ];

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{t('payment_title')}</h2>
      <p
  className={styles.subtitle}
  dangerouslySetInnerHTML={{ __html: t('payment_subtitle') }}
></p>


      <div className={styles.tableContainer}>
        <h3 className={styles.tableTitle}>{t('payment_table_title')}</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.paymentTable}>
            <thead>
              <tr className={styles.headerRow}>
                <th className={styles.headerCell}>
                  {t('payment_table_header_participaciones')}
                </th>
                <th className={styles.headerCell}>
                  {t('payment_table_header_turno')}
                </th>
                <th className={styles.headerCell}>
                  {t('payment_table_header_hora')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentData.map((row, index) => (
                <tr
                  key={index}
                  className={`${styles.dataRow} ${row.highlighted ? styles.highlighted : ''}`}
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
