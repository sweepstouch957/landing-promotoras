'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import CalendarScheduler from './CalendarScheduler';

const MySwal = withReactContent(Swal);

interface SimpleFormData {
  correo: string;
  idioma: string;
}

interface ScheduleData {
  date: string; // yyyy-MM-dd
  time: string; // HH:mm (24h)
  correo?: string;
  meetLink?: string;
  eventId?: string;
  htmlLink?: string;
}

const idiomas = [
  { value: 'Español', label: 'Español' },
  { value: 'Inglés', label: 'Inglés' },
  { value: 'Francés', label: 'Francés' },
  { value: 'Portugués', label: 'Portugués' },
  { value: 'Italiano', label: 'Italiano' },
];

const inputStyles = {
  '& label.Mui-focused': {
    color: '#ff0f6e',
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: '#ff0f6e',
    },
  },
};

const SimpleSchedulingForm: React.FC = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prefilledEmail, setPrefilledEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SimpleFormData>({
    defaultValues: {
      correo: '',
      idioma: 'Español',
    },
  });

  // Obtener email de la URL si viene como parámetro
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setPrefilledEmail(emailParam);
      setValue('correo', emailParam);
    }
  }, [setValue]);

  const onSubmit = (data: SimpleFormData) => {
    // Validar que el email existe en la base de datos
    setShowCalendar(true);
  };

  const handleSchedule = async (scheduleData: ScheduleData) => {
    setIsSubmitting(true);

    try {
      const formData = watch();

      // Calcular tiempos de inicio y fin
      const startTime = scheduleData.time;
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const endHour = startHour + 1; // Duración de 1 hora
      const endTime = `${endHour.toString().padStart(2, '0')}:${startMinute
        .toString()
        .padStart(2, '0')}`;

      // Crear evento en Google Calendar
      const calendarResponse = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Cita - Programa Promotoras`,
          description: `Cita agendada para el programa de promotoras.\nCorreo: ${formData.correo}\nIdioma: ${formData.idioma}`,
          startDateTime: `${scheduleData.date}T${startTime}:00`,
          endDateTime: `${scheduleData.date}T${endTime}:00`,
          attendeeEmail: formData.correo,
          attendeeName: `Usuario ${formData.correo}`,
          credentials: {
            access_token: localStorage.getItem('google_access_token'),
            refresh_token: localStorage.getItem('google_refresh_token'),
            token_type: 'Bearer',
            expires_in: 3600,
          },
        }),
      });

      if (!calendarResponse.ok) {
        // Intentar obtener mensaje de error de la respuesta JSON
        const errorBody = await calendarResponse.json().catch(() => null);
        console.error('Error response from /api/meetings/create:', errorBody);
        throw new Error(
          `Error al crear el evento en Google Calendar: ${
            errorBody?.error?.message ||
            calendarResponse.statusText ||
            'Error desconocido'
          }`
        );
      }

      const calendarResult = await calendarResponse.json();

      // Actualizar usuario en la base de datos
      const updateResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        }/api/users/update-by-email`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            correo: formData.correo,
            fechaCita: scheduleData.date,
            horaCita: scheduleData.time,
            meetLink: calendarResult.meetLink,
            idioma: formData.idioma,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorBody = await updateResponse.json().catch(() => null);
        console.error(
          'Error response from /api/users/update-by-email:',
          errorBody
        );
        throw new Error(
          `Error al actualizar la información del usuario: ${
            errorBody?.message ||
            updateResponse.statusText ||
            'Error desconocido'
          }`
        );
      }

      // Enviar email de confirmación
      const emailResponse = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formData.correo,
          subject: 'Confirmación de cita - Programa de Promotoras',
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ff0f6e;">¡Cita confirmada!</h2>
            <p>Tu cita ha sido agendada exitosamente:</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Fecha:</strong> ${new Date(
                scheduleData.date
              ).toLocaleDateString('es-ES')}</p>
              <p><strong>Hora:</strong> ${scheduleData.time}</p>
              <p><strong>Idioma:</strong> ${formData.idioma}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${calendarResult.meetLink}" 
                 style="background-color: #ff0f6e; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Unirse a la reunión
              </a>
            </div>
            <p>También puedes acceder al evento directamente en tu calendario:</p>
            <p><a href="${
              calendarResult.htmlLink
            }" style="color: #ff0f6e;">Ver en Google Calendar</a></p>
            <p>¡Nos vemos pronto!</p>
          </div>
        `,
        }),
      });

      if (!emailResponse.ok) {
        const errorBody = await emailResponse.json().catch(() => null);
        console.error('Error response from /api/emails/send:', errorBody);
        throw new Error(
          `Error al enviar el email de confirmación: ${
            errorBody?.message ||
            emailResponse.statusText ||
            'Error desconocido'
          }`
        );
      }

      MySwal.fire({
        title: '¡Cita agendada exitosamente!',
        text: 'Recibirás un email de confirmación con los detalles de tu cita.',
        icon: 'success',
        confirmButtonColor: '#ff0f6e',
      }).then(() => {
        window.location.href = '/';
      });
    } catch (error) {
      console.error('Error al agendar cita:', error);
      MySwal.fire({
        title: 'Error',
        text:
          error instanceof Error ? error.message : 'Error al agendar la cita',
        icon: 'error',
        confirmButtonColor: '#ff0f6e',
      });
    } finally {
      setIsSubmitting(false);
      setShowCalendar(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: '#ff0f6e', textAlign: 'center' }}
      >
        Agendar tu Cita
      </Typography>

      <Typography
        variant="body1"
        sx={{ mb: 4, textAlign: 'center', color: '#666' }}
      >
        Completa la información para agendar tu cita para el programa de
        promotoras
      </Typography>

      <Paper elevation={3} sx={{ p: 4 }}>
        {prefilledEmail && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Email detectado automáticamente: {prefilledEmail}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            label="Correo Electrónico"
            type="email"
            margin="normal"
            sx={inputStyles}
            {...register('correo', {
              required: 'El correo electrónico es obligatorio',
              pattern: {
                value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                message: 'Por favor ingrese un correo electrónico válido',
              },
            })}
            error={!!errors.correo}
            helperText={errors.correo?.message}
            disabled={!!prefilledEmail}
          />

          <TextField
            fullWidth
            select
            label="Idioma de preferencia"
            margin="normal"
            sx={inputStyles}
            {...register('idioma', {
              required: 'Selecciona un idioma',
            })}
            error={!!errors.idioma}
            helperText={errors.idioma?.message}
          >
            {idiomas.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{
                backgroundColor: '#ff0f6e',
                '&:hover': { backgroundColor: '#c91a6b' },
                minWidth: 200,
                py: 1.5,
              }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Procesando...
                </>
              ) : (
                'Continuar al Calendario'
              )}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Calendar Scheduler Dialog */}
      <CalendarScheduler
        open={showCalendar}
        onClose={() => setShowCalendar(false)}
        onSchedule={handleSchedule}
        formData={{
          nombre: '',
          apellido: '',
          telefono: '',
          correo: watch('correo'),
          edad: 0,
          zip: '',
          supermercado: '',
          acepta: true,
        }}
      />
    </Box>
  );
};

export default SimpleSchedulingForm;
