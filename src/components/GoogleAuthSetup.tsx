'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

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
import CredentialsDebugger from './CredentialsDebugger';

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
    const loadStoredCredentials = () => {
      const stored = localStorage.getItem('googleCredentials');
      if (stored) {
        try {
          const parsedCredentials = JSON.parse(stored);
          console.log(
            'DEBUG: Credenciales cargadas desde localStorage:',
            parsedCredentials
          );
          setCredentials(parsedCredentials);
          return parsedCredentials;
        } catch (error) {
          console.error('Error parsing stored credentials:', error);
          localStorage.removeItem('googleCredentials');
        }
      }
      return null;
    };

    // Cargar credenciales existentes
    const existingCredentials = loadStoredCredentials();

    // Verificar si hay tokens en la URL (callback de OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const tokensParam = urlParams.get('tokens');
    const errorParam = urlParams.get('error');

    console.log('DEBUG: tokensParam from URL:', tokensParam);
    console.log('DEBUG: errorParam from URL:', errorParam);

    if (errorParam) {
      console.error('Error en OAuth:', errorParam);
      // Aquí podrías mostrar un mensaje de error al usuario
    }

    if (tokensParam) {
      try {
        const tokens = JSON.parse(decodeURIComponent(tokensParam));
        console.log('DEBUG: Parsed tokens from URL:', tokens);

        // Guardar en localStorage
        localStorage.setItem('googleCredentials', JSON.stringify(tokens));
        setCredentials(tokens);

        // Enviar credenciales al backend
        sendCredentialsToBackend(tokens);

        // Limpiar la URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        console.log('DEBUG: Tokens saved to localStorage and URL cleaned.');
      } catch (error) {
        console.error('Error processing OAuth tokens in useEffect:', error);
      }
    } else if (existingCredentials) {
      // Si no hay tokens en la URL pero sí hay credenciales almacenadas,
      // verificar si necesitamos reenviarlas al backend
      console.log('DEBUG: No tokens in URL, but found existing credentials');

      // Opcional: verificar el estado en el backend
      checkBackendCredentialsStatus(existingCredentials);
    }
  }, []); // Array de dependencias vacío para ejecutar solo una vez

  // Función para verificar si el backend tiene las credenciales
  const checkBackendCredentialsStatus = async (
    credentialsToCheck?: GoogleCredentials
  ) => {
    try {
      const response = await fetch('/api/google-auth/status');
      const result = await response.json();

      const credsToUse = credentialsToCheck || credentials;

      if (!result.configured && credsToUse) {
        console.log('DEBUG: Backend no tiene credenciales, reenviando...');
        await sendCredentialsToBackend(credsToUse);
      }
    } catch (error) {
      console.error('Error checking backend credentials status:', error);
    }
  };

  // Función para enviar credenciales al backend
  const sendCredentialsToBackend = async (credentials: GoogleCredentials) => {
    try {
      console.log('📤 Enviando credenciales al backend...');

      const response = await fetch('/api/google-auth/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token,
          token_type: credentials.token_type,
          scope: credentials.scope,
          expiry_date: credentials.expiry_date,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Credenciales enviadas al backend correctamente');
        return true;
      } else {
        console.error(
          '❌ Error al enviar credenciales al backend:',
          result.message
        );
        return false;
      }
    } catch (error) {
      console.error(
        '❌ Error de red al enviar credenciales al backend:',
        error
      );
      return false;
    }
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    // Redirigir a la ruta de autenticación de Google
    window.location.href = '/api/auth/google';
  };

  const handleDisconnect = () => {
    localStorage.removeItem('googleCredentials');
    setCredentials(null);
  };

  const handleResendCredentials = async () => {
    if (credentials) {
      await sendCredentialsToBackend(credentials);
    }
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

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                  onClick={handleResendCredentials}
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
                  Enviar al Backend
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

      {/* Componente de debug para desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ mt: 4 }}>
          <CredentialsDebugger />
        </Box>
      )}
    </Box>
  );
}
