"use client";

import { useState, useEffect } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import SubmitSection from "@/components/SubmitSection";
import PaymentStructure from "@/components/PaymentStructure";
import styles from "./training.module.css";
import Image from "next/image";
import { 
  Box, 
  CircularProgress, 
 
  Typography, 
  Button, 

  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,

} from '@mui/material';
import {  PhotoCamera, Send } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#e91e63', dark: '#c2185b', light: '#f8bbd9' },
    secondary: { main: '#ad1457', dark: '#880e4f', light: '#f48fb1' },
  },
});

// Tipos
interface Video {
  id: string;
  title: string;
  description: string;
  duration: number;
  url: string;
  completed: boolean;
  watchedTime: number;
}

// Videos iniciales
const initialVideos: Video[] = [
  {
    id: "training",
    title: "Conoce a Sweepstouch y su programa de impulsadoras",
    description:
      "Gana dinero extra invitando a clientes a sorteos gratuitos en supermercados. Solo necesitas tu celular, buena actitud y ganas de impulsar.",
    duration: 129,
    url: "https://videos-impulsadoras.s3.us-east-2.amazonaws.com/sweepstouch+une+a+supermercados+con+sus+clientes_5.mp4",
    completed: false,
    watchedTime: 0,
  },
];

export default function Home() {
  // Estados principales
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Estados extra del archivo grande
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal de foto
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Verificar si el formulario fue completado
  useEffect(() => {
    const checkFormCompletion = () => {
      try {
        const userData = localStorage.getItem("userData");
        if (userData) {
          setIsFormCompleted(true);
        }
      } catch (error) {
        console.error("Error checking form completion:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkFormCompletion();
  }, []);

  // Cargar progreso guardado
  useEffect(() => {
    const savedProgress = localStorage.getItem("elearning-progress");
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setVideos(parsed.videos || initialVideos);
        setCurrentVideoIndex(parsed.currentVideoIndex || 0);
        setIsSubmitted(parsed.isSubmitted || false);
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    }
  }, []);

  // Guardar progreso
  useEffect(() => {
    const progress = {
      videos,
      currentVideoIndex,
      isSubmitted,
    };
    localStorage.setItem("elearning-progress", JSON.stringify(progress));
  }, [videos, currentVideoIndex, isSubmitted]);

  // Handlers de video
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

  // Submit → abrir modal de foto
  const handleSubmit = () => {
    setIsSubmitted(true);
    setPhotoModalOpen(true);
  };

  // Subida de foto
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("image", photoFile);
      formData.append("folder", "promotor-request");

      const response = await fetch("https://api2.sweepstouch.com/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Foto subida exitosamente:", result);

        const userData = localStorage.getItem("userData");
        if (userData) {
          const user = JSON.parse(userData);
          user.photoUrl = result.url;
          localStorage.setItem("userData", JSON.stringify(user));
        }

        setPhotoModalOpen(false);
        alert("¡Foto subida exitosamente! Tu registro está completo.");
      } else {
        throw new Error("Error al subir la foto");
      }
    } catch (error) {
      console.error("Error al subir la foto:", error);
      alert("Error al subir la foto. Por favor, intenta de nuevo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleGoToForm = () => (window.location.href = "/formulario");

  // Estados especiales
  if (isLoading) {
    return (
      <div className={styles.trainingPage}>
        <div className={styles.centerScreen}>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isFormCompleted) {
    return (
      <div className={styles.trainingPage}>
        <div className={styles.centerScreen}>
          <div className={styles.trainingCard}>
            <h2 className={styles.restrictedTitle}>Acceso Restringido</h2>
            <p className={styles.restrictedMessage}>
              Debes completar el formulario de registro primero.
            </p>
            <button
              onClick={handleGoToForm}
              className={styles.primaryButton}
            >
              Ir al Formulario
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Videos completados
  const completedCount = videos.filter((video) => video.completed).length;

  return (
    <div className={styles.trainingPage}>
      {/* Header */}
      <div className={styles.trainingHeader}>
        <div className={styles.trainingHeaderContent}>
          <Image
            src="/SWEEPSTOUCH.png"
            alt="SweepsTOUCH logo"
            width={350}
            height={50}
            className={styles.trainingHeaderTitle}
            style={{ objectFit: "contain" }}
          />
          <div className={styles.trainingHeaderProgress}>
            {completedCount}/1 completados
          </div>
        </div>
      </div>

      {/* Main */}
      <main className={styles.trainingMainContent}>
        <div className={styles.trainingFullWidthLayout}>
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

          {/* PaymentStructure */}
          <div className={styles.paymentContainer}>
            <PaymentStructure />
          </div>

          {/* Submit Section */}
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
      </main>

      {/* Modal de subida de foto */}
      <ThemeProvider theme={theme}>
        <Dialog
          open={photoModalOpen}
          onClose={() => setPhotoModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 2,
              backgroundColor: 'rgba(255, 240, 247, 0.95)',
              border: '2px solid #e91e63',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: '#e91e63',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              textAlign: 'center',
            }}
          >
            <PhotoCamera sx={{ color: '#e91e63' }} />
            Completa tu Registro
          </DialogTitle>
          
          <DialogContent>
            <Typography sx={{ fontSize: '1rem', color: '#333', mb: 3, textAlign: 'center' }}>
              Para finalizar tu registro como promotora, necesitamos una foto tuya.
            </Typography>

            <Box sx={{ textAlign: 'center' }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload-training"
                type="file"
                onChange={handlePhotoChange}
              />
              <label htmlFor="photo-upload-training">
                <Box sx={{
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: 2,
                  padding: 3, 
                  border: '2px dashed #e91e63',
                  borderRadius: 2, 
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    backgroundColor: 'rgba(233,30,99,0.05)', 
                    borderColor: '#c2185b' 
                  }
                }}>
                  {photoPreview ? (
                    <Avatar 
                      src={photoPreview} 
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        border: '3px solid #e91e63' 
                      }} 
                    />
                  ) : (
                    <IconButton 
                      component="span" 
                      sx={{ 
                        backgroundColor: '#f8bbd9', 
                        color: '#e91e63', 
                        width: 80,
                        height: 80,
                        '&:hover': { 
                          backgroundColor: '#e91e63', 
                          color: 'white' 
                        } 
                      }}
                    >
                      <PhotoCamera sx={{ fontSize: 40 }} />
                    </IconButton>
                  )}
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#e91e63'
                    }}
                  >
                    {photoPreview ? 'Cambiar Foto' : 'Subir Foto'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    JPG, JPEG o PNG (máx. 5MB)
                  </Typography>
                </Box>
              </label>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
            <Button
              onClick={() => setPhotoModalOpen(false)}
              variant="outlined"
              sx={{
                borderColor: '#e91e63',
                color: '#e91e63',
                '&:hover': {
                  borderColor: '#c2185b',
                  backgroundColor: 'rgba(233, 30, 99, 0.05)',
                }
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePhotoUpload}
              variant="contained"
              disabled={!photoFile || uploadingPhoto}
              startIcon={uploadingPhoto ? <CircularProgress size={20} color="inherit" /> : <Send />}
              sx={{
                backgroundColor: '#e91e63',
                color: 'white',
                minWidth: 150,
                '&:hover': { 
                  backgroundColor: '#c2185b' 
                },
                '&:disabled': { 
                  backgroundColor: 'rgba(233, 30, 99, 0.6)' 
                },
              }}
            >
              {uploadingPhoto ? 'Subiendo...' : 'Subir Foto'}
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </div>
  );
}
