'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Google, CheckCircle, Settings } from '@mui/icons-material';

interface GoogleCredentials {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export default function GoogleAuthSetup() {
  const [credentials, setCredentials] = useState<GoogleCredentials | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    console.log(
      'DEBUG (GoogleAuthSetup useEffect): Component mounted or re-rendered.'
    );

    // Cargar credenciales guardadas
    const stored = localStorage.getItem('googleCredentials');
    if (stored) {
      try {
        setCredentials(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing stored credentials:', error);
        localStorage.removeItem('googleCredentials');
      }
    }

    // Verificar si hay tokens en la URL (callback de OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const tokensParam = urlParams.get('tokens');

    console.log(
      'DEBUG (GoogleAuthSetup useEffect): tokensParam from URL:',
      tokensParam
    );

    if (tokensParam) {
      try {
        const tokens = JSON.parse(decodeURIComponent(tokensParam));
        console.log(
          'DEBUG (GoogleAuthSetup useEffect): Parsed tokens:',
          tokens
        );
        localStorage.setItem('googleCredentials', JSON.stringify(tokens));
        setCredentials(tokens);

        // Limpiar la URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        console.log(
          'DEBUG (GoogleAuthSetup useEffect): Tokens saved to localStorage and URL cleaned.'
        );
      } catch (error) {
        console.error('Error processing OAuth tokens in useEffect:', error);
      }
    }
  }, []); // <--- Vuelve a dejar el array de dependencias vacío

  const handleGoogleAuth = () => {
    setIsLoading(true);
    // Redirigir a la ruta de autenticación de Google
    window.location.href = '/api/auth/google';
  };

  const handleDisconnect = () => {
    localStorage.removeItem('googleCredentials');
    setCredentials(null);
  };

  const isTokenValid = (creds: GoogleCredentials): boolean => {
    return creds.expiry_date > Date.now();
  };

  const formatExpiryDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('es-ES');
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        color="#ED1F80"
        align="center"
        mb={3}
      >
        Configuración de Google Calendar
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          {!credentials ? (
            <Box sx={{ textAlign: 'center' }}>
              <Google sx={{ fontSize: 48, color: '#ED1F80', mb: 2 }} />
              <Typography variant="h6" mb={2}>
                Conectar con Google Calendar
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Para generar automáticamente enlaces de Google Meet y crear
                eventos en el calendario, necesitas autorizar el acceso a tu
                cuenta de Google.
              </Typography>

              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>Permisos requeridos:</strong>
                  <br />• Crear y gestionar eventos en Google Calendar
                  <br />• Generar enlaces de Google Meet
                  <br />• Enviar invitaciones por email
                </Typography>
              </Alert>

              <Button
                variant="contained"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                startIcon={<Google />}
                sx={{
                  backgroundColor: '#ED1F80',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '25px',
                  px: 4,
                  py: 1.5,
                  mr: 2,
                  '&:hover': {
                    backgroundColor: '#e50575',
                  },
                }}
              >
                {isLoading ? 'Conectando...' : 'Conectar con Google'}
              </Button>

              <Button
                variant="outlined"
                onClick={() => setShowInstructions(true)}
                startIcon={<Settings />}
                sx={{
                  color: '#ED1F80',
                  borderColor: '#ED1F80',
                  borderRadius: '25px',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: '#e50575',
                    backgroundColor: 'rgba(237, 31, 128, 0.04)',
                  },
                }}
              >
                Ver instrucciones
              </Button>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle sx={{ color: 'green', mr: 1 }} />
                <Typography variant="h6" color="green">
                  Google Calendar conectado
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Estado de la conexión:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={isTokenValid(credentials) ? 'Activo' : 'Expirado'}
                    color={isTokenValid(credentials) ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip label="Google Calendar" color="primary" size="small" />
                  <Chip label="Gmail" color="primary" size="small" />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Expira: {formatExpiryDate(credentials.expiry_date)}
                </Typography>
              </Box>

              {!isTokenValid(credentials) && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    El token de acceso ha expirado. Reconecta para continuar
                    usando las funciones de Google Calendar.
                  </Typography>
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleGoogleAuth}
                  startIcon={<Google />}
                  sx={{
                    backgroundColor: '#ED1F80',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '25px',
                    px: 3,
                    '&:hover': {
                      backgroundColor: '#e50575',
                    },
                  }}
                >
                  Reconectar
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleDisconnect}
                  sx={{
                    color: '#ED1F80',
                    borderColor: '#ED1F80',
                    borderRadius: '25px',
                    px: 3,
                    '&:hover': {
                      borderColor: '#e50575',
                      backgroundColor: 'rgba(237, 31, 128, 0.04)',
                    },
                  }}
                >
                  Desconectar
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog de instrucciones */}
      <Dialog
        open={showInstructions}
        onClose={() => setShowInstructions(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold" color="#ED1F80">
            Instrucciones de configuración
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" mb={2}>
            Para que la integración con Google Calendar funcione correctamente,
            sigue estos pasos:
          </Typography>

          <Box component="ol" sx={{ pl: 2 }}>
            <Box component="li" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Configurar variables de entorno:</strong> Asegúrate de
                que el archivo <code>.env.local</code>
                contenga las credenciales de Google OAuth correctas.
              </Typography>
            </Box>

            <Box component="li" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Habilitar APIs:</strong> En Google Cloud Console,
                habilita Google Calendar API y Gmail API.
              </Typography>
            </Box>

            <Box component="li" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Configurar OAuth:</strong> Configura la pantalla de
                consentimiento y agrega los alcances necesarios.
              </Typography>
            </Box>

            <Box component="li" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Autorizar aplicación:</strong> Haz clic en
                &quot;Conectar con Google&quot; y autoriza los permisos
                solicitados.
              </Typography>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Si encuentras problemas, verifica que todas las configuraciones en
              Google Cloud Console estén correctas y que las variables de
              entorno coincidan con las credenciales generadas.
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setShowInstructions(false)}
            sx={{
              backgroundColor: '#ED1F80',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '25px',
              px: 3,
              '&:hover': {
                backgroundColor: '#e50575',
              },
            }}
            variant="contained"
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
