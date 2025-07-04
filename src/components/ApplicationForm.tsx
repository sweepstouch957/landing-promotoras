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
  MenuItem,
  Modal,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTheme } from '@mui/material/styles';
import { formatPhone } from '@/app/utils/formatPhone';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useTranslation } from 'react-i18next';

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

// Helper para cargar config admin del localStorage
function loadAdminScheduleConfig() {
  try {
    const raw = localStorage.getItem('scheduleConfig'); // <- clave correcta
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Generar dailyTimes entre hora inicio y fin cada 1 hora o como prefieras
    const dailyTimes: string[] = [];
    const [startH] = parsed.startHour.split(":").map(Number);
    const [endH] = parsed.endHour.split(":").map(Number);

    let currentH = startH;
    while (currentH < endH) {
      const hStr = currentH.toString().padStart(2, "0");
      dailyTimes.push(`${hStr}:00`);
      currentH++;
    }

    return {
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      allowedWeekDays: parsed.selectedDays,
      dailyTimes,
    };
  } catch {
    return null;
  }
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

// Guardar agendas
function saveScheduledMeetings(meetings: ScheduleData[]) {
  localStorage.setItem("scheduledMeetings", JSON.stringify(meetings));
}

export default function ApplicationForm() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const formRef = useRef<HTMLDivElement>(null);

  // Estados
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [adminScheduleConfig, setAdminScheduleConfig] = useState<{
    startDate: string;
    endDate: string;
    allowedWeekDays: number[];
    dailyTimes: string[];
  } | null>(null);

  const [scheduledMeetings, setScheduledMeetings] = useState<ScheduleData[]>(
    []
  );

  // React hook form para formulario principal
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  // React hook form para modal de agendar reunión
  const {
    register: registerSchedule,
    handleSubmit: handleSubmitSchedule,
    formState: { errors: errorsSchedule },
    reset: resetSchedule,
    watch: watchSchedule,
  } = useForm<ScheduleData>();

  const selectedDate = watchSchedule('date');

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Cargar config admin y agendas guardadas
    const config = loadAdminScheduleConfig();
    setAdminScheduleConfig(config);

    const meetings = loadScheduledMeetings();
    setScheduledMeetings(meetings);
  }, []);

  // Cada vez que cambia la fecha en el modal, actualizamos horarios disponibles
  useEffect(() => {
    if (!selectedDate || !adminScheduleConfig) {
      setAvailableTimes([]);
      return;
    }

    // Validar que la fecha esté dentro del rango permitido y en día permitido
    const dateObj = new Date(selectedDate);
    const dayOfWeek = dateObj.getDay(); // 0-dom, 1-lun...
    const { startDate, endDate, allowedWeekDays, dailyTimes } =
      adminScheduleConfig;

    if (
      selectedDate < startDate ||
      selectedDate > endDate ||
      !allowedWeekDays.includes(dayOfWeek)
    ) {
      setAvailableTimes([]);
      return;
    }

    // Filtrar horarios ya ocupados en esa fecha
    const meetingsOnDate = scheduledMeetings.filter(
      (m) => m.date === selectedDate
    );
    const occupiedTimes = meetingsOnDate.map((m) => m.time);

    const freeTimes = dailyTimes.filter(
      (time) => !occupiedTimes.includes(time)
    );
    setAvailableTimes(freeTimes);
  }, [selectedDate, adminScheduleConfig, scheduledMeetings]);

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

      setShowScheduleModal(true);
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

  const onScheduleSubmit = (data: ScheduleData) => {
    // Guardar en estado y localStorage
    const newMeetings = [...scheduledMeetings, data];
    setScheduledMeetings(newMeetings);
    saveScheduledMeetings(newMeetings);

    setShowScheduleModal(false);

    MySwal.fire({
      title: '¡Reunión agendada!',
      text: `Has agendado para el ${data.date} a las ${data.time}`,
      icon: 'success',
      confirmButtonColor: '#ED1F80',
      confirmButtonText: 'OK',
    });

    reset();
    resetSchedule();
  };

  // Para el input date mínimo y máximo según config admin
  const minDate = adminScheduleConfig?.startDate || '';
  const maxDate = adminScheduleConfig?.endDate || '';

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

      <Modal
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      >
        <Box
          component="form"
          onSubmit={handleSubmitSchedule(onScheduleSubmit)}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            p: 4,
            borderRadius: 2,
            width: '90%',
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            color="#ED1F80"
            align="center"
          >
            Agenda tu reunión
          </Typography>

          <TextField
            label="Fecha"
            type="date"
            {...registerSchedule('date', {
              required: 'Selecciona una fecha',
              validate: (value) => {
                if (!adminScheduleConfig) return 'Configuración no disponible';
                if (value < adminScheduleConfig.startDate)
                  return `Fecha no puede ser antes de ${adminScheduleConfig.startDate}`;
                if (value > adminScheduleConfig.endDate)
                  return `Fecha no puede ser después de ${adminScheduleConfig.endDate}`;
                const day = new Date(value).getDay();
                if (!adminScheduleConfig.allowedWeekDays.includes(day))
                  return 'Día no permitido para agendar';
                return true;
              },
            })}
            error={!!errorsSchedule.date}
            helperText={errorsSchedule.date?.message}
            InputLabelProps={{ shrink: true }}
            fullWidth
            inputProps={{
              min: minDate,
              max: maxDate,
            }}
          />

          <TextField
            label="Hora"
            select
            {...registerSchedule('time', { required: 'Selecciona una hora' })}
            error={!!errorsSchedule.time}
            helperText={errorsSchedule.time?.message}
            fullWidth
            disabled={!selectedDate || availableTimes.length === 0}
          >
            {availableTimes.length > 0 ? (
              availableTimes.map((time) => (
                <MenuItem key={time} value={time}>
                  {time}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No hay horarios disponibles</MenuItem>
            )}
          </TextField>

          <Button
            type="submit"
            variant="contained"
            disabled={availableTimes.length === 0}
            sx={{
              backgroundColor: '#ED1F80',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '25px',
              py: 1,
              '&:hover': {
                backgroundColor: '#e50575',
              },
            }}
          >
            Confirmar reunión
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
