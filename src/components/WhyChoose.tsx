export default function WhyChoose() {
  const features = [
    {
      icon: '⏰',
      title: 'Flexibilidad Total',
      items: [
        'Tú eliges cuándo trabajar',
        'Turnos de 4 horas',
        'Compatible con clases',
        'Sin horarios fijos'
      ]
    },
    {
      icon: '📱',
      title: 'Tecnología Avanzada',
      items: [
        'App móvil intuitiva',
        'Check-in/out automático',
        'Tracking en tiempo real',
        'Pago semanal directo'
      ]
    },
    {
      icon: '📈',
      title: 'Desarrollo Profesional',
      items: [
        'Habilidades de ventas',
        'Experiencia en marketing',
        'Networking',
        'Referencias para CV'
      ]
    }
  ];

  return (
    <section className="why-choose">
      <div className="container">
        <h2 className="section-title">¿Por Qué Elegir Sweepstouch?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <ul className="feature-list">
                {feature.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

