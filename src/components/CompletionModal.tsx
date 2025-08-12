'use client';

import { useState, useEffect } from 'react';
import styles from './CompletionModal.module.css';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToRegister: () => void;
}

export default function CompletionModal({ isOpen, onClose, onGoToRegister }: CompletionModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleGoToRegister = () => {
    setIsVisible(false);
    setTimeout(onGoToRegister, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.modalOverlay} ${isVisible ? styles.visible : ''}`}>
      <div className={`${styles.modalContent} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.modalHeader}>
          <div className={styles.successIcon}>🎉</div>
          <h2 className={styles.modalTitle}>¡Felicitaciones!</h2>
        </div>
        
        <div className={styles.modalBody}>
          <p className={styles.modalMessage}>
            Has completado exitosamente el video de capacitación. 
            Ahora puedes proceder al formulario de registro para continuar con el proceso.
          </p>
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            className={styles.registerButton}
            onClick={handleGoToRegister}
          >
            Ir al Formulario de Registro
          </button>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

