'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react'

interface Video {
  id: string
  title: string
  description: string
  duration: number
  url: string
  completed: boolean
  watchedTime: number
}

interface VideoPlayerProps {
  video: Video
  onVideoComplete: (videoId: string) => void
  watchedTime: number
  setWatchedTime: (videoId: string, time: number) => void
}

export default function VideoPlayer({ 
  video, 
  onVideoComplete, 
  watchedTime, 
  setWatchedTime 
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = watchedTime
      setCurrentTime(watchedTime)
    }
  }, [video.id, watchedTime])

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleRewind = () => {
    if (videoRef.current) {
      const newTime = Math.max(0, videoRef.current.currentTime - 10)
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      setWatchedTime(video.id, newTime)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const duration = videoRef.current.duration
      
      setCurrentTime(current)
      
      // Solo actualizar watchedTime si el usuario no está saltando hacia adelante
      if (current <= watchedTime + 1) {
        setWatchedTime(video.id, current)
      }
      
      // Marcar como completado cuando llegue al 95% del video
      if (current >= duration * 0.95 && !video.completed) {
        onVideoComplete(video.id)
      }
    }
  }

  const handleSeek = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const target = e.target as HTMLVideoElement
    const newTime = target.currentTime
    
    // Prevenir adelantar el video
    if (newTime > watchedTime) {
      target.currentTime = watchedTime
      setCurrentTime(watchedTime)
    } else {
      setCurrentTime(newTime)
      setWatchedTime(video.id, newTime)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = video.duration > 0 ? (currentTime / video.duration) * 100 : 0

  return (
    <div className="card">
      <div className="video-container">
        <video
          ref={videoRef}
          className="video-element"
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeek}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onContextMenu={(e) => e.preventDefault()}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
        >
          <source src={video.url} type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>
        
        {/* Controles de overlay */}
        <div className="video-controls">
          <div className="video-controls-row">
            <button
              onClick={handlePlayPause}
              className="video-button"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button
              onClick={handleRewind}
              className="video-button"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <span className="video-time">
              {formatTime(currentTime)} / {formatTime(video.duration)}
            </span>
          </div>
          
          {/* Barra de progreso */}
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="card-title mb-2">{video.title}</h3>
        <p className="text-gray-600 mb-4">{video.description}</p>
        
        {video.completed && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">✓ Video completado</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

