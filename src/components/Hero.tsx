'use client';
import { useRouter } from 'next/navigation';
import styles from '../styles/Hero.module.css';

export default function Hero() {
  const router = useRouter();

  const handleApplyClick = () => {
    router.push('/formulario');
  };

  return (
    <section className={styles.hero}>
      <div className={styles['hero-container']}>
        <div className={styles['hero-content']}>
          <div className={styles['hero-badge']}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            💰 Gana hasta $25/hora
          </div>

          <div className={styles['hero-title-wrapper']}>
            <h1 className={styles['hero-title']}>Trabajo flexible</h1>
            <div className={styles['hero-line-container']}>
              <div className={styles['hero-line']}></div>
              <h2 className={styles['hero-subtitle']}>Oportunidad</h2>
            </div>
          </div>

          <p className={styles['hero-description']}>
            ¿Eres estudiante universitaria y buscas un trabajo que se adapte a
            tu horario académico? ¡Esta oportunidad es perfecta para ti!
          </p>
          <div
            className={`${styles['hero-image']} ${styles['hero-image-mobile']}`}
          >
            <img
              src="/hero-image.jpg"
              alt="Grupo de chicas felices trabajando juntas"
            />
          </div>
          <div className={styles['hero-features']}>
            <div className={styles['feature-item']}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
              </svg>
              Horario flexible
            </div>
            <div className={styles['feature-item']}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-.83 0-1.5-.67-1.5-1.5S11.17 8.5 12 8.5s1.5.67 1.5 1.5S12.83 11.5 12 11.5z" />
              </svg>
              Múltiples ubicaciones
            </div>
            <div className={styles['feature-item']}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              Más Información
            </div>
          </div>

          <button
            className={styles['primary-button']}
            onClick={handleApplyClick}
          >
            Aplicar Ahora
          </button>
        </div>

        <div
          className={`${styles['hero-image']} ${styles['hero-image-desktop']}`}
        >
          <img
            src="/hero-image.jpg"
            alt="Grupo de chicas felices trabajando juntas"
          />
        </div>
      </div>
    </section>
  );
}
