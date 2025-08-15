/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
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
} from "@mui/material";
import { PhotoCamera, Send } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import VideoPlayer from "@/components/VideoPlayer";
import SubmitSection from "@/components/SubmitSection";
import PaymentStructure from "@/components/PaymentStructure";
import styles from "./training.module.css";
import { api } from "@/api/axios";

// >>>>>>>>>>>>>> API (tu wrapper de axios) <<<<<<<<<<<<<<

const theme = createTheme({
  palette: {
    primary: { main: "#e91e63", dark: "#c2185b", light: "#f8bbd9" },
    secondary: { main: "#ad1457", dark: "#880e4f", light: "#f48fb1" },
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

interface LocalUser {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  zipcode?: string;
  role?: string;
  photoUrl?: string; // avatarUrl
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

  // Gate de acceso por formulario
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal y foto
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Creación de ActivationRequest
  const [creatingRequest, setCreatingRequest] = useState(false);

  // Verificar si el formulario fue completado
  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) setIsFormCompleted(true);
    } catch (error) {
      console.error("Error checking form completion:", error);
    } finally {
      setIsLoading(false);
    }
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

  // Llama a tu backend para crear la ActivationRequest
  const createActivationRequest = async (avatarUrl: string) => {
    setCreatingRequest(true);
    try {
      const userRaw = localStorage.getItem("userData");
      if (!userRaw) throw new Error("No se encontró userData en localStorage");

      const user: LocalUser = JSON.parse(userRaw);

      // Payload requerido por tu controller
      const payload = {
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        zipcode: user.zipcode,
        role: user.role || "promotor",
        avatarUrl, // usamos la url recién subida
      };

      // Validación mínima en front
      if (!payload.email || !payload.firstName || !payload.lastName) {
        throw new Error("Faltan datos obligatorios: nombre, apellido o email.");
      }

      const { data } = await api.post("/activation-requests", payload);
      // data => { success, message, data: { requestId, userId } }

      // Persistimos por si quieres usarlo luego
      localStorage.setItem(
        "activationRequest",
        JSON.stringify({
          requestId: data?.data?.requestId,
          userId: data?.data?.userId,
        })
      );

      alert("¡Solicitud enviada! Te avisaremos cuando sea aprobada.");
      setPhotoModalOpen(false);
    } catch (error: any) {
      console.error("Error creando ActivationRequest:", error);
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        "No se pudo crear la solicitud";
      alert(msg);
    } finally {
      setCreatingRequest(false);
    }
  };

  // Sube foto a tu servicio y luego crea la ActivationRequest
  const handlePhotoUpload = async () => {
    if (!photoFile) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("image", photoFile);
      formData.append("folder", "promotor-request");

      // 1) Subir imagen (tu endpoint de upload)
      const response = await fetch("https://api2.sweepstouch.com/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error al subir la foto");

      const result = await response.json();
      const avatarUrl = result?.url;
      if (!avatarUrl) throw new Error("No se recibió URL de la foto");

      // 2) Guardar en localStorage
      const userRaw = localStorage.getItem("userData");
      if (userRaw) {
        const user = JSON.parse(userRaw);
        user.photoUrl = avatarUrl;
        localStorage.setItem("userData", JSON.stringify(user));
      }

      // 3) Crear ActivationRequest en tu backend
      await createActivationRequest(avatarUrl);
    } catch (error) {
      console.error("Error al subir la foto/crear request:", error);
      alert("Error al completar el registro. Intenta nuevamente.");
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
            <button onClick={handleGoToForm} className={styles.primaryButton}>
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

      {/* Modal de subida de foto + creación de ActivationRequest */}
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
              backgroundColor: "rgba(255, 240, 247, 0.95)",
              border: "2px solid #e91e63",
              backdropFilter: "blur(10px)",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#e91e63",
              fontWeight: "bold",
              fontSize: "1.5rem",
              textAlign: "center",
            }}
          >
            <PhotoCamera sx={{ color: "#e91e63" }} />
            Completa tu Registro
          </DialogTitle>

          <DialogContent>
            <Typography
              sx={{
                fontSize: "1rem",
                color: "#333",
                mb: 3,
                textAlign: "center",
              }}
            >
              Para finalizar tu registro como promotora, necesitamos una foto
              tuya.
            </Typography>

            <Box sx={{ textAlign: "center" }}>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="photo-upload-training"
                type="file"
                onChange={handlePhotoChange}
              />
              <label htmlFor="photo-upload-training">
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    padding: 3,
                    border: "2px dashed #e91e63",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(233,30,99,0.05)",
                      borderColor: "#c2185b",
                    },
                  }}
                >
                  {photoPreview ? (
                    <Avatar
                      src={photoPreview}
                      sx={{
                        width: 120,
                        height: 120,
                        border: "3px solid #e91e63",
                      }}
                    />
                  ) : (
                    <IconButton
                      component="span"
                      sx={{
                        backgroundColor: "#f8bbd9",
                        color: "#e91e63",
                        width: 80,
                        height: 80,
                        "&:hover": {
                          backgroundColor: "#e91e63",
                          color: "white",
                        },
                      }}
                    >
                      <PhotoCamera sx={{ fontSize: 40 }} />
                    </IconButton>
                  )}
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#e91e63" }}
                  >
                    {photoPreview ? "Cambiar Foto" : "Subir Foto"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    JPG, JPEG o PNG (máx. 5MB)
                  </Typography>
                </Box>
              </label>
            </Box>
          </DialogContent>

          <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
            <Button
              onClick={() => setPhotoModalOpen(false)}
              variant="outlined"
              sx={{
                borderColor: "#e91e63",
                color: "#e91e63",
                "&:hover": {
                  borderColor: "#c2185b",
                  backgroundColor: "rgba(233, 30, 99, 0.05)",
                },
              }}
              disabled={uploadingPhoto || creatingRequest}
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePhotoUpload}
              variant="contained"
              disabled={!photoFile || uploadingPhoto || creatingRequest}
              startIcon={
                uploadingPhoto || creatingRequest ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Send />
                )
              }
              sx={{
                backgroundColor: "#e91e63",
                color: "white",
                minWidth: 150,
                "&:hover": { backgroundColor: "#c2185b" },
                "&:disabled": { backgroundColor: "rgba(233, 30, 99, 0.6)" },
              }}
            >
              {uploadingPhoto
                ? "Subiendo..."
                : creatingRequest
                ? "Enviando..."
                : "Subir & Enviar"}
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </div>
  );
}
