'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  Grid,
  CircularProgress,
  Card,
  Divider,
  IconButton,
} from '@mui/material';
import { PhotoCamera, Send, CheckCircle, ArrowBack } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#e91e63', dark: '#c2185b', light: '#f8bbd9' },
    secondary: { main: '#ad1457', dark: '#880e4f', light: '#f48fb1' },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': { borderColor: '#e91e63' },
            '&.Mui-focused fieldset': { borderColor: '#e91e63', borderWidth: '2px' },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#e91e63' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '25px',
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.5px',
          padding: '12px 30px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(233, 30, 99, 0.15)',
        },
      },
    },
  },
});

interface FormData {
  password: string;
  confirmPassword: string;
  foto: File | null;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  foto?: string;
  general?: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: '',
    foto: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.foto) {
      newErrors.foto = 'La foto es requerida';
    } else {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(formData.foto.type)) {
        newErrors.foto = 'Solo se permiten archivos JPG, JPEG o PNG';
      } else if (formData.foto.size > 5 * 1024 * 1024) {
        newErrors.foto = 'La foto no puede ser mayor a 5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, foto: file }));
      const reader = new FileReader();
      reader.onload = e => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      if (errors.foto) setErrors(prev => ({ ...prev, foto: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('password', formData.password);
      if (formData.foto) payload.append('foto', formData.foto);

      const response = await fetch('https://api.ejemplo.com/registro', {
        method: 'POST',
        body: payload,
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      setErrors(prev => ({ ...prev, general: 'Hubo un problema al enviar tu registro. Intenta de nuevo.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => window.location.href = '/training';

  if (isSubmitted) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ minHeight: '100vh', background: '#e4dbd8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
          <Container maxWidth="md">
            <Card sx={{ textAlign: 'center', padding: 4, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
              <CheckCircle sx={{ fontSize: 80, color: 'primary.main', marginBottom: 2 }} />
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                ¡Registro Completado!
              </Typography>
              <Button variant="outlined" onClick={handleGoBack} startIcon={<ArrowBack />} sx={{ marginTop: 2 }}>
                Volver al Training
              </Button>
            </Card>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', background: '#e4dbd8', padding: 2 }}>
        <Container maxWidth="sm">
          <Box sx={{ paddingY: 4 }}>
            <Paper sx={{ padding: 4, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
              <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 700, color: 'primary.main', marginBottom: 3 }}>
                Completa tu Información
              </Typography>
              <Divider sx={{ marginBottom: 4, backgroundColor: 'primary.light' }} />

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Contraseña"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      error={!!errors.password}
                      helperText={errors.password}
                      sx={{ marginBottom: 2 }}
                    />
                  </Grid>
{/* @ts-expect-error: MUI Grid typing conflict workaround */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirmar Contraseña"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      sx={{ marginBottom: 2 }}
                    />
                  </Grid>
{/* @ts-expect-error: MUI Grid typing conflict workaround */}
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center' }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="photo-upload"
                        type="file"
                        onChange={handlePhotoChange}
                      />
                      <label htmlFor="photo-upload">
                        <Box sx={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                          padding: 3, border: `2px dashed ${errors.foto ? '#f44336' : '#e91e63'}`,
                          borderRadius: 2, cursor: 'pointer', transition: 'all 0.3s ease',
                          '&:hover': { backgroundColor: 'rgba(233,30,99,0.05)', borderColor: '#c2185b' }
                        }}>
                          {photoPreview ? (
                            <Avatar src={photoPreview} sx={{ width: 80, height: 80, border: '3px solid', borderColor: 'primary.main' }} />
                          ) : (
                            <IconButton component="span" sx={{ backgroundColor: 'primary.light', color: 'primary.main', '&:hover': { backgroundColor: 'primary.main', color: 'white' } }}>
                              <PhotoCamera />
                            </IconButton>
                          )}
                          <Typography variant="body2" color={errors.foto ? 'error' : 'primary'} sx={{ fontWeight: 600 }}>
                            {photoPreview ? 'Cambiar Foto' : 'Subir Foto'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            JPG, JPEG o PNG (máx. 5MB)
                          </Typography>
                        </Box>
                      </label>
                      {errors.foto && <Typography variant="caption" color="error" sx={{ display: 'block', marginTop: 1 }}>{errors.foto}</Typography>}
                    </Box>
                  </Grid>
{/* @ts-expect-error: MUI Grid typing conflict workaround */}
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', marginTop: 3 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                        sx={{
                          minWidth: 200,
                          background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
                          boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #c2185b 0%, #ad1457 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(233,30,99,0.4)',
                          },
                          '&:disabled': { background: 'rgba(233,30,99,0.6)' },
                        }}
                      >
                        {isSubmitting ? 'Enviando...' : 'Enviar Registro'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>

              <Box sx={{ marginTop: 3, textAlign: 'center' }}>
                <Button variant="outlined" onClick={handleGoBack} startIcon={<ArrowBack />} sx={{ marginTop: 2 }}>
                  Volver al Training
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
