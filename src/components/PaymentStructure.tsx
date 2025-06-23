export default function PaymentStructure() {
  const paymentData = [
    { participaciones: 100, pagoTurno: '$40', pagoHora: '$10' },
    { participaciones: 150, pagoTurno: '$60', pagoHora: '$15' },
    { participaciones: 175, pagoTurno: '$70', pagoHora: '$17.50' },
    { participaciones: '200 (Meta)', pagoTurno: '$80', pagoHora: '$20', highlighted: true },
    { participaciones: 250, pagoTurno: '$86', pagoHora: '$21.50' },
    { participaciones: 300, pagoTurno: '$92', pagoHora: '$23' },
    { participaciones: 350, pagoTurno: '$100', pagoHora: '$25', highlighted: true },
  ];

  return (
    <section className="payment-structure">
      <div className="container">
        <h2 className="section-title">Estructura de Pagos Transparente</h2>
        <p className="section-subtitle">Gana más según tu rendimiento - ¡Tú decides cuánto ganar!</p>
        
        <div className="table-container">
          <h3 className="table-title">Tabla de Ganancias</h3>
          <table className="payment-table">
            <thead>
              <tr>
                <th>Participaciones</th>
                <th>Pago por Turno</th>
                <th>Pago por Hora</th>
              </tr>
            </thead>
            <tbody>
              {paymentData.map((row, index) => (
                <tr key={index} className={row.highlighted ? 'highlighted' : ''}>
                  <td>{row.participaciones}</td>
                  <td>{row.pagoTurno}</td>
                  <td>{row.pagoHora}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

