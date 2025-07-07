'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTheme } from '@mui/material/styles';
import { formatPhone } from '@/app/utils/formatPhone';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useTranslation } from 'react-i18next';
import CalendarScheduler from './CalendarScheduler';

const MySwal = withReactContent(Swal);

interface FormData {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  edad: number;
  zip: string;
  supermercado: string;
  acepta: boolean;
}

interface ScheduleData {
  date: string; // yyyy-MM-dd
  time: string; // HH:mm (24h)
  nombre?: string;
  apellido?: string;
  telefono?: string;
  correo?: string;
  meetLink?: string; // Nuevo campo para el enlace de Google Meet
  eventId?: string; // ID del evento en Google Calendar
  htmlLink?: string; // Enlace directo al evento en Google Calendar
}

const inputStyles = {
  '& label.Mui-focused': {
    color: '#ED1F80',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#ccc',
    },
    '&:hover fieldset': {
      borderColor: '#ED1F80',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#ED1F80',
    },
  },
};

// Guardar agendas
function saveScheduledMeetings(meetings: ScheduleData[]) {
  localStorage.setItem("scheduledMeetings", JSON.stringify(meetings));
}

// Helper para cargar agendas agendadas
function loadScheduledMeetings() {
  try {
    const raw = localStorage.getItem("scheduledMeetings");
    if (!raw) return [];
    return JSON.parse(raw) as ScheduleData[];
  } catch {
    return [];
  }
}

export default function ApplicationForm() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const formRef = useRef<HTMLDivElement>(null);

  // Estados
  const [showCalendarScheduler, setShowCalendarScheduler] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);

  // React hook form para formulario principal
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await fetch('https://sheetdb.io/api/v1/5rnrmuhqeq1h4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      await MySwal.fire({
        title: t('form_success_title'),
        text: t('form_success_text'),
        icon: 'success',
        confirmButtonColor: '#ED1F80',
        confirmButtonText: t('form_button_ok'),
        customClass: {
          popup: 'rounded-xl',
          title: 'font-bold text-lg',
          confirmButton: 'px-4 py-2',
        },
      });

      // Guardar los datos del formulario y mostrar el calendario
      setCurrentFormData(data);
      setShowCalendarScheduler(true);
    } catch (err) {
      console.error(err);
      await MySwal.fire({
        title: t('form_error_title'),
        text: t('form_error_text'),
        icon: 'error',
        confirmButtonColor: '#ED1F80',
        confirmButtonText: t('form_button_ok'),
        customClass: {
          popup: 'rounded-xl',
          title: 'font-bold text-lg',
          confirmButton: 'px-4 py-2',
        },
      });
    }
  };

  const handleScheduleConfirm = async (scheduleData: ScheduleData) => {
    try {
      // Verificar si hay credenciales de Google guardadas
      const storedCredentials = localStorage.getItem('googleCredentials');
      if (!storedCredentials) {
        await MySwal.fire({
          title: 'Configuración requerida',
          text: 'Es necesario configurar la integración con Google Calendar. Por favor, contacta al administrador.',
          icon: 'warning',
          confirmButtonColor: '#ED1F80',
          confirmButtonText: 'OK',
        });
        return;
      }

      const credentials = JSON.parse(storedCredentials);

      // Crear la cita completa con Google Calendar y envío de emails
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Datos del formulario
          nombre: currentFormData?.nombre,
          apellido: currentFormData?.apellido,
          telefono: currentFormData?.telefono,
          correo: currentFormData?.correo,
          edad: currentFormData?.edad,
          zip: currentFormData?.zip,
          supermercado: currentFormData?.supermercado,
          // Datos de la cita
          date: scheduleData.date,
          time: scheduleData.time,
          // Credenciales de Google
          credentials,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Actualizar los datos de la cita con la información completa
        const completeScheduleData: ScheduleData = {
          ...scheduleData,
          meetLink: result.data.meeting.meetLink,
          eventId: result.data.meeting.eventId,
          htmlLink: result.data.meeting.htmlLink,
        };

        // Cargar citas existentes y agregar la nueva
        const existingMeetings = loadScheduledMeetings();
        const newMeetings = [...existingMeetings, completeScheduleData];
        saveScheduledMeetings(newMeetings);

        await MySwal.fire({
          title: '¡Reunión agendada exitosamente!',
          html: `
            <div style="text-align: left;">
              <p><strong>Fecha:</strong> ${scheduleData.date}</p>
              <p><strong>Hora:</strong> ${scheduleData.time}</p>
              <p><strong>Google Meet:</strong> <a href="${result.data.meeting.meetLink}" target="_blank">Enlace de reunión</a></p>
              <br>
              <p style="color: #666; font-size: 14px;">
                ✅ Evento creado en Google Calendar<br>
                ✅ Invitación enviada por email<br>
                ✅ Enlace de Google Meet generado
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#ED1F80',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'rounded-xl',
            title: 'font-bold text-lg',
            confirmButton: 'px-4 py-2',
          },
        });
      } else {
        throw new Error(result.error || 'Error al crear la cita');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      
      // Fallback: guardar la cita localmente sin Google Calendar
      const existingMeetings = loadScheduledMeetings();
      const newMeetings = [...existingMeetings, scheduleData];
      saveScheduledMeetings(newMeetings);

      await MySwal.fire({
        title: 'Cita agendada (modo local)',
        html: `
          <div style="text-align: left;">
            <p>Tu cita ha sido guardada localmente:</p>
            <p><strong>Fecha:</strong> ${scheduleData.date}</p>
            <p><strong>Hora:</strong> ${scheduleData.time}</p>
            <br>
            <p style="color: #ff9800; font-size: 14px;">
              ⚠️ No se pudo crear el evento en Google Calendar.<br>
              Por favor, contacta al administrador para completar la configuración.
            </p>
          </div>
        `,
        icon: 'warning',
        confirmButtonColor: '#ED1F80',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'rounded-xl',
          title: 'font-bold text-lg',
          confirmButton: 'px-4 py-2',
        },
      });
    }

    // Limpiar formulario
    reset();
    setCurrentFormData(null);
  };

  const handleCloseCalendar = () => {
    setShowCalendarScheduler(false);
    setCurrentFormData(null);
  };

  return (
    <Box ref={formRef}>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          width: '100%',
          maxWidth: 420,
          mx: 'auto',
          p: isMobile ? 2 : 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography
          variant="h6"
          align="center"
          fontWeight="bold"
          color="#ED1F80"
          textTransform="uppercase"
          sx={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {t('form_title')}
        </Typography>

        <TextField
          label={t('form_nombre')}
          {...register('nombre', {
            required: t('form_error_nombre'),
            pattern: {
              value: /^[A-Za-zÁ-ú\s]+$/,
              message: t('form_error_solo_letras'),
            },
          })}
          error={!!errors.nombre}
          helperText={errors.nombre?.message}
          fullWidth
          sx={inputStyles}
        />

        <TextField
          label={t('form_apellido')}
          {...register('apellido', {
            required: t('form_error_apellido'),
            pattern: {
              value: /^[A-Za-zÁ-ú\s]+$/,
              message: t('form_error_solo_letras'),
            },
          })}
          error={!!errors.apellido}
          helperText={errors.apellido?.message}
          fullWidth
          sx={inputStyles}
        />

        <TextField
          label={t('form_telefono')}
          {...register('telefono', {
            required: t('form_error_telefono'),
            pattern: {
              value: /^\(\d{3}\) \d{3}-\d{4}$/,
              message: t('form_error_telefono_invalido'),
            },
            onChange: (e) => {
              const formatted = formatPhone(e.target.value);
              setValue('telefono', formatted);
            },
          })}
          error={!!errors.telefono}
          helperText={errors.telefono?.message}
          fullWidth
          sx={inputStyles}
        />

        <TextField
          label={t('form_correo')}
          type="email"
          {...register('correo', {
            required: t('form_error_correo'),
            pattern: {
              value: /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/,
              message: t('form_error_correo_invalido'),
            },
          })}
          error={!!errors.correo}
          helperText={errors.correo?.message}
          fullWidth
          sx={inputStyles}
        />

        <TextField
          label={t('form_edad')}
          type="number"
          inputProps={{ min: 18 }}
          {...register('edad', {
            required: t('form_error_edad'),
            min: { value: 18, message: t('form_error_edad_minima') },
          })}
          error={!!errors.edad}
          helperText={errors.edad?.message}
          fullWidth
          sx={inputStyles}
        />

        <TextField
          label={t('form_zip')}
          {...register('zip', { required: t('form_error_zip') })}
          error={!!errors.zip}
          helperText={errors.zip?.message}
          fullWidth
          sx={inputStyles}
        />

        <TextField
          label={t('form_supermercado')}
          {...register('supermercado', {
            required: t('form_error_supermercado'),
          })}
          error={!!errors.supermercado}
          helperText={errors.supermercado?.message}
          fullWidth
          sx={inputStyles}
        />

        <FormControlLabel
          control={
            <Checkbox
              {...register('acepta', { required: true })}
              color="primary"
              sx={{
                color: '#ED1F80',
                '&.Mui-checked': {
                  color: '#ED1F80',
                },
              }}
            />
          }
          label={t('form_acepta')}
        />
        {errors.acepta && (
          <Typography variant="caption" color="error">
            {t('form_error_acepta')}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 1,
            backgroundColor: '#ED1F80',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '25px',
            py: 1.5,
            fontSize: '1rem',
            '&:hover': {
              backgroundColor: '#e50575',
            },
          }}
        >
          {t('form_enviar')}
        </Button>
      </Box>

      {/* Calendario Scheduler */}
      {currentFormData && (
        <CalendarScheduler
          open={showCalendarScheduler}
          onClose={handleCloseCalendar}
          onSchedule={handleScheduleConfirm}
          formData={currentFormData}
        />
      )}
    </Box>
  );
}

