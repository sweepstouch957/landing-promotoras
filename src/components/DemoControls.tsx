'use client'

import { CheckCircle, RotateCcw } from 'lucide-react'

interface Video {
  id: string
  title: string
  description: string
  duration: number
  url: string
  completed: boolean
  watchedTime: number
}

interface DemoControlsProps {
  videos: Video[]
  onMarkVideoComplete: (videoIndex: number) => void
  onResetProgress: () => void
}

export default function DemoControls({ 
  videos, 
  onMarkVideoComplete, 
  onResetProgress 
}: DemoControlsProps) {
  const completedCount = videos.filter(video => video.completed).length
  const totalVideos = videos.length

  return (
    <div className="demo-controls">
      <div className="flex items-center justify-between mb-3">
        <h3 className="demo-controls h3">
          🎯 Controles de Demostración
        </h3>
        <span className="text-sm font-medium" style={{ color: '#92400e' }}>
          {completedCount}/{totalVideos} completados
        </span>
      </div>
      
      <div className="demo-controls-buttons">
        {videos.map((video, index) => (
          <button
            key={video.id}
            onClick={() => onMarkVideoComplete(index)}
            className={`demo-button demo-button-${index + 1} ${video.completed ? 'completed' : ''}`}
          >
            {video.completed && <CheckCircle className="w-3 h-3" />}
            {video.title.split(' ').slice(0, 2).join(' ')}
            <span className="ml-1 text-xs">
              {index + 1}
            </span>
          </button>
        ))}
        
        <button
          onClick={onResetProgress}
          className="demo-button demo-button-reset"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
          <span className="ml-1 text-xs">5</span>
        </button>
      </div>
      
      <p className="demo-tip">
        💡 Haz clic en los botones para simular la finalización de videos y probar el sistema de checks.
      </p>
    </div>
  )
}

