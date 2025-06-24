
export default function Hero() {
  return (
    <>
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">💰 Gana hasta $25/hora</div>
            <h1 className="hero-title">
              Trabajo Flexible
              <br />
              para <span className="hero-title-highlight">Estudiantes</span>
            </h1>
            <p className="hero-description">
              ¿Eres estudiante universitaria y buscas un trabajo que se adapte a
              tu horario académico? ¡Esta oportunidad es perfecta para ti!
            </p>
            <div className="hero-features">
              <div className="feature-item">
                <span className="feature-icon">⏰</span>
                <span>Solo 4 horas</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📅</span>
                <span>Horario flexible</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📍</span>
                <span>Múltiples ubicaciones</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💰</span>
                <span>Más información</span>
              </div>
            </div>
            <div className="hero-buttons">
              <button className="primary-button">Aplicar Ahora</button>
              <button className="secondary-button">Más Información</button>
            </div>
          </div>
          <div className="hero-image">
            
            <img src="/hero-image.jpg" alt="Estudiantes trabajando" />
          </div>
        </div>
      </section>
    </>
  );
}
