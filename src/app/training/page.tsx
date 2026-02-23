/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from "react";
import imageCompression from "browser-image-compression";

import VideoPlayer from "@/components/VideoPlayer";
import SubmitSection from "@/components/SubmitSection";
import styles from "./training.module.css";
import Image from "next/image";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  Alert,
} from '@mui/material';

import { Lock, ArrowBack, PhotoCamera, Send } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { createActivationRequestFE } from '@/services/activation.service';

// ✅ usa tu objeto axios exportado

// ---------------- UI THEME ----------------
const theme = createTheme({
  palette: {
    primary: { main: '#ff0f6e', dark: '#c10061', light: '#ffe6f2' },
    secondary: { main: '#c10061', dark: '#8a0044', light: '#ff7bb8' },
  },
});

// ---------------- Tipos ----------------
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
    url: 'https://videos-impulsadoras.s3.us-east-2.amazonaws.com/sweepstouch+une+a+supermercados+con+sus+clientes_5.mp4',
    completed: false,
    watchedTime: 0,
  },
];

function splitName(fullName?: string): { firstName: string; lastName: string } {
  if (!fullName) return { firstName: 'Promotora', lastName: '' };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.slice(-1).join(' '),
  };
}

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

  // Estados para modales personalizados
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);
  const [photoFileCompressed, setPhotoFileCompressed] = useState<File | null>(
    null
  );

  // Estado para controlar si el usuario ya completó todo
  const [userCompletedAll, setUserCompletedAll] = useState(false);

  // Evitar doble envío de activation
  const [activationLoading, setActivationLoading] = useState(false);

  // Funciones helper para modales

  const showModal = useCallback(
    (
      type: 'info' | 'error' | 'success',
      title: string,
      message: string,
      action?: () => void
    ) => {
      setModalTitle(title);
      setModalMessage(message);
      setModalAction(() => action || null);

      if (type === 'info') {
        setShowInfoModal(true);
      } else if (type === 'error') {
        setShowErrorModal(true);
      } else if (type === 'success') {
        setShowSuccessModal(true);
      }
    },
    [
      setModalTitle,
      setModalMessage,
      setModalAction,
      setShowInfoModal,
      setShowErrorModal,
      setShowSuccessModal,
    ]
  );

  const closeModal = () => {
    setShowInfoModal(false);
    setShowErrorModal(false);
    setShowSuccessModal(false);
    if (modalAction) {
      modalAction();
      setModalAction(null);
    }
  };

  // ---------- Activation Request trigger centralizado ----------

  const requestActivationIfPossible = useCallback(
    async (reason: 'auto' | 'manual' = 'auto') => {
      try {
        if (activationLoading) return;
        if (typeof window === 'undefined') return;

        const raw = localStorage.getItem('userData');
        if (!raw) return;
        const user = JSON.parse(raw);

        // Necesitamos al menos: email + foto
        const email = user?.email || user?.correo || user?.mail;
        const avatarUrl = user?.photoUrl || user?.avatarUrl;
        if (!email || !avatarUrl) return;

        const hasSplit = user?.firstName || user?.lastName;
        const { firstName, lastName } = hasSplit
          ? { firstName: user.firstName, lastName: user.lastName }
          : splitName(user?.nombre || user?.apellido);

        setActivationLoading(true);
        const res = await createActivationRequestFE({
          firstName,
          lastName,
          email,
          phoneNumber: user?.phoneNumber || user?.telefono || undefined,
          zipcode: user?.zipcode || user?.zipCode || undefined,
          role: 'promotor',
          avatarUrl,
        });

        if (res.ok) {
          console.log(reason);
          localStorage.setItem('activationRequested', 'true');
          if (res.requestId)
            localStorage.setItem('activationRequestId', res.requestId);
          showModal(
            'success',
            'Solicitud enviada',
            '¡Tu solicitud de activación fue creada y está en revisión! Te enviaremos un correo cuando sea aprobada.'
          );
          return;
        }

        if (res.status === 409 && res.code === 'pending') {
          localStorage.setItem('activationRequested', 'true');
          if (res.requestId)
            localStorage.setItem('activationRequestId', res.requestId);
          showModal(
            'info',
            'Solicitud pendiente',
            'Ya tienes una solicitud de activación pendiente. Te avisaremos cuando sea aprobada.'
          );
          return;
        }

        if (res.status === 409 && res.code === 'active_user') {
          localStorage.setItem('activationRequested', 'true');
          showModal(
            'info',
            'Cuenta activa',
            'Tu cuenta ya está activa. ¡Puedes continuar usando la plataforma!'
          );
          return;
        }

        // Otro error
        showModal(
          'error',
          'Error',
          'No pudimos crear la solicitud en este momento. Inténtalo más tarde.'
        );
      } catch (e: any) {
        console.error('createActivationRequest FE error:', e?.message || e);
        showModal(
          'error',
          'Error',
          'No pudimos crear la solicitud en este momento. Inténtalo más tarde.'
        );
      } finally {
        setActivationLoading(false);
      }
    },
    [activationLoading, setActivationLoading, showModal]
  );

  // ---------- Verificar si el formulario fue completado ----------
  useEffect(() => {
    const checkFormCompletion = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const emailFromUrl = urlParams.get('email');

        if (emailFromUrl) {
          // Validar que el email existe en la base de datos
          try {
            const response = await fetch(
              `https://backend-promotoras.onrender.com/api/users/email/${encodeURIComponent(
                emailFromUrl
              )}`
            );

            if (response.ok) {
              const userData = await response.json();
              localStorage.setItem('userData', JSON.stringify(userData.data));
              setIsFormCompleted(true);

              showModal(
                'info',
                '¡Bienvenido de vuelta!',
                `¡Hola ${userData.data.nombre}! Bienvenida de vuelta. Continúa con tu entrenamiento.`
              );

              // Estados de progreso
              if (userData.data.videoWatched && userData.data.photoUrl) {
                setUserCompletedAll(true);
                setIsFormCompleted(true);
                setIsSubmitted(true);

                showModal(
                  'info',
                  '¡Proceso Ya Completado!',
                  `¡Hola ${userData.data.nombre}! Ya has completado todo el proceso de registro. Puedes ver el video nuevamente, pero no necesitas subir otra foto.`
                );

                // 🔔 Crear ActivationRequest si aún no existe (auto)
                requestActivationIfPossible('auto');
                return;
              }

              if (userData.data.videoWatched && !userData.data.photoUrl) {
                setIsSubmitted(true);
                setTimeout(() => setPhotoModalOpen(true), 1000);
              }
            } else {
              showModal(
                'error',
                'Usuario No Encontrado',
                'No encontramos tu correo en nuestro sistema. Por favor, completa primero el formulario de registro.',
                () => {
                  window.location.href = '/formulario';
                }
              );
              return;
            }
          } catch (error) {
            console.error('Error validating email from URL:', error);
            showModal(
              'error',
              'Error de Validación',
              'Error al validar tu información. Por favor, intenta más tarde.'
            );
            return;
          }
        } else {
          // Flujo normal: revisar localStorage + (opcional) validar contra API
          const skipEmailValidation = localStorage.getItem(
            'skipEmailValidation'
          );

          const userMessage = localStorage.getItem('userMessage');
          if (userMessage) {
            const message = JSON.parse(userMessage);
            showModal('info', 'Información', message.message);
            localStorage.removeItem('userMessage');
          }

          const userData = localStorage.getItem('userData');
          if (userData) {
            const user = JSON.parse(userData);
            setIsFormCompleted(true);

            if (skipEmailValidation) {
              localStorage.removeItem('skipEmailValidation');

              if (user.videoWatched && user.photoUrl) {
                setUserCompletedAll(true);
                setIsFormCompleted(true);
                setIsSubmitted(true);

                showModal(
                  'info',
                  '¡Proceso Ya Completado!',
                  `¡Hola ${user.nombre}! Ya has completado todo el proceso de registro. Puedes ver el video nuevamente, pero no necesitas subir otra foto.`
                );

                // 🔔 Crear ActivationRequest si aún no se ha creado (auto)
                requestActivationIfPossible('auto');
                return;
              }

              if (user.videoWatched && !user.photoUrl) {
                setIsSubmitted(true);
                setTimeout(() => setPhotoModalOpen(true), 1000);
              }
            } else {
              // Validación contra API
              try {
                const response = await fetch(
                  `https://backend-promotoras.onrender.com/api/users/email/${encodeURIComponent(
                    user.email
                  )}`
                );
                if (response.ok) {
                  const apiUser = await response.json();

                  if (apiUser.data.videoWatched && apiUser.data.photoUrl) {
                    setUserCompletedAll(true);
                    setIsSubmitted(true);

                    showModal(
                      'info',
                      '¡Proceso Ya Completado!',
                      `¡Hola ${user.nombre}! Ya has completado todo el proceso de registro. Puedes ver el video nuevamente, pero no necesitas subir otra foto.`
                    );

                    // 🔔 Crear ActivationRequest si aún no se ha creado (auto)
                    requestActivationIfPossible('auto');
                    return;
                  }

                  if (apiUser.data.videoWatched && !apiUser.data.photoUrl) {
                    setIsSubmitted(true);
                    setTimeout(() => setPhotoModalOpen(true), 1000);
                  }
                }
              } catch (error) {
                console.error('Error verificando estado del usuario:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking form completion:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkFormCompletion();
  }, []);

  // ---------- Cargar progreso guardado ----------
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

  // ---------- Guardar progreso ----------
  useEffect(() => {
    const progress = {
      videos,
      currentVideoIndex,
      isSubmitted,
    };
    localStorage.setItem('elearning-progress', JSON.stringify(progress));
  }, [videos, currentVideoIndex, isSubmitted]);

  // ---------- Handlers de video ----------
  const handleVideoComplete = async (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, completed: true } : v))
    );

    try {
      const userData = localStorage.getItem('userData');
      const userToken = localStorage.getItem('userToken');

      if (userData) {
        const user = JSON.parse(userData);

        // Si tenemos token -> endpoint por token, sino por email
        if (userToken) {
          await fetch(
            `https://backend-promotoras.onrender.com/api/users/token/${encodeURIComponent(
              userToken
            )}/video`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ videoWatched: true }),
            }
          );
        } else {
          await fetch(
            `https://backend-promotoras.onrender.com/api/users/email/${encodeURIComponent(
              user.email
            )}/video`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ videoWatched: true }),
            }
          );
        }
      }
    } catch (error) {
      console.error('Error actualizando estado del video:', error);
    }
  };

  const setWatchedTime = (videoId: string, time: number) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, watchedTime: time } : v))
    );
  };

  // ---------- Submit → abrir modal de foto ----------
  const handleSubmit = () => {
    setIsSubmitted(true);
    setPhotoModalOpen(true);
  };

  // ---------- Subida de foto ----------
  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Solo imágenes
    if (!file.type.startsWith("image/")) {
      showModal(
        "error",
        "Archivo no válido",
        "Por favor, selecciona una imagen (JPG/PNG)."
      );
      return;
    }

    try {
      // 1ª pasada: compresión estándar
      let options: any = {
        maxSizeMB: 1, // objetivo: ≤ 1MB
        maxWidthOrHeight: 900, // reduce dimensiones si viene gigante
        useWebWorker: true,
        initialQuality: 0.8, // calidad inicial
        fileType: file.type.includes("png") ? "image/png" : "image/jpeg",
      };

      let compressed = await imageCompression(file, options);

      // Si sigue >1MB, 2ª pasada más agresiva
      if (compressed.size > 1024 * 1024) {
        options = {
          ...options,
          maxWidthOrHeight: 720,
          initialQuality: 0.7,
        };
        compressed = await imageCompression(compressed, options);
      }

      // Si aun así pasa de 1MB, 3ª pasada mínima razonable
      if (compressed.size > 1024 * 1024) {
        options = {
          ...options,
          maxWidthOrHeight: 640,
          initialQuality: 0.6,
        };
        compressed = await imageCompression(compressed, options);
      }

      // Verificación final
      if (compressed.size > 1024 * 1024) {
        const sizeMB = (compressed.size / (1024 * 1024)).toFixed(2);
        showModal(
          "error",
          "Imagen muy pesada",
          `La imagen sigue pesando ${sizeMB} MB incluso tras comprimir. Prueba con otra foto o baja la resolución.`
        );
        return;
      }

      // Preview desde el archivo comprimido
      const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
      setPhotoPreview(dataUrl);
      setPhotoFile(file); // original (por si lo quieres)
      setPhotoFileCompressed(compressed); // el que realmente usaremos para subir
    } catch (err) {
      console.error("Error al comprimir:", err);
      showModal(
        "error",
        "Error al comprimir",
        "No pudimos procesar la imagen. Intenta de nuevo."
      );
    }
  };

  const handlePhotoUpload = async () => {
    const toUpload = photoFileCompressed ?? photoFile;
    if (!toUpload) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("image", toUpload);
      formData.append("folder", "promotor-request");

      const response = await fetch('https://api2.sweepstouch.com/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir la foto');

      const result = await response.json();
      const userData = localStorage.getItem('userData');
      const userToken = localStorage.getItem('userToken');

      if (userData) {
        const user = JSON.parse(userData);
        user.photoUrl = result.url;
        localStorage.setItem('userData', JSON.stringify(user));

        try {
          if (userToken) {
            await fetch(
              `https://backend-promotoras.onrender.com/api/users/token/${encodeURIComponent(
                userToken
              )}/photo`,
              {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photoUrl: result.url }),
              }
            );
          } else {
            await fetch(
              `https://backend-promotoras.onrender.com/api/users/email/${encodeURIComponent(
                user.email
              )}/photo`,
              {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photoUrl: result.url }),
              }
            );
          }
        } catch (error) {
          console.error('Error actualizando foto en la API:', error);
        }
      }

      await requestActivationIfPossible("manual");
      setPhotoModalOpen(false);
    } catch (error) {
      console.error('Error al subir la foto:', error);
      showModal(
        'error',
        'Error al Subir Foto',
        'Error al subir la foto. Por favor, intenta de nuevo.'
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleGoToForm = () => (window.location.href = '/formulario');

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
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: '100vh',
            background: '#e4dbd8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
          }}
        >
          <Container maxWidth="md">
            <Card
              sx={{
                textAlign: 'center',
                padding: 4,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                border: '2px solid #ff0f6e',
              }}
            >
              <Lock
                sx={{ fontSize: 80, color: 'primary.main', marginBottom: 2 }}
              />
              <Typography
                variant="h3"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  marginBottom: 3,
                }}
              >
                Acceso Restringido
              </Typography>

              <Alert
                severity="warning"
                sx={{
                  marginBottom: 3,
                  borderRadius: '15px',
                  '& .MuiAlert-icon': { color: '#ff0f6e' },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, marginBottom: 1 }}
                >
                  ¡Debes completar el formulario de registro primero!
                </Typography>
                <Typography variant="body1">
                  Para acceder al entrenamiento, necesitas completar el
                  formulario de registro.
                </Typography>
              </Alert>

              <Button
                variant="contained"
                size="large"
                onClick={handleGoToForm}
                startIcon={<ArrowBack />}
                sx={{
                  minWidth: 250,
                  background:
                    'linear-gradient(135deg, #ff0f6e 0%, #c10061 100%)',
                  boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #c10061 0%, #c10061 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(233,30,99,0.4)',
                  },
                }}
              >
                Ir al Formulario
              </Button>
            </Card>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  // Videos completados
  const completedCount = videos.filter((v) => v.completed).length;

  // ¿Ya tiene foto persistida?
  const userHasPersistedPhoto =
    typeof window !== 'undefined' &&
    !!JSON.parse(localStorage.getItem('userData') || '{}')?.photoUrl;

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
            style={{ objectFit: 'contain' }}
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

              {/* Botón Activar Cuenta */}
              {(isSubmitted || videos[0]?.completed) && (
                <Box sx={{ textAlign: 'center', marginTop: 2 }}>
                  {userCompletedAll ? (
                    <Box>
                      <Button
                        variant="contained"
                        disabled
                        sx={{
                          backgroundColor: '#ccc',
                          color: '#666',
                          minWidth: 200,
                          padding: '12px 24px',
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          cursor: 'not-allowed',
                        }}
                      >
                        Proceso Completado
                      </Button>
                      <Typography
                        variant="body2"
                        sx={{
                          marginTop: 1,
                          color: '#4caf50',
                          fontWeight: 'bold',
                        }}
                      >
                        ✅ Ya has completado todo el registro. No necesitas
                        subir otra foto.
                      </Typography>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => {
                        // Si ya hay foto (persistida o recién cargada), intenta crear la solicitud directo
                        if (userHasPersistedPhoto || photoPreview) {
                          requestActivationIfPossible('manual');
                        } else {
                          setPhotoModalOpen(true);
                        }
                      }}
                      disabled={activationLoading}
                      startIcon={<PhotoCamera />}
                      sx={{
                        backgroundColor: '#4caf50',
                        '&:hover': { backgroundColor: '#388e3c' },
                        minWidth: 200,
                        padding: '12px 24px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {activationLoading ? 'Procesando...' : 'Activar Cuenta'}
                    </Button>
                  )}
                </Box>
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
              border: '2px solid #ff0f6e',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: '#ff0f6e',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              textAlign: 'center',
            }}
          >
            <PhotoCamera sx={{ color: '#ff0f6e' }} />
            Completa tu Registro
          </DialogTitle>

          <DialogContent>
            <Typography
              sx={{
                fontSize: '1rem',
                color: '#333',
                mb: 3,
                textAlign: 'center',
              }}
            >
              Para finalizar tu registro como promotora, necesitamos una foto
              tuya.
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
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    padding: 3,
                    border: '2px dashed #ff0f6e',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(233,30,99,0.05)',
                      borderColor: '#c10061',
                    },
                  }}
                >
                  {photoPreview ? (
                    <Avatar
                      src={photoPreview}
                      sx={{
                        width: 120,
                        height: 120,
                        border: '3px solid #ff0f6e',
                      }}
                    />
                  ) : (
                    <IconButton
                      component="span"
                      sx={{
                        backgroundColor: '#ffe6f2',
                        color: '#ff0f6e',
                        width: 80,
                        height: 80,
                        '&:hover': {
                          backgroundColor: '#ff0f6e',
                          color: 'white',
                        },
                      }}
                    >
                      <PhotoCamera sx={{ fontSize: 40 }} />
                    </IconButton>
                  )}
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: '#ff0f6e' }}
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
                borderColor: '#ff0f6e',
                color: '#ff0f6e',
                '&:hover': {
                  borderColor: '#c10061',
                  backgroundColor: 'rgba(233, 30, 99, 0.05)',
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePhotoUpload}
              variant="contained"
              disabled={!photoFile || uploadingPhoto}
              startIcon={
                uploadingPhoto ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Send />
                )
              }
              sx={{
                backgroundColor: '#ff0f6e',
                color: 'white',
                minWidth: 150,
                '&:hover': {
                  backgroundColor: '#c10061',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(233, 30, 99, 0.6)',
                },
              }}
            >
              {uploadingPhoto ? 'Subiendo...' : 'Subir Foto'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modales personalizados */}
        <Dialog
          open={showInfoModal}
          onClose={closeModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 2,
              backgroundColor: 'rgba(255, 240, 247, 0.95)',
              border: '2px solid #ff0f6e',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          <DialogTitle
            sx={{ color: '#ff0f6e', fontWeight: 'bold', textAlign: 'center' }}
          >
            {modalTitle}
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{ textAlign: 'center', fontSize: '1rem', color: '#333' }}
            >
              {modalMessage}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center' }}>
            <Button
              onClick={closeModal}
              variant="contained"
              sx={{
                backgroundColor: '#ff0f6e',
                '&:hover': { backgroundColor: '#c10061' },
              }}
            >
              Entendido
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showErrorModal}
          onClose={closeModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 2,
              backgroundColor: 'rgba(255, 235, 238, 0.95)',
              border: '2px solid #f44336',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          <DialogTitle
            sx={{ color: '#f44336', fontWeight: 'bold', textAlign: 'center' }}
          >
            {modalTitle}
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{ textAlign: 'center', fontSize: '1rem', color: '#333' }}
            >
              {modalMessage}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center' }}>
            <Button
              onClick={closeModal}
              variant="contained"
              sx={{
                backgroundColor: '#f44336',
                '&:hover': { backgroundColor: '#d32f2f' },
              }}
            >
              Entendido
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showSuccessModal}
          onClose={closeModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 2,
              backgroundColor: 'rgba(232, 245, 233, 0.95)',
              border: '2px solid #4caf50',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          <DialogTitle
            sx={{ color: '#4caf50', fontWeight: 'bold', textAlign: 'center' }}
          >
            {modalTitle}
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{ textAlign: 'center', fontSize: '1rem', color: '#333' }}
            >
              {modalMessage}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center' }}>
            <Button
              onClick={closeModal}
              variant="contained"
              sx={{
                backgroundColor: '#4caf50',
                '&:hover': { backgroundColor: '#388e3c' },
              }}
            >
              Continuar
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </div>
  );
}
