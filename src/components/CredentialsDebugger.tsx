'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore, Refresh, BugReport } from '@mui/icons-material';

interface GoogleCredentials {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export default function CredentialsDebugger() {
  const [localStorageCredentials, setLocalStorageCredentials] =
    useState<GoogleCredentials | null>(null);
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadLocalStorageCredentials = () => {
    const stored = localStorage.getItem('googleCredentials');
    if (stored) {
      try {
        setLocalStorageCredentials(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing localStorage credentials:', error);
        setLocalStorageCredentials(null);
      }
    } else {
      setLocalStorageCredentials(null);
    }
  };

  const checkBackendStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/google-auth/status');
      const result = await response.json();
      setBackendStatus(result);
    } catch (error) {
      console.error('Error checking backend status:', error);
      setBackendStatus({ error: '' });
    } finally {
      setIsLoading(false);
    }
  };

  const sendCredentialsToBackend = async () => {
    if (!localStorageCredentials) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/google-auth/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(localStorageCredentials),
      });

      const result = await response.json();
      console.log('Send credentials result:', result);

      // Refresh backend status after sending
      await checkBackendStatus();
    } catch (error) {
      console.error('Error sending credentials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('googleCredentials');
    setLocalStorageCredentials(null);
  };

  useEffect(() => {
    loadLocalStorageCredentials();
    checkBackendStatus();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-ES');
  };

  const isExpired = (timestamp: number) => {
    return timestamp <= Date.now();
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        color="#ff0f6e"
        align="center"
        mb={3}
      >
        <BugReport sx={{ mr: 1 }} />
        Debug de Credenciales de Google
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          onClick={loadLocalStorageCredentials}
          startIcon={<Refresh />}
          disabled={isLoading}
        >
          Recargar localStorage
        </Button>
        <Button
          variant="outlined"
          onClick={checkBackendStatus}
          startIcon={<Refresh />}
          disabled={isLoading}
        >
          Verificar Backend
        </Button>
        {localStorageCredentials && (
          <Button
            variant="contained"
            onClick={sendCredentialsToBackend}
            disabled={isLoading}
            sx={{ backgroundColor: '#ff0f6e' }}
          >
            Enviar al Backend
          </Button>
        )}
        <Button variant="outlined" color="error" onClick={clearLocalStorage}>
          Limpiar localStorage
        </Button>
      </Box>

      {/* Estado del localStorage */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">
            localStorage -{' '}
            {localStorageCredentials ? '✅ Configurado' : '❌ No configurado'}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {localStorageCredentials ? (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Scope:</strong> {localStorageCredentials.scope}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Token Type:</strong>{' '}
                {localStorageCredentials.token_type}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Expira:</strong>{' '}
                {formatDate(localStorageCredentials.expiry_date)}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Estado:</strong>{' '}
                {isExpired(localStorageCredentials.expiry_date)
                  ? '🔴 Expirado'
                  : '🟢 Válido'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Access Token:</strong>{' '}
                {localStorageCredentials.access_token.substring(0, 20)}...
              </Typography>
              <Typography variant="body2">
                <strong>Refresh Token:</strong>{' '}
                {localStorageCredentials.refresh_token.substring(0, 20)}...
              </Typography>
            </Box>
          ) : (
            <Alert severity="warning">
              No hay credenciales en localStorage. Necesitas autenticarte con
              Google.
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Estado del Backend */}
      <Accordion defaultExpanded sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">
            Backend -{' '}
            {backendStatus?.configured ? '✅ Configurado' : '❌ No configurado'}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {backendStatus ? (
            backendStatus.error ? (
              <Alert severity="error">
                Error al conectar con el backend: {backendStatus.error}
              </Alert>
            ) : backendStatus.configured ? (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Scope:</strong> {backendStatus.data?.scope}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Expira:</strong>{' '}
                  {formatDate(backendStatus.data?.expiry_date)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Estado:</strong>{' '}
                  {backendStatus.data?.is_expired ? '🔴 Expirado' : '🟢 Válido'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Último uso:</strong>{' '}
                  {new Date(backendStatus.data?.last_used).toLocaleString(
                    'es-ES'
                  )}
                </Typography>
                <Typography variant="body2">
                  <strong>Creado:</strong>{' '}
                  {new Date(backendStatus.data?.created_at).toLocaleString(
                    'es-ES'
                  )}
                </Typography>
              </Box>
            ) : (
              <Alert severity="warning">
                El backend no tiene credenciales configuradas.
              </Alert>
            )
          ) : (
            <Alert severity="info">Cargando estado del backend...</Alert>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Diagnóstico */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Diagnóstico
          </Typography>

          {!localStorageCredentials && !backendStatus?.configured && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <strong>Problema:</strong> No hay credenciales en ningún lado.
              <br />
              <strong>Solución:</strong> Haz clic en &quot;Conectar con
              Google&quot; en la página principal.
            </Alert>
          )}

          {localStorageCredentials && !backendStatus?.configured && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Problema:</strong> Tienes credenciales en localStorage
              pero el backend no las tiene.
              <br />
              <strong>Solución:</strong> Haz clic en &quot;Enviar al
              Backend&quot; arriba.
            </Alert>
          )}

          {!localStorageCredentials && backendStatus?.configured && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Estado:</strong> El backend tiene credenciales pero
              localStorage no.
              <br />
              <strong>Nota:</strong> Esto es normal si limpiaste el navegador.
              El backend puede seguir funcionando.
            </Alert>
          )}

          {localStorageCredentials && backendStatus?.configured && (
            <Alert severity="success">
              <strong>¡Perfecto!</strong> Tanto localStorage como el backend
              tienen credenciales configuradas.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
