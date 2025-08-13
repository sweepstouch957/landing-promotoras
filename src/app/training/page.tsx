'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import SubmitSection from '@/components/SubmitSection';
import PaymentStructure from '@/components/PaymentStructure';
import styles from './training.module.css';
import Image from "next/image";

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
    description:
      'Gana dinero extra invitando a clientes a sorteos gratuitos en supermercados. Solo necesitas tu celular, buena actitud y ganas de impulsar.',
    duration: 129,
    url: 'https://videos-impulsadoras.s3.us-east-2.amazonaws.com/sweepstouch+une+a+supermercados+con+sus+clientes_3.mp4',
    completed: false,
    watchedTime: 0,
  },
];

export default function Home() {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  

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



  const handleSubmit = () => {
    setIsSubmitted(true);
    setTimeout(() => {
      window.location.href = '/training/register';
    }, 2000);
  };




  const completedCount = videos.filter((video) => video.completed).length;

  return (
    <div className={styles.trainingPage}>
      {/* Header */}
     <div className={styles.trainingHeader}>
  <div className={styles.trainingHeaderContent}>
    <Image
  src="/SWEEPSTOUCH.png"
  alt="SweepsTOUCH logo"
  width={350}  // aumenta el ancho
  height={50} // ajusta proporcionalmente
  className={styles.trainingHeaderTitle}
/>

    <div className={styles.trainingHeaderProgress}>
      {completedCount}/1 completados
    </div>
  </div>
</div>

      {/* Main Content */}
      <main className={styles.trainingMainContent}>
        {/* Developer Controls */}
        

        <div className={styles.trainingGridLayout}>
          {/* Columna izquierda */}
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

            {/* PaymentStructure solo visible en responsive */}
            <div
              className={`${styles.paymentContainer} ${styles.paymentResponsiveOnly}`}
            >
              <PaymentStructure />
            </div>

            <div className={styles.trainingCard}>
              <div className={styles.trainingCardContent}>
              {videos.length > 0 && (
  <SubmitSection
    video={videos[0]}
    onSubmit={handleSubmit}
    isSubmitted={isSubmitted}
  />
)}
              </div>
            </div>
          </div>

          {/* Columna derecha - PaymentStructure en desktop */}
          <div
            className={`${styles.paymentContainer} ${styles.paymentDesktopOnly}`}
          >
            <PaymentStructure />
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
