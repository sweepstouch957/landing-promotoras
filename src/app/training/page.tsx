'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoList from '@/components/VideoList';
import ProgressBar from '@/components/ProgressBar';
import SubmitSection from '@/components/SubmitSection';
import DemoControls from '@/components/DemoControls';
import Header from '@/components/Header';
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
    id: 'intro',
    title: 'Introducción a la Empresa',
    description: 'Conoce la historia, misión y valores de nuestra empresa.',
    duration: 596, // 9:56
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    completed: false,
    watchedTime: 0,
  },
  {
    id: 'products',
    title: 'Productos y Servicios',
    description:
      'Aprende sobre nuestros productos principales y cómo promocionarlos.',
    duration: 653, // 10:53
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    completed: false,
    watchedTime: 0,
  },
  {
    id: 'sales',
    title: 'Técnicas de Ventas',
    description: 'Estrategias efectivas para mejorar tus habilidades de venta.',
    duration: 15,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    completed: false,
    watchedTime: 0,
  },
  {
    id: 'customer',
    title: 'Atención al Cliente',
    description:
      'Cómo brindar un excelente servicio al cliente en todo momento.',
    duration: 15,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    completed: false,
    watchedTime: 0,
  },
];

export default function Home() {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
  };

  const handleResetProgress = () => {
    setVideos(initialVideos);
    setCurrentVideoIndex(0);
    setIsSubmitted(false);
    localStorage.removeItem('elearning-progress');
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
            {completedCount}/4 completados
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={styles.trainingMainContent}>
        {/* Demo Controls */}
        <div className={styles.demoControlsCustom}>
          <h3 className={styles.demoControlsTitle}>
            🎯 CONTROLES DE DEMOSTRACIÓN
          </h3>
          <div className={styles.demoControlsButtons}>
            <button
              className={`${styles.demoButton} ${styles.demoButton1} ${videos[0].completed ? styles.completed : ''}`}
              onClick={() => handleMarkVideoComplete(0)}
            >
              INTRODUCCIÓN A1
            </button>
            <button
              className={`${styles.demoButton} ${styles.demoButton2} ${videos[1].completed ? styles.completed : ''}`}
              onClick={() => handleMarkVideoComplete(1)}
            >
              PRODUCTOS Y2
            </button>
            <button
              className={`${styles.demoButton} ${styles.demoButton3} ${videos[2].completed ? styles.completed : ''}`}
              onClick={() => handleMarkVideoComplete(2)}
            >
              TÉCNICAS DE3
            </button>
            <button
              className={`${styles.demoButton} ${styles.demoButton4} ${videos[3].completed ? styles.completed : ''}`}
              onClick={() => handleMarkVideoComplete(3)}
            >
              ATENCIÓN AL4
            </button>
            <button
              className={`${styles.demoButton} ${styles.demoButtonReset}`}
              onClick={handleResetProgress}
            >
              RESET5
            </button>
          </div>
          <p className={styles.demoTip}>
            💡 Haz clic en los botones para simular la finalización de videos y probar el sistema de checks.
          </p>
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
            <div className={styles.trainingCard}>
              <div className={styles.trainingCardHeader}>
                <h2 className={styles.trainingCardTitle}>PROGRESO DE CAPACITACIÓN</h2>
              </div>
              <div className={styles.trainingCardContent}>
                <ProgressBar videos={videos} />
              </div>
            </div>
            
            <div className={styles.trainingCard}>
              <div className={styles.trainingCardHeader}>
                <h2 className={styles.trainingCardTitle}>VIDEOS DE CAPACITACIÓN</h2>
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

      {/* Footer */}
      <footer className={styles.trainingFooter}>
        <div className={styles.trainingFooterContent}>
          <p className={styles.trainingFooterText}>
            Progreso total: {completedCount} de {videos.length} completados
          </p>
        </div>
      </footer>
    </div>
  );
}
