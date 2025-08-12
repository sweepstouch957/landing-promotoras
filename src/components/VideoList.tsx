'use client'

import { CheckCircle, Circle, Play } from 'lucide-react'

interface Video {
  id: string
  title: string
  description: string
  duration: number
  url: string
  completed: boolean
  watchedTime: number
}

interface VideoListProps {
  videos: Video[]
  currentVideoIndex: number
  onVideoSelect: (index: number) => void
}

export default function VideoList({ videos, currentVideoIndex, onVideoSelect }: VideoListProps) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const completedCount = videos.filter(video => video.completed).length
  const progressPercentage = (completedCount / videos.length) * 100

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Video de Capacitación</h2>
      </div>
      
      <div className="card-content">
        <div className="video-list">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className={`video-item ${index === currentVideoIndex ? 'active' : ''}`}
            >
              <div className="video-icon">
                {video.completed ? (
                  <CheckCircle className={`w-6 h-6 video-icon completed`} />
                ) : index === currentVideoIndex ? (
                  <Play className={`w-6 h-6 video-icon active`} />
                ) : (
                  <Circle className={`w-6 h-6 video-icon pending`} />
                )}
              </div>
              
              <div className="video-info">
                <h3 className={`video-title ${index === currentVideoIndex ? 'active' : ''}`}>
                  {video.title}
                </h3>
                <p className="video-description">{video.description}</p>
                <span className="video-duration">
                  Duración: {formatTime(video.duration)}
                </span>
              </div>
              
              <div className="video-action">
                <button
                  className={`btn ${index === currentVideoIndex ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => onVideoSelect(index)}
                >
                  {index === currentVideoIndex ? "Reproduciendo" : "Ver"}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Resumen de progreso */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="progress-stats">
            <span className="progress-label">Progreso total:</span>
            <span className="progress-value">
              {completedCount} de {videos.length} completados
            </span>
          </div>
          <div className="progress-track">
            <div 
              className={`progress-track-fill ${completedCount === videos.length ? 'completed' : 'incomplete'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

