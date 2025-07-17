'use client'

import { Send, CheckCircle, AlertCircle } from 'lucide-react'

interface Video {
  id: string
  title: string
  description: string
  duration: number
  url: string
  completed: boolean
  watchedTime: number
}

interface SubmitSectionProps {
  videos: Video[]
  onSubmit: () => void
  isSubmitted: boolean
}

export default function SubmitSection({ videos, onSubmit, isSubmitted }: SubmitSectionProps) {
  const completedCount = videos.filter(video => video.completed).length
  const totalVideos = videos.length
  const allCompleted = completedCount === totalVideos
  const remainingVideos = totalVideos - completedCount

  if (isSubmitted) {
    const now = new Date()
    const submitDate = now.toLocaleDateString('es-ES')
    const submitTime = now.toLocaleTimeString('es-ES')

    return (
      <div className="card submit-section">
        <div className="submit-icon success">
          <CheckCircle />
        </div>
        
        <h2 className="submit-title success">
          ¡Capacitación Completada!
        </h2>
        <p className="submit-description success">
          Tu capacitación ha sido enviada exitosamente.
        </p>
        
        <div className="submit-summary success">
          <h3 className="submit-summary-title success">Resumen:</h3>
          <div className="submit-summary-list success">
            • Videos completados: {completedCount} de {totalVideos}<br/>
            • Fecha de envío: {submitDate}<br/>
            • Hora de envío: {submitTime}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card submit-section">
      <h2 className="card-title mb-4">Finalizar Capacitación</h2>
      
      {!allCompleted ? (
        <>
          <div className="submit-icon warning">
            <AlertCircle />
          </div>
          
          <h3 className="submit-title warning">
            Capacitación incompleta
          </h3>
          <p className="submit-description">
            Debes completar todos los videos antes de poder enviar tu capacitación.
          </p>
          
          <div className="submit-summary warning">
            <h4 className="submit-summary-title warning">Progreso actual:</h4>
            <div className="submit-summary-list warning">
              <strong>Videos completados:</strong> {completedCount} de {totalVideos}<br/>
              <strong>Videos restantes:</strong> {remainingVideos}
            </div>
          </div>
          
          <button 
            disabled 
            className="btn btn-primary"
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            <Send className="w-4 h-4" />
            Enviar Capacitación
          </button>
        </>
      ) : (
        <>
          <div className="submit-icon success">
            <CheckCircle />
          </div>
          
          <h3 className="submit-title success">
            ¡Excelente! Has completado todos los videos de capacitación.
          </h3>
          <p className="submit-description">
            Ahora puedes enviar tu capacitación para obtener la certificación.
          </p>
          
          <button 
            onClick={onSubmit}
            className="btn btn-green"
          >
            <Send className="w-4 h-4" />
            Enviar Capacitación
          </button>
        </>
      )}
    </div>
  )
}

