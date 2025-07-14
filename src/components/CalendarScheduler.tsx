'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Box,
  Typography,
  useMediaQuery,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Warning, Schedule } from '@mui/icons-material';

interface ScheduleData {
  date: string; // formato YYYY-MM-DD
  time: string; // formato HH:mm
  nombre?: string;
  apellido?: string;
  telefono?: string;
  correo?: string;
}

interface FormData {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  edad: number;
  zip: string;
  supermercado: string;
  idioma?: string;
  acepta: boolean;
}

type MyEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: ScheduleData;
};

interface CalendarSchedulerProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (scheduleData: ScheduleData) => void;
  formData: FormData;
}

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Helper para generar horarios de media hora
function generateHalfHourSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

// Helper para cargar config admin del backend
async function loadAdminScheduleConfig() {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      }/api/schedule-config`
    );
    if (!response.ok) {
      throw new Error('Error al obtener configuración de horarios');
    }

    const configs = await response.json();

    // Buscar la configuración activa
    const activeConfig = configs.find((config: any) => config.isActive);

    if (!activeConfig) {
      // Fallback a configuración por defecto con intervalos de media hora
      return {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 30 días
        allowedWeekDays: [1, 2, 3, 4, 5], // Lunes a Viernes
        dailyTimes: generateHalfHourSlots(9, 17), // 9:00 AM a 5:00 PM con intervalos de 30 min
      };
    }

    return {
      startDate: activeConfig.startDate.split('T')[0],
      endDate: activeConfig.endDate.split('T')[0],
      allowedWeekDays: activeConfig.allowedWeekDays,
      dailyTimes: activeConfig.dailyTimeSlots || generateHalfHourSlots(9, 17),
    };
  } catch (error) {
    console.error('Error loading schedule config:', error);
    // Fallback a configuración por defecto con intervalos de media hora
    return {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0], // 30 días
      allowedWeekDays: [1, 2, 3, 4, 5], // Lunes a Viernes
      dailyTimes: generateHalfHourSlots(9, 17), // 9:00 AM a 5:00 PM con intervalos de 30 min
    };
  }
}

// Helper para cargar agendas agendadas
function loadScheduledMeetings() {
  try {
    const raw = localStorage.getItem('scheduledMeetings');
    if (!raw) return [];
    return JSON.parse(raw) as ScheduleData[];
  } catch {
    return [];
  }
}

export default function CalendarScheduler({
  open,
  onClose,
  onSchedule,
  formData,
}: CalendarSchedulerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [meetings, setMeetings] = useState<ScheduleData[]>([]);
  const [adminScheduleConfig, setAdminScheduleConfig] = useState<{
    startDate: string;
    endDate: string;
    allowedWeekDays: number[];
    dailyTimes: string[];
  } | null>(null);

  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Estados para el modal de días bloqueados
  const [showBlockedDayDialog, setShowBlockedDayDialog] = useState(false);

  useEffect(() => {
    if (open) {
      // Cargar config admin y agendas guardadas
      const loadConfig = async () => {
        const config = await loadAdminScheduleConfig();
        setAdminScheduleConfig(config);
      };

      loadConfig();

      const storedMeetings = loadScheduledMeetings();
      setMeetings(storedMeetings);
    }
  }, [open]);

  // Crear eventos para el calendario basados en las citas existentes
  const events = useMemo(() => {
    return meetings.map((m) => {
      const [year, month, day] = m.date.split('-').map(Number);
      const [hour, minute] = m.time.split(':').map(Number);
      const date = new Date(year, month - 1, day, hour, minute);
      return {
        title: `${m.time} - Ocupado`,
        start: date,
        end: addMinutes(date, 30), // Cambiar a 30 minutos en lugar de 1 hora
        allDay: false,
        resource: m,
      } as MyEvent;
    });
  }, [meetings]);

  // Función para verificar si un día está bloqueado
  const isDayBlocked = (date: Date): boolean => {
    if (!adminScheduleConfig) return true;

    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();

    return (
      dateStr < adminScheduleConfig.startDate ||
      dateStr > adminScheduleConfig.endDate ||
      !adminScheduleConfig.allowedWeekDays.includes(dayOfWeek)
    );
  };

  // Manejar selección de fecha en el calendario
  const handleSelectSlot = (slotInfo: {
    start: Date;
    end: Date;
    action: string;
  }) => {
    if (!adminScheduleConfig) return;

    const clickedDate = slotInfo.start;
    const dateStr = format(clickedDate, 'yyyy-MM-dd');
    const dayOfWeek = clickedDate.getDay();

    // Validar que la fecha esté dentro del rango permitido y en día permitido
    if (isDayBlocked(clickedDate)) {
      setShowBlockedDayDialog(true);
      return;
    }

    // Filtrar horarios ya ocupados en esa fecha
    const meetingsOnDate = meetings.filter((m) => m.date === dateStr);
    const occupiedTimes = meetingsOnDate.map((m) => m.time);

    const freeTimes = adminScheduleConfig.dailyTimes.filter(
      (time) => !occupiedTimes.includes(time)
    );

    if (freeTimes.length === 0) {
      setShowBlockedDayDialog(true);
      return;
    }

    setSelectedDate(clickedDate);
    setAvailableTimes(freeTimes);
    setSelectedTime('');
    setShowTimeDialog(true);
  };

  const handleTimeConfirm = () => {
    if (!selectedDate || !selectedTime) return;

    const scheduleData: ScheduleData = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      nombre: formData.nombre,
      apellido: formData.apellido,
      telefono: formData.telefono,
      correo: formData.correo,
    };

    onSchedule(scheduleData);
    setShowTimeDialog(false);
    onClose();
  };

  const handleTimeDialogClose = () => {
    setShowTimeDialog(false);
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleBlockedDayDialogClose = () => {
    setShowBlockedDayDialog(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: '80vh',
          },
        }}
      >
        <DialogTitle>
          <Typography
            variant="h5"
            fontWeight="bold"
            color="#ED1F80"
            align="center"
          >
            Selecciona fecha y hora para tu cita
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 1 }}
          >
            Haz clic en una fecha disponible para ver los horarios
          </Typography>
        </DialogTitle>

        <DialogContent>
          {adminScheduleConfig && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Horarios disponibles: {adminScheduleConfig.dailyTimes[0]} -{' '}
              {
                adminScheduleConfig.dailyTimes[
                  adminScheduleConfig.dailyTimes.length - 1
                ]
              }
              (intervalos de 30 minutos)
            </Alert>
          )}

          <Box
            sx={{
              '& .rbc-calendar': {
                backgroundColor: '#fff',
                minHeight: '500px',
              },
              '& .rbc-toolbar': {
                backgroundColor: '#f8f8f8',
                borderRadius: 2,
                padding: '8px',
                marginBottom: 2,
              },
              '& .rbc-toolbar-label': {
                fontWeight: 'bold',
                fontSize: '1.1rem',
                color: '#ED1F80',
              },
              '& .rbc-btn-group button': {
                backgroundColor: '#ED1F80',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                margin: '0 2px',
                padding: '6px 12px',
                '&:hover': {
                  backgroundColor: '#e50575',
                },
                '&.rbc-active': {
                  backgroundColor: '#c1045a',
                },
              },
              '& .rbc-month-view, & .rbc-time-view, & .rbc-agenda-view': {
                border: 'none',
              },
              '& .rbc-day-bg + .rbc-day-bg': {
                borderLeft: '1px solid #e0e0e0',
              },
              '& .rbc-header': {
                backgroundColor: '#fafafa',
                fontWeight: '600',
                fontSize: '0.9rem',
                borderBottom: '1px solid #e0e0e0',
              },
              '& .rbc-date-cell': {
                padding: '4px',
              },
              '& .rbc-event': {
                borderRadius: '6px',
                padding: '2px 4px',
                cursor: 'pointer',
              },
            }}
          >
            <Calendar<MyEvent>
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              selectable
              onSelectSlot={handleSelectSlot}
              views={['week', 'month']} // Agregar vista semanal
              defaultView="week" // Vista por defecto semanal
              popup
              step={30} // Intervalos de 30 minutos
              timeslots={2} // 2 slots por hora (30 min cada uno)
              eventPropGetter={() => ({
                style: {
                  backgroundColor: '#ED1F80',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  padding: '2px 6px',
                  fontSize: '0.8rem',
                },
              })}
              dayPropGetter={(date) => {
                const isBlocked = isDayBlocked(date);
                return {
                  style: {
                    backgroundColor: isBlocked ? '#424242' : 'transparent', // Color más oscuro
                    opacity: isBlocked ? 0.4 : 1, // Opacidad más baja
                    cursor: isBlocked ? 'not-allowed' : 'pointer',
                    color: isBlocked ? '#ffffff' : 'inherit',
                  },
                };
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={onClose}
            sx={{
              color: '#ED1F80',
              borderColor: '#ED1F80',
              borderRadius: '25px',
              px: 3,
            }}
            variant="outlined"
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para seleccionar hora */}
      <Dialog
        open={showTimeDialog}
        onClose={handleTimeDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle>
          <Typography
            variant="h6"
            fontWeight="bold"
            color="#ED1F80"
            align="center"
          >
            Selecciona la hora
          </Typography>
          {selectedDate && (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 1 }}
            >
              {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: es })}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent>
          <TextField
            select
            label="Hora disponible"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            fullWidth
            sx={{
              '& label.Mui-focused': {
                color: '#ED1F80',
              },
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#ED1F80',
                },
              },
            }}
          >
            {availableTimes.map((time) => (
              <MenuItem key={time} value={time}>
                {time}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleTimeDialogClose}
            sx={{
              color: '#ED1F80',
              borderColor: '#ED1F80',
              borderRadius: '25px',
              px: 3,
            }}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleTimeConfirm}
            disabled={!selectedTime}
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
            Confirmar cita
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal elegante para días bloqueados */}
      <Dialog
        open={showBlockedDayDialog}
        onClose={handleBlockedDayDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            textAlign: 'center',
          },
        }}
      >
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Warning
              sx={{
                fontSize: 60,
                color: '#ff9800',
                mb: 1,
              }}
            />
            <Typography
              variant="h5"
              fontWeight="bold"
              color="#ff9800"
              gutterBottom
            >
              Horarios no disponibles
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ maxWidth: 400 }}
            >
              La fecha seleccionada no está disponible para agendar citas. Por
              favor, inténtalo la próxima semana o selecciona una fecha
              diferente.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <Schedule sx={{ color: '#ED1F80' }} />
              <Typography variant="body2" color="text.secondary">
                Horarios disponibles: Lunes a Viernes
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button
            onClick={handleBlockedDayDialogClose}
            sx={{
              backgroundColor: '#ED1F80',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '25px',
              px: 4,
              py: 1,
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
    </>
  );
}
