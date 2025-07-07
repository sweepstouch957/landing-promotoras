'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns';
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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

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

// Helper para cargar config admin del localStorage
function loadAdminScheduleConfig() {
  try {
    const raw = localStorage.getItem('scheduleConfig');
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Generar dailyTimes entre hora inicio y fin cada 1 hora
    const dailyTimes: string[] = [];
    const [startH] = parsed.startHour.split(':').map(Number);
    const [endH] = parsed.endHour.split(':').map(Number);

    let currentH = startH;
    while (currentH < endH) {
      const hStr = currentH.toString().padStart(2, '0');
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

  useEffect(() => {
    if (open) {
      // Cargar config admin y agendas guardadas
      const config = loadAdminScheduleConfig();
      setAdminScheduleConfig(config);

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
        end: addHours(date, 1),
        allDay: false,
        resource: m,
      } as MyEvent;
    });
  }, [meetings]);

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
    if (
      dateStr < adminScheduleConfig.startDate ||
      dateStr > adminScheduleConfig.endDate ||
      !adminScheduleConfig.allowedWeekDays.includes(dayOfWeek)
    ) {
      return;
    }

    // Filtrar horarios ya ocupados en esa fecha
    const meetingsOnDate = meetings.filter((m) => m.date === dateStr);
    const occupiedTimes = meetingsOnDate.map((m) => m.time);

    const freeTimes = adminScheduleConfig.dailyTimes.filter(
      (time) => !occupiedTimes.includes(time)
    );

    if (freeTimes.length === 0) {
      return;
    }

    setSelectedDate(clickedDate);
    setAvailableTimes(freeTimes);
    setSelectedTime('');
    setShowTimeDialog(true);
  };

  const handleConfirmSchedule = () => {
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

  const handleCloseTimeDialog = () => {
    setShowTimeDialog(false);
    setSelectedDate(null);
    setSelectedTime('');
  };

  // Determinar el rango de fechas para mostrar en el calendario
  const minDate = adminScheduleConfig
    ? new Date(adminScheduleConfig.startDate)
    : new Date();
  const maxDate = adminScheduleConfig
    ? new Date(adminScheduleConfig.endDate)
    : new Date();

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
            maxHeight: '90vh',
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
            Selecciona la fecha de tu cita
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            mt={1}
          >
            Haz clic en una fecha disponible para agendar tu reunión
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              '& .rbc-calendar': {
                backgroundColor: '#fff',
                fontFamily: 'Roboto, sans-serif',
              },
              '& .rbc-toolbar': {
                backgroundColor: '#f8f8f8',
                borderRadius: 2,
                padding: '12px',
                marginBottom: 2,
              },
              '& .rbc-toolbar-label': {
                fontWeight: 'bold',
                fontSize: '1.2rem',
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
              '& .rbc-month-view, & .rbc-time-view': {
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
                color: '#ED1F80',
              },
              '& .rbc-date-cell': {
                padding: '8px',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#fce4ec',
                },
              },
              '& .rbc-off-range-bg': {
                backgroundColor: '#f5f5f5',
              },
              '& .rbc-today': {
                backgroundColor: '#fce4ec',
              },
              '& .rbc-event': {
                borderRadius: '6px',
                padding: '2px 4px',
                fontSize: '0.75rem',
              },
            }}
          >
            <Calendar<MyEvent>
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: isMobile ? 400 : 500 }}
              selectable
              onSelectSlot={handleSelectSlot}
              views={['month']}
              popup
              min={minDate}
              max={maxDate}
              eventPropGetter={() => ({
                style: {
                  backgroundColor: '#ED1F80',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  opacity: 0.8,
                },
              })}
              dayPropGetter={(date) => {
                if (!adminScheduleConfig) return {};

                const dateStr = format(date, 'yyyy-MM-dd');
                const dayOfWeek = date.getDay();

                // Marcar días no disponibles
                if (
                  dateStr < adminScheduleConfig.startDate ||
                  dateStr > adminScheduleConfig.endDate ||
                  !adminScheduleConfig.allowedWeekDays.includes(dayOfWeek)
                ) {
                  return {
                    style: {
                      backgroundColor: '#f5f5f5',
                      color: '#ccc',
                      cursor: 'not-allowed',
                    },
                  };
                }

                return {};
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
              '&:hover': {
                borderColor: '#e50575',
                backgroundColor: 'rgba(237, 31, 128, 0.04)',
              },
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
        onClose={handleCloseTimeDialog}
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
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            mt={1}
          >
            {selectedDate && format(selectedDate, 'PPP', { locale: es })}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <TextField
            label="Hora disponible"
            select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            fullWidth
            sx={{
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
            onClick={handleCloseTimeDialog}
            sx={{
              color: '#ED1F80',
              borderColor: '#ED1F80',
              '&:hover': {
                borderColor: '#e50575',
                backgroundColor: 'rgba(237, 31, 128, 0.04)',
              },
            }}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmSchedule}
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
              '&:disabled': {
                backgroundColor: '#ccc',
              },
            }}
            variant="contained"
          >
            Confirmar cita
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
