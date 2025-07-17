'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoList from '@/components/VideoList';
import ProgressBar from '@/components/ProgressBar';
import SubmitSection from '@/components/SubmitSection';
import DemoControls from '@/components/DemoControls';
import Header from '@/components/Header';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="main-content">
        {/* Demo Controls */}
        <DemoControls
          videos={videos}
          onMarkVideoComplete={handleMarkVideoComplete}
          onResetProgress={handleResetProgress}
        />

        <div className="grid-layout">
          {/* Left Column - Video Player */}
          <div className="space-y-6">
            <VideoPlayer
              video={videos[currentVideoIndex]}
              onVideoComplete={handleVideoComplete}
              watchedTime={videos[currentVideoIndex].watchedTime}
              setWatchedTime={setWatchedTime}
            />

            <SubmitSection
              videos={videos}
              onSubmit={handleSubmit}
              isSubmitted={isSubmitted}
            />
          </div>

          {/* Right Column - Progress & Video List */}
          <div className="space-y-6">
            <ProgressBar videos={videos} />
            <VideoList
              videos={videos}
              currentVideoIndex={currentVideoIndex}
              onVideoSelect={handleVideoSelect}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">
            Progreso total: {completedCount} de {videos.length} completados
          </p>
        </div>
      </footer>
    </div>
  );
}
