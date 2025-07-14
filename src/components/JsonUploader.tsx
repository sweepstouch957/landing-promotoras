'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { CloudUpload, Email, Send } from '@mui/icons-material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface JsonUser {
  email: string;
  nombre?: string;
  apellido?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const JsonUploader: React.FC = () => {
  const [jsonData, setJsonData] = useState<JsonUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      MySwal.fire({
        title: 'Error',
        text: 'Por favor selecciona un archivo JSON válido',
        icon: 'error',
        confirmButtonColor: '#ED1F80',
      });
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);

        // Verificar si es un array
        if (!Array.isArray(parsedData)) {
          throw new Error('El archivo JSON debe contener un array de usuarios');
        }

        // Extraer emails únicos
        const extractedEmails: string[] = [];
        const validUsers: JsonUser[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parsedData.forEach((item: any, index: number) => {
          if (item.email && typeof item.email === 'string') {
            const email = item.email.toLowerCase().trim();
            if (email.includes('@') && !extractedEmails.includes(email)) {
              extractedEmails.push(email);
              validUsers.push({
                email,
                nombre: item.nombre || '',
                apellido: item.apellido || '',
                ...item,
              });
            }
          }
        });

        if (extractedEmails.length === 0) {
          throw new Error('No se encontraron emails válidos en el archivo');
        }

        setJsonData(validUsers);
        setEmails(extractedEmails);

        MySwal.fire({
          title: 'Archivo cargado exitosamente',
          text: `Se encontraron ${extractedEmails.length} emails únicos`,
          icon: 'success',
          confirmButtonColor: '#ED1F80',
        });
      } catch (error) {
        console.error('Error parsing JSON:', error);
        MySwal.fire({
          title: 'Error',
          text:
            error instanceof Error
              ? error.message
              : 'Error al procesar el archivo JSON',
          icon: 'error',
          confirmButtonColor: '#ED1F80',
        });
      }
    };

    reader.readAsText(file);
  };

  const sendEmailsToUsers = async () => {
    if (emails.length === 0) {
      MySwal.fire({
        title: 'Error',
        text: 'No hay emails para enviar',
        icon: 'error',
        confirmButtonColor: '#ED1F80',
      });
      return;
    }

    const result = await MySwal.fire({
      title: '¿Enviar enlaces de agendamiento?',
      text: `Se enviará un enlace de agendamiento a ${emails.length} usuarios. ¿Continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ED1F80',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);

    try {
      // Crear el enlace al formulario de invitación
      const baseUrl = window.location.origin;
      const schedulingLink = `${baseUrl}/invitacion`;

      // Enviar emails uno por uno
      let successCount = 0;
      let errorCount = 0;

      for (const email of emails) {
        try {
          const user = jsonData.find((u) => u.email === email);
          const userName = user ? `${user.nombre} ${user.apellido}`.trim() : '';

          const response = await fetch('/api/emails/send-simple', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: email,
              subject: 'Agenda tu cita - Programa de Promotoras',
              html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">

    <div style="background-color: #ED1F80; padding: 20px 0; text-align: center;">
      <img src="https://jobs.sweepstouch.com/logo-sweepstouch.png" alt="sweepsTOUCH logo" style="max-height: 40px;" />
      Sweepstouch
    </div>

    <div style="padding: 30px 20px;">
      <h2 style="margin-top: 0; color: #000">Hi ${userName || 'there'},</h2>
      <p>Thank you for applying to the <strong>Sweepstouch Brand Promoter Program.</strong></p>
      <p>We're excited to move forward with you in the process!</p>

      <p>In this next step, you'll join a <strong>video call</strong> where we'll share:</p>
      <ul>
        <li>🏦 How the program works</li>
        <li>💸 The benefits and income opportunities available</li>
        <li>❓ And you'll have time to ask any questions you may have</li>
      </ul>

      <p>This is the perfect opportunity to see if the program fits your goals and to get all the details before making a decision.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${schedulingLink}?email=${encodeURIComponent(email)}" 
          style="background-color: #ED1F80; color: white; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-size: 16px;">
          Schedule a Video Call
        </a>
      </div>

      <p>The session will be held online and is the best way for us to get to know each other and for you to understand the full scope of the program.</p>
      <p>If you have any questions before your appointment, feel free to reply to this email.</p>

      <p style="margin-top: 40px;"><strong>See you soon!</strong></p>
    </div>

    <div style="background-color: #ED1F80; padding: 20px; text-align: center;">
      <p style="color: white; margin: 0 0 10px 0;">CONNECT WITH US!</p>
      <p style="margin: 0;">
        <a href="#" style="margin: 0 10px; color: white; text-decoration: none; font-size: 20px;">Instagram</a>
        <a href="#" style="margin: 0 10px; color: white; text-decoration: none; font-size: 20px;">Facebook</a>
        <a href="#" style="margin: 0 10px; color: white; text-decoration: none; font-size: 20px;">Twitter</a>
      </p>
    </div>

    <div style="text-align: center; font-size: 12px; color: #888; padding: 10px 0;">
      <p>This email was sent to ${email}</p>
    </div>
  </div>
`,
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error(
              `Error enviando email a ${email}:`,
              await response.text()
            );
          }
        } catch (error) {
          errorCount++;
          console.error(`Error enviando email a ${email}:`, error);
        }
      }

      MySwal.fire({
        title: 'Envío completado',
        text: `Emails enviados exitosamente: ${successCount}\nErrores: ${errorCount}`,
        icon: successCount > 0 ? 'success' : 'error',
        confirmButtonColor: '#ED1F80',
      });
    } catch (error) {
      console.error('Error enviando emails:', error);
      MySwal.fire({
        title: 'Error',
        text: 'Error al enviar los emails',
        icon: 'error',
        confirmButtonColor: '#ED1F80',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: '#ED1F80', textAlign: 'center' }}
      >
        Importar Usuarios desde JSON
      </Typography>

      <Typography
        variant="body1"
        sx={{ mb: 3, textAlign: 'center', color: '#666' }}
      >
        Carga un archivo JSON con usuarios existentes para enviarles enlaces de
        agendamiento
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <input
            accept=".json"
            style={{ display: 'none' }}
            id="json-file-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="json-file-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUpload />}
              sx={{
                backgroundColor: '#ED1F80',
                '&:hover': { backgroundColor: '#c91a6b' },
                mb: 2,
              }}
            >
              Seleccionar archivo JSON
            </Button>
          </label>

          {fileName && (
            <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
              Archivo seleccionado: {fileName}
            </Typography>
          )}
        </Box>

        {emails.length > 0 && (
          <>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Se encontraron {emails.length} emails únicos en el archivo
              </Typography>
            </Alert>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                Emails encontrados:
              </Typography>

              <Box
                sx={{
                  maxHeight: 300,
                  overflow: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                {emails.map((email, index) => (
                  <Chip
                    key={index}
                    label={email}
                    variant="outlined"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Send />
                  )
                }
                onClick={sendEmailsToUsers}
                disabled={isLoading}
                sx={{
                  backgroundColor: '#ED1F80',
                  '&:hover': { backgroundColor: '#c91a6b' },
                  minWidth: 200,
                }}
              >
                {isLoading ? 'Enviando...' : 'Enviar enlaces de agendamiento'}
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {jsonData.length > 0 && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Vista previa de datos (primeros 5 usuarios):
          </Typography>
          <List>
            {jsonData.slice(0, 5).map((user, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={`${user.nombre || 'Sin nombre'} ${
                    user.apellido || 'Sin apellido'
                  }`}
                  secondary={user.email}
                />
              </ListItem>
            ))}
          </List>
          {jsonData.length > 5 && (
            <Typography
              variant="body2"
              sx={{ color: '#666', textAlign: 'center', mt: 2 }}
            >
              ... y {jsonData.length - 5} usuarios más
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default JsonUploader;
