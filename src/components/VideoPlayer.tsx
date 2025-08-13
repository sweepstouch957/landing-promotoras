'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, RotateCcw, CheckCircle, Maximize, Volume2, VolumeX } from 'lucide-react'

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
  const [isLoading, setIsLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isBuffering, setIsBuffering] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && watchedTime > 0) {
      videoRef.current.currentTime = watchedTime
      setCurrentTime(watchedTime)
    }
  }, [video.id])

  // Optimización: Usar useCallback para evitar re-renders innecesarios
  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error al reproducir video:', error)
          })
        }
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const handleRewind = useCallback(() => {
    if (videoRef.current) {
      const newTime = Math.max(0, videoRef.current.currentTime - 10)
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      setWatchedTime(video.id, newTime)
    }
  }, [video.id, setWatchedTime])

  // Optimización: Throttle para handleTimeUpdate
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const duration = videoRef.current.duration
      
      setCurrentTime(current)
      setIsBuffering(false)
      
      // Actualizar watchedTime de forma más fluida
      setWatchedTime(video.id, current)
      
      // Marcar como completado cuando llegue al 95% del video
      if (current >= duration * 0.95 && !video.completed) {
        onVideoComplete(video.id)
      }
    }
  }, [video.id, setWatchedTime, onVideoComplete, video.completed])

  const handleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).mozRequestFullScreen) { /* Firefox */
        (videoRef.current as any).mozRequestFullScreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).msRequestFullscreen) { /* IE/Edge */
        (videoRef.current as any).msRequestFullscreen();
      }
    }
  }, [])

  const handleVolumeToggle = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !isMuted
      videoRef.current.muted = newMuted
      setIsMuted(newMuted)
    }
  }, [isMuted])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }, [])

  // Eventos de carga del video
  const handleLoadStart = useCallback(() => {
    setIsLoading(true)
  }, [])

  const handleCanPlay = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleWaiting = useCallback(() => {
    setIsBuffering(true)
  }, [])

  const handlePlaying = useCallback(() => {
    setIsBuffering(false)
  }, [])

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
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          preload="metadata"
          playsInline
          poster="/images/video-poster.jpg"
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          style={{
            backgroundColor: '#000',
            objectFit: 'contain'
          }}
        >
          <source src={video.url} type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>
        
        {/* Indicador de carga */}
        {(isLoading || isBuffering) && (
          <div className="video-loading-overlay">
            <div className="video-spinner"></div>
          </div>
        )}
        
        {/* Controles de overlay */}
        <div className="video-controls">
          <div className="video-controls-row">
            <button
              onClick={handlePlayPause}
              className="video-button"
              disabled={isLoading}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button
              onClick={handleRewind}
              className="video-button"
              disabled={isLoading}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <span className="video-time">
              {formatTime(currentTime)} / {formatTime(video.duration)}
            </span>
            
            <div className="video-volume-controls">
              <button
                onClick={handleVolumeToggle}
                className="video-button"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="video-volume-slider"
              />
            </div>
            
            <button
              onClick={handleFullscreen}
              className="video-button"
            >
              <Maximize className="w-5 h-5" />
            </button>
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

