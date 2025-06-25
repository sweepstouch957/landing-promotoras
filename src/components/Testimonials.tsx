import React from 'react';
import styles from '../styles/Testimonial.module.css'; // Importa los estilos como un objeto

export default function Testimonials() {
  const testimonials = [
    {
      rating: 5,
      text: '¡Perfecto para mi horario universitario! Gano más que en trabajos tradicionales y tengo flexibilidad total.',
      name: 'María, 20 años',
      school: 'NYU',
    },
    {
      rating: 5,
      text: 'En 3 meses he ganado $2,400 trabajando solo fines de semana. ¡Increíble!',
      name: 'Sofia, 19 años',
      school: 'Rutgers',
    },
    {
      rating: 5,
      text: 'El ambiente es súper friendly y las bonificaciones hacen que valga la pena el esfuerzo extra.',
      name: 'Camila, 21 años',
      school: 'UConn',
    },
  ];

  return (
    // Usa styles.className para aplicar las clases del módulo
    <section className={styles.testimonials}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>
          Lo Que Dicen Nuestras Impulsadoras
        </h2>
        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles.testimonialCard}>
              <div className={styles.rating}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  // Usar '★' para que el color CSS se aplique
                  <span key={i} className={styles.star}>
                    ★
                  </span>
                ))}
              </div>
              <p className={styles.testimonialText}>"{testimonial.text}"</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>
                  {testimonial.name.charAt(0)}
                </div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>{testimonial.name}</div>
                  <div className={styles.authorSchool}>
                    {testimonial.school}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
