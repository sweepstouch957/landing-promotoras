'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoList from '@/components/VideoList';
import SubmitSection from '@/components/SubmitSection';
import CompletionModal from '@/components/CompletionModal';
import PaymentStructure from '@/components/PaymentStructure';
import styles from './training.module.css';

interface Video {
  id: string;
  title: string;
  description: string;
  duration: number;
  url: string;
  completed: boolean;
  watchedTime: number;
}

const initialVideos: Video[] = [
  {
    id: 'training',
    title: 'Conoce a Sweepstouch y su programa de impulsadoras',
    description: 'Gana dinero extra invitando a clientes a sorteos gratuitos en supermercados. Solo necesitas tu celular, buena actitud y ganas de impulsar.',
    duration: 596, // 9:56
    url: 'https://videos-impulsadoras.s3.us-east-2.amazonaws.com/sweepstouch+une+a+supermercados+con+sus+clientes_3.mp4',
    completed: false,
    watchedTime: 0,
  },
];

export default function Home() {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Cargar progreso desde localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('elearning-progress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setVideos(parsed.videos || initialVideos);
        setCurrentVideoIndex(parsed.currentVideoIndex || 0);
        setIsSubmitted(parsed.isSubmitted || false);
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
  }, []);

  // Guardar progreso en localStorage
  useEffect(() => {
    const progress = {
      videos,
      currentVideoIndex,
      isSubmitted,
    };
    localStorage.setItem('elearning-progress', JSON.stringify(progress));
  }, [videos, currentVideoIndex, isSubmitted]);

  const handleVideoComplete = (videoId: string) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === videoId ? { ...video, completed: true } : video
      )
    );
    // Mostrar modal de felicitación cuando se complete el video
    setShowCompletionModal(true);
  };

  const setWatchedTime = (videoId: string, time: number) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === videoId ? { ...video, watchedTime: time } : video
      )
    );
  };

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Redirigir al formulario después de un breve delay
    setTimeout(() => {
      window.location.href = '/training/register';
    }, 2000);
  };

  const handleMarkVideoComplete = (videoIndex: number) => {
    setVideos((prev) =>
      prev.map((video, index) =>
        index === videoIndex
          ? { ...video, completed: true, watchedTime: video.duration }
          : video
      )
    );
    // Mostrar modal de felicitación cuando se marque como completado
    setShowCompletionModal(true);
  };



  const handleCloseModal = () => {
    setShowCompletionModal(false);
  };

  const handleGoToRegister = () => {
    setShowCompletionModal(false);
    window.location.href = '/training/register';
  };

  const completedCount = videos.filter((video) => video.completed).length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const allCompleted = completedCount === videos.length;

  return (
    <div className={styles.trainingPage}>
      {/* Header */}
      <div className={styles.trainingHeader}>
        <div className={styles.trainingHeaderContent}>
          <h1 className={styles.trainingHeaderTitle}>sweepsTOUCH</h1>
          <div className={styles.trainingHeaderProgress}>
            {completedCount}/1 completados
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={styles.trainingMainContent}>
        {/* Developer Controls - Small button for testing */}
        <div className={styles.devControls}>
          <button
            className={styles.devButton}
            onClick={() => handleMarkVideoComplete(0)}
            title="Simular video completado (solo para desarrollo)"
          >
            DEV: Completar Video
          </button>
        </div>

        <div className={styles.trainingGridLayout}>
          {/* Left Column - Video Player */}
          <div className="space-y-6">
            <div className={styles.trainingCard}>
              <div className={styles.trainingCardContent}>
                <VideoPlayer
                  video={videos[currentVideoIndex]}
                  onVideoComplete={handleVideoComplete}
                  watchedTime={videos[currentVideoIndex].watchedTime}
                  setWatchedTime={setWatchedTime}
                />
              </div>
            </div>

            <div className={styles.trainingCard}>
              <div className={styles.trainingCardContent}>
                <SubmitSection
                  videos={videos}
                  onSubmit={handleSubmit}
                  isSubmitted={isSubmitted}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Progress & Video List */}
          <div className="space-y-6">
            
            
            <div className={`${styles.trainingCard} ${styles.videoTrainingCard}`}>
              <div className={styles.trainingCardHeader}>
                <h2 className={styles.trainingCardTitle}>VIDEO DE CAPACITACIÓN</h2>
              </div>
              <div className={styles.trainingCardContent}>
                <VideoList
                  videos={videos}
                  currentVideoIndex={currentVideoIndex}
                  onVideoSelect={handleVideoSelect}
                />
              </div>
            </div>
            
          </div>
        </div>
      </main>

      {/* Payment Structure Section */}
      <section className={styles.paymentSection}>
        <div className={styles.paymentContainer}>
          <PaymentStructure />
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.trainingFooter}>
        <div className={styles.trainingFooterContent}>
          <p className={styles.trainingFooterText}>
            Progreso total: {completedCount} de {videos.length} completados
          </p>
        </div>
      </footer>

      {/* Completion Modal */}
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={handleCloseModal}
        onGoToRegister={handleGoToRegister}
      />
    </div>
  );
}
