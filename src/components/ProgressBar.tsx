'use client'

import { CheckCircle } from 'lucide-react'

interface Video {
  id: string
  title: string
  description: string
  duration: number
  url: string
  completed: boolean
  watchedTime: number
}

interface ProgressBarProps {
  videos: Video[]
}

export default function ProgressBar({ videos }: ProgressBarProps) {
  const completedCount = videos.filter(video => video.completed).length
  const totalVideos = videos.length
  const progressPercentage = (completedCount / totalVideos) * 100
  const allCompleted = completedCount === totalVideos

  return (
    <div className="card">
      <div className="card-content">
        <div className="progress-header">
          <h2 className="progress-title">Progreso de Capacitación</h2>
          {allCompleted && (
            <div className="progress-completed">
              <CheckCircle className="w-5 h-5" />
              <span>¡Completado!</span>
            </div>
          )}
        </div>
        
        <div className="progress-section">
          <div className="progress-stats">
            <span className="progress-label">Videos completados</span>
            <span className="progress-value">{completedCount} de {totalVideos}</span>
          </div>
          <div className="progress-track">
            <div 
              className={`progress-track-fill ${allCompleted ? 'completed' : 'incomplete'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="progress-percentage">
            <span className="progress-percentage-text">{Math.round(progressPercentage)}%</span>
          </div>
        </div>
        
        {/* Lista de videos con estado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
          {videos.map((video) => (
            <div key={video.id} className="flex items-center gap-2 p-2 rounded">
              <div className={`w-2 h-2 rounded-full ${
                video.completed ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className={`text-xs ${
                video.completed ? 'text-green-700' : 'text-gray-500'
              }`}>
                {video.title}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {allCompleted 
              ? "¡Felicidades! Has completado toda la capacitación."
              : "Gana dinero extra invitando a clientes a sorteos gratuitos en supermercados. Solo necesitas tu celular, buena actitud y ganas de impulsar."
            }
          </p>
        </div>
      </div>
    </div>
  )
}

