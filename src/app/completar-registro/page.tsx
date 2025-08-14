"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Box, 
  CircularProgress, 
  Container,
  Typography, 
  Button, 
  Card,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
} from '@mui/material';

import { Lock, ArrowBack, PhotoCamera, Send, CheckCircle } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/theme';

const theme = createTheme({
  palette: {
    primary: { main: '#e91e63', dark: '#c2185b', light: '#f8bbd9' },
    secondary: { main: '#ad1457', dark: '#880e4f', light: '#f48fb1' },
  },
});

export default function CompletarRegistroPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [userFound, setUserFound] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Modal de foto
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setError('No se proporcionó un token válido en el enlace.');
          setIsLoading(false);
          return;
        }

        // Verificar si el usuario existe en la API usando el token
        const response = await fetch(`https://backend-promotoras.onrender.com/api/users/token/${encodeURIComponent(token)}`);
        
        if (response.ok) {
          const user = await response.json();
          setUserData(user);
          setUserFound(true);
          
          // Guardar datos del usuario en localStorage
          localStorage.setItem('userData', JSON.stringify(user));
          localStorage.setItem('userToken', token);
          
          // Verificar el estado del usuario
          if (user.videoWatched && user.photoUrl) {
            // Usuario ya completó todo
            alert("¡Felicidades! Ya has completado todo el proceso de registro. Te redirigiremos a la página principal.");
            window.location.href = '/';
            return;
          } else if (user.videoWatched && !user.photoUrl) {
            // Usuario vio el video pero no subió foto
            setPhotoModalOpen(true);
          } else {
            // Usuario no ha visto el video
            alert(`¡Hola ${user.nombre}! Necesitas completar el entrenamiento. Te redirigiremos al video.`);
            window.location.href = '/training';
            return;
          }
        } else if (response.status === 404) {
          setError('No se encontró un usuario registrado con este token.');
        } else {
          setError('Error al verificar el usuario. Por favor, intenta más tarde.');
        }
      } catch (error) {
        console.error('Error verificando usuario:', error);
        setError('Error de conexión. Por favor, intenta más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [searchParams]);

  // Handlers de foto
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
    if (!photoFile || !userData) return;

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

        // Obtener el token del localStorage
        const token = localStorage.getItem('userToken');
        
        if (token) {
          // Actualizar foto en la API usando el token
          try {
            await fetch(`https://backend-promotoras.onrender.com/api/users/token/${encodeURIComponent(token)}/photo`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ photoUrl: result.url }),
            });
          } catch (error) {
            console.error("Error actualizando foto en la API:", error);
          }
        }

        // Actualizar localStorage
        const updatedUser = { ...userData, photoUrl: result.url };
        localStorage.setItem("userData", JSON.stringify(updatedUser));

        setPhotoModalOpen(false);
        alert("¡Foto subida exitosamente! Tu registro está completo. Te redirigiremos a la página principal.");
        
        // Redirigir a la página principal después de completar todo
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
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

  const handleGoToHome = () => (window.location.href = "/");

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ minHeight: '100vh', background: '#e4dbd8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
          <Container maxWidth="md">
            <Card sx={{ 
              textAlign: 'center', 
              padding: 4, 
              background: 'rgba(255,255,255,0.95)', 
              backdropFilter: 'blur(10px)',
              border: '2px solid #e91e63'
            }}>
              <CircularProgress sx={{ color: '#e91e63', marginBottom: 2 }} size={60} />
              <Typography variant="h5" sx={{ color: '#e91e63', fontWeight: 600 }}>
                Verificando tu información...
              </Typography>
            </Card>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ minHeight: '100vh', background: '#e4dbd8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
          <Container maxWidth="md">
            <Card sx={{ 
              textAlign: 'center', 
              padding: 4, 
              background: 'rgba(255,255,255,0.95)', 
              backdropFilter: 'blur(10px)',
              border: '2px solid #e91e63'
            }}>
              <Lock sx={{ fontSize: 80, color: 'error.main', marginBottom: 2 }} />
              <Typography variant="h3" gutterBottom sx={{ 
                fontWeight: 700, 
                color: 'error.main', 
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: 3
              }}>
                Error de Acceso
              </Typography>
              
              <Alert severity="error" sx={{ 
                marginBottom: 3, 
                borderRadius: '15px',
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 1 }}>
                  {error}
                </Typography>
                <Typography variant="body1">
                  Por favor, verifica que el enlace sea correcto o contacta al soporte.
                </Typography>
              </Alert>

              <Button 
                variant="contained" 
                size="large"
                onClick={handleGoToHome} 
                startIcon={<ArrowBack />}
                sx={{
                  minWidth: 250,
                  background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
                  boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #c2185b 0%, #ad1457 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(233,30,99,0.4)',
                  }
                }}
              >
                Ir a Inicio
              </Button>
            </Card>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', background: '#e4dbd8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
        <Container maxWidth="md">
          <Card sx={{ 
            textAlign: 'center', 
            padding: 4, 
            background: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            border: '2px solid #e91e63'
          }}>
            <CheckCircle sx={{ fontSize: 80, color: 'primary.main', marginBottom: 2 }} />
            <Typography variant="h3" gutterBottom sx={{ 
              fontWeight: 700, 
              color: 'primary.main', 
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: 3
            }}>
              ¡Hola {userData?.nombre}!
            </Typography>
            
            <Alert severity="success" sx={{ 
              marginBottom: 3, 
              borderRadius: '15px',
              '& .MuiAlert-icon': { color: '#e91e63' }
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 1 }}>
                ¡Te encontramos en nuestro sistema!
              </Typography>
              <Typography variant="body1">
                Solo necesitas subir tu foto para completar el registro.
              </Typography>
            </Alert>
          </Card>
        </Container>
      </Box>

      {/* Modal de subida de foto */}
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
              id="photo-upload-completar"
              type="file"
              onChange={handlePhotoChange}
            />
            <label htmlFor="photo-upload-completar">
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
  );
}

