export default function Testimonials() {
  const testimonials = [
    {
      rating: 5,
      text: "¡Perfecto para mi horario universitario! Gano más que en trabajos tradicionales y tengo flexibilidad total.",
      name: "María, 20 años",
      school: "NYU"
    },
    {
      rating: 5,
      text: "En 3 meses he ganado $2,400 trabajando solo fines de semana. ¡Increíble!",
      name: "Sofia, 19 años",
      school: "Rutgers"
    },
    {
      rating: 5,
      text: "El ambiente es súper friendly y las bonificaciones hacen que valga la pena el esfuerzo extra.",
      name: "Camila, 21 años",
      school: "UConn"
    }
  ];

  return (
    <section className="testimonials">
      <div className="container">
        <h2 className="section-title">Lo Que Dicen Nuestras Impulsadoras</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="star">⭐</span>
                ))}
              </div>
              <p className="testimonial-text">&quot;{testimonial.text}&quot;</p>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.name.charAt(0)}</div>
                <div className="author-info">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-school">{testimonial.school}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

