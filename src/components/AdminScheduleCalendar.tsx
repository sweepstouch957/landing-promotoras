'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Box,
  Typography,
  useMediaQuery,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Snackbar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Person,
  Email,
  Phone,
  Schedule,
  VideoCall,
  OpenInNew,
  Refresh,
  Delete,
  Warning,
} from '@mui/icons-material';

interface User {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  edad?: number;
  ciudad?: string;
  fechaCita?: string;
  horaCita?: string;
  enlaceMeet?: string;
  eventId?: string;
  htmlLink?: string;
  esImportado: boolean;
  idioma?: string;
}

interface ScheduleData {
  date: string; // formato YYYY-MM-DD
  time: string; // formato HH:mm
  nombre?: string;
  apellido?: string;
  telefono?: string;
  correo?: string;
  meetLink?: string; // Nuevo campo para el enlace de Google Meet
  eventId?: string; // ID del evento en Google Calendar
  htmlLink?: string; // Enlace directo al evento en Google Calendar
  esImportado?: boolean;
  idioma?: string;
  userId?: string;
}

type MyEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: ScheduleData[];
};

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Función para normalizar fechas a formato YYYY-MM-DD
const normalizeDateFormat = (dateString: string): string => {
  if (!dateString) return '';

  // Si ya está en formato YYYY-MM-DD, devolverlo tal como está
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }

  // Si está en formato ISO 8601 (2025-07-11T00:00:00.000Z), extraer solo la fecha
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }

  // Si está en formato DD/MM/YYYY, convertir a YYYY-MM-DD
  if (dateString.includes('/')) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Si está en formato DD-MM-YYYY, convertir a YYYY-MM-DD
  if (dateString.includes('-') && dateString.length === 10) {
    const parts = dateString.split('-');
    if (parts[0].length === 2) {
      // DD-MM-YYYY
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  // Intentar parsear como Date y convertir
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
  }

  return '';
};

export default function AdminScheduleCalendar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [meetings, setMeetings] = useState<ScheduleData[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<ScheduleData[]>(
    []
  );
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] =
    useState<ScheduleData | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchUsersWithAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar la nueva API de appointments
      const response = await fetch(
        'https://backend-promotoras.onrender.com/api/appointments'
      );
      const result = await response.json();

      if (result.success) {
        console.log('Citas obtenidas de la nueva API:', result.data);

        // Convertir datos de la nueva API al formato esperado
        const appointmentsFromAPI: ScheduleData[] = [];

        Object.entries(result.data).forEach(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ([date, dayData]: [string, any]) => {
            if (dayData.slots && Array.isArray(dayData.slots)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              dayData.slots.forEach((slot: any) => {
                if (slot.usuarios && Array.isArray(slot.usuarios)) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  slot.usuarios.forEach((user: any) => {
                    appointmentsFromAPI.push({
                      date: date,
                      time: slot.horaInicio,
                      nombre: user.nombre,
                      apellido: user.apellido,
                      correo: user.email,
                      telefono: user.telefono,
                      meetLink: slot.enlaceMeet,
                      esImportado: false,
                      idioma: user.idioma || 'Español',
                      userId: user._id,
                    });
                  });
                }
              });
            }
          }
        );

        console.log('Citas procesadas de la nueva API:', appointmentsFromAPI);

        // Obtener citas del localStorage (para mantener compatibilidad)
        const localStorageMeetings = localStorage.getItem('scheduledMeetings');
        const localMeetings: ScheduleData[] = localStorageMeetings
          ? JSON.parse(localStorageMeetings)
              .map((meeting: ScheduleData) => ({
                ...meeting,
                date: normalizeDateFormat(meeting.date),
              }))
              .filter((meeting: ScheduleData) => meeting.date !== '')
          : [];

        console.log('Citas del localStorage (normalizadas):', localMeetings);

        // Combinar ambas fuentes, dando prioridad a la nueva API
        const allMeetings = [...appointmentsFromAPI, ...localMeetings];

        // Eliminar duplicados basándose en fecha, hora y correo
        const uniqueMeetings = allMeetings.filter(
          (meeting, index, self) =>
            index ===
            self.findIndex(
              (m) =>
                m.date === meeting.date &&
                m.time === meeting.time &&
                m.correo === meeting.correo
            )
        );

        console.log('Citas únicas finales:', uniqueMeetings);
        setMeetings(uniqueMeetings);
      } else {
        setError('Error al cargar las citas desde la API');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Error de conexión con el servidor');

      // Fallback a localStorage si hay error de conexión
      const localStorageMeetings = localStorage.getItem('scheduledMeetings');
      if (localStorageMeetings) {
        const normalizedLocalMeetings = JSON.parse(localStorageMeetings)
          .map((meeting: ScheduleData) => ({
            ...meeting,
            date: normalizeDateFormat(meeting.date),
          }))
          .filter((meeting: ScheduleData) => meeting.date !== '');
        setMeetings(normalizedLocalMeetings);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersWithAppointments();
  }, []);

  // Agrupar citas por fecha y crear eventos que muestren solo el número
  const events = useMemo(() => {
    console.log('Generando eventos para el calendario con meetings:', meetings);

    // Agrupar citas por fecha
    const groupedByDate = meetings.reduce((acc, meeting) => {
      const dateKey = meeting.date;
      console.log('Procesando meeting para fecha:', dateKey, meeting);

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(meeting);
      return acc;
    }, {} as Record<string, ScheduleData[]>);

    console.log('Citas agrupadas por fecha:', groupedByDate);

    // Crear eventos que muestren solo el número de citas
    const calendarEvents = Object.entries(groupedByDate)
      .map(([date, dayMeetings]) => {
        console.log(
          'Creando evento para fecha:',
          date,
          'con',
          dayMeetings.length,
          'citas'
        );

        // Validar formato de fecha YYYY-MM-DD
        if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          console.error('Formato de fecha inválido:', date);
          return null;
        }

        const [year, month, day] = date.split('-').map(Number);

        // Validar que los números sean válidos
        if (
          isNaN(year) ||
          isNaN(month) ||
          isNaN(day) ||
          month < 1 ||
          month > 12 ||
          day < 1 ||
          day > 31
        ) {
          console.error('Fecha con valores inválidos:', { year, month, day });
          return null;
        }

        const eventDate = new Date(year, month - 1, day);

        // Verificar que la fecha sea válida
        if (isNaN(eventDate.getTime())) {
          console.error('Fecha inválida creada:', eventDate, 'desde:', date);
          return null;
        }

        console.log(
          'Fecha del evento creada:',
          eventDate,
          'para fecha original:',
          date
        );

        const event = {
          title: `${dayMeetings.length}`, // Solo mostrar el número
          start: eventDate,
          end: eventDate,
          allDay: true,
          resource: dayMeetings, // Guardar todas las citas del día
        } as MyEvent;

        console.log('Evento creado:', event);
        return event;
      })
      .filter((event) => event !== null) as MyEvent[];

    console.log('Eventos finales para el calendario:', calendarEvents);
    return calendarEvents;
  }, [meetings]);

  const handleSelectSlot = (slotInfo: {
    start: Date;
    end: Date;
    action: string;
  }) => {
    const clickedDate = format(slotInfo.start, 'yyyy-MM-dd');
    console.log('Fecha clickeada:', clickedDate);

    const dayEvents = meetings.filter((m) => m.date === clickedDate);

    console.log('Eventos encontrados para la fecha:', dayEvents);
    setSelectedDateEvents(dayEvents);
    setSelectedDate(clickedDate);
  };

  const handleSelectEvent = (event: MyEvent) => {
    console.log('Evento seleccionado:', event);
    if (event.resource && Array.isArray(event.resource)) {
      const clickedDate = format(event.start, 'yyyy-MM-dd');
      setSelectedDateEvents(event.resource);
      setSelectedDate(clickedDate);
    }
  };

  const handleCloseDetails = () => {
    setShowDetailsDialog(false);
    setSelectedAppointment(null);
  };

  const handleRefresh = () => {
    fetchUsersWithAppointments();
  };

  const handleDeleteAppointment = (appointment: ScheduleData) => {
    setAppointmentToDelete(appointment);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    try {
      // Si la cita tiene userId, eliminar de la base de datos
      if (appointmentToDelete.userId) {
        const response = await fetch(
          `https://backend-promotoras.onrender.com/api/users/${appointmentToDelete.userId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error('Error al eliminar la cita de la base de datos');
        }
      } else {
        // Si no tiene userId, eliminar del localStorage
        const localStorageMeetings = localStorage.getItem('scheduledMeetings');
        if (localStorageMeetings) {
          const meetings = JSON.parse(localStorageMeetings) as ScheduleData[];
          const updatedMeetings = meetings.filter(
            (m) =>
              !(
                m.date === appointmentToDelete.date &&
                m.time === appointmentToDelete.time &&
                m.correo === appointmentToDelete.correo
              )
          );
          localStorage.setItem(
            'scheduledMeetings',
            JSON.stringify(updatedMeetings)
          );
        }
      }

      // Actualizar la lista local
      setMeetings((prev) =>
        prev.filter(
          (m) =>
            !(
              m.date === appointmentToDelete.date &&
              m.time === appointmentToDelete.time &&
              m.correo === appointmentToDelete.correo
            )
        )
      );

      // Actualizar eventos seleccionados si es necesario
      setSelectedDateEvents((prev) =>
        prev.filter(
          (m) =>
            !(
              m.date === appointmentToDelete.date &&
              m.time === appointmentToDelete.time &&
              m.correo === appointmentToDelete.correo
            )
        )
      );

      setSnackbarMessage('Cita eliminada exitosamente');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setSnackbarMessage('Error al eliminar la cita');
      setSnackbarOpen(true);
    } finally {
      setShowDeleteConfirm(false);
      setAppointmentToDelete(null);
      setShowDetailsDialog(false);
    }
  };

  const cancelDeleteAppointment = () => {
    setShowDeleteConfirm(false);
    setAppointmentToDelete(null);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress color="primary" />
        <Typography sx={{ ml: 2 }}>Cargando citas...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: 'auto',
        mt: 4,
        p: isMobile ? 2 : 4,
        bgcolor: '#ffffff',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        marginBottom: '80px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="#ff0f6e">
          Calendario de Citas
        </Typography>
        <Button
          variant="outlined"
          onClick={handleRefresh}
          startIcon={<Refresh />}
          sx={{
            color: '#ff0f6e',
            borderColor: '#ff0f6e',
            '&:hover': {
              borderColor: '#e50575',
              backgroundColor: 'rgba(237, 31, 128, 0.04)',
            },
          }}
        >
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button onClick={handleRefresh} sx={{ ml: 2 }}>
            Reintentar
          </Button>
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Total de citas programadas: {meetings.length}
        {meetings.filter((m) => m.esImportado).length > 0 && (
          <>
            {' '}
            • Usuarios importados:{' '}
            {meetings.filter((m) => m.esImportado).length}
          </>
        )}
      </Typography>

      {/* Debug info - remover en producción */}
      {process.env.NODE_ENV === 'development' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Debug: {meetings.length} citas cargadas, {events.length} eventos
          generados
        </Alert>
      )}

      <Box
        sx={{
          '& .rbc-calendar': {
            backgroundColor: '#fff',
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
            color: '#ff0f6e',
          },
          '& .rbc-btn-group button': {
            backgroundColor: '#ff0f6e',
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
          },
          '& .rbc-date-cell': {
            padding: '4px',
          },
          '& .rbc-event': {
            borderRadius: '50%',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1rem',
            minWidth: '30px',
            minHeight: '30px',
            margin: '2px auto',
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
          onSelectEvent={handleSelectEvent}
          views={['month']}
          popup
          eventPropGetter={(event) => {
            const hasImportedUsers = event.resource?.some((m) => m.esImportado);
            return {
              style: {
                backgroundColor: hasImportedUsers ? '#2196F3' : '#ff0f6e',
                color: 'white',
                borderRadius: '50%',
                border: 'none',
                padding: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                minWidth: '30px',
                minHeight: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            };
          }}
        />
      </Box>

      {selectedDateEvents.length > 0 && selectedDate && (
        <Card sx={{ mt: 3, borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight="bold"
              mb={2}
              color="#ff0f6e"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Schedule />
              Citas para el{' '}
              {format(new Date(selectedDate + 'T12:00:00'), 'PPP', {
                locale: es,
              })}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {selectedDateEvents.map((appointment, index) => (
                <Card
                  key={index}
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#fce4ec',
                      borderColor: '#ff0f6e',
                    },
                  }}
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setShowDetailsDialog(true);
                  }}
                >
                  <CardContent sx={{ py: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {appointment.nombre && appointment.apellido
                            ? `${appointment.nombre} ${appointment.apellido}`
                            : 'Cita agendada'}
                        </Typography>
                        {appointment.correo && (
                          <Typography variant="body2" color="text.secondary">
                            {appointment.correo}
                          </Typography>
                        )}
                        {appointment.idioma && (
                          <Typography variant="caption" color="text.secondary">
                            Idioma: {appointment.idioma}
                          </Typography>
                        )}
                      </Box>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {appointment.esImportado && (
                          <Chip
                            label="Importado"
                            size="small"
                            sx={{
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              fontWeight: 'bold',
                            }}
                          />
                        )}
                        {appointment.meetLink && (
                          <Chip
                            icon={<VideoCall />}
                            label="Meet"
                            size="small"
                            sx={{
                              backgroundColor: '#e8f5e8',
                              color: '#2e7d32',
                              fontWeight: 'bold',
                            }}
                          />
                        )}
                        <Chip
                          label={appointment.time}
                          sx={{
                            backgroundColor: '#ff0f6e',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAppointment(appointment);
                          }}
                          sx={{
                            color: '#f44336',
                            '&:hover': {
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            },
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Dialog de detalles de la cita */}
      <Dialog
        open={showDetailsDialog}
        onClose={handleCloseDetails}
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
            color="#ff0f6e"
            align="center"
          >
            Detalles de la Cita
          </Typography>
        </DialogTitle>

        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Fecha y hora */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Schedule sx={{ color: '#ff0f6e' }} />
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {format(
                      new Date(selectedAppointment.date + 'T12:00:00'),
                      'PPP',
                      { locale: es }
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAppointment.time}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Información del cliente */}
              {selectedAppointment.nombre && selectedAppointment.apellido && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Person sx={{ color: '#ff0f6e' }} />
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedAppointment.nombre}{' '}
                      {selectedAppointment.apellido}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nombre completo
                      {selectedAppointment.esImportado && (
                        <Chip
                          label="Usuario Importado"
                          size="small"
                          color="info"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  </Box>
                </Box>
              )}

              {selectedAppointment.correo && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Email sx={{ color: '#ff0f6e' }} />
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedAppointment.correo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Correo electrónico
                    </Typography>
                  </Box>
                </Box>
              )}

              {selectedAppointment.telefono && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone sx={{ color: '#ff0f6e' }} />
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedAppointment.telefono}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Número de teléfono
                    </Typography>
                  </Box>
                </Box>
              )}

              {selectedAppointment.idioma && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Person sx={{ color: '#ff0f6e' }} />
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedAppointment.idioma}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Idioma de preferencia
                    </Typography>
                  </Box>
                </Box>
              )}

              {selectedAppointment.meetLink && (
                <>
                  <Divider />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <VideoCall sx={{ color: '#ff0f6e' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Enlace de Google Meet
                      </Typography>
                      <Button
                        variant="contained"
                        href={selectedAppointment.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          backgroundColor: '#ff0f6e',
                          color: 'white',
                          fontWeight: 'bold',
                          borderRadius: '20px',
                          px: 3,
                          py: 1,
                          '&:hover': {
                            backgroundColor: '#e50575',
                          },
                        }}
                        startIcon={<VideoCall />}
                        endIcon={<OpenInNew />}
                      >
                        Unirse a Meet
                      </Button>
                    </Box>
                  </Box>
                </>
              )}

              {selectedAppointment.htmlLink && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Schedule sx={{ color: '#ff0f6e' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Ver en Google Calendar
                    </Typography>
                    <Button
                      variant="outlined"
                      href={selectedAppointment.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: '#ff0f6e',
                        borderColor: '#ff0f6e',
                        borderRadius: '20px',
                        px: 3,
                        py: 1,
                        '&:hover': {
                          borderColor: '#e50575',
                          backgroundColor: 'rgba(237, 31, 128, 0.04)',
                        },
                      }}
                      endIcon={<OpenInNew />}
                    >
                      Abrir en Calendar
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button
            onClick={() =>
              selectedAppointment &&
              handleDeleteAppointment(selectedAppointment)
            }
            sx={{
              color: '#f44336',
              borderColor: '#f44336',
              borderRadius: '25px',
              px: 3,
              '&:hover': {
                borderColor: '#d32f2f',
                backgroundColor: 'rgba(244, 67, 54, 0.04)',
              },
            }}
            variant="outlined"
            startIcon={<Delete />}
          >
            Eliminar Cita
          </Button>
          <Button
            onClick={handleCloseDetails}
            sx={{
              backgroundColor: '#ff0f6e',
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
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={showDeleteConfirm}
        onClose={cancelDeleteAppointment}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, textAlign: 'center' },
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
                color: '#f44336',
                mb: 1,
              }}
            />
            <Typography
              variant="h5"
              fontWeight="bold"
              color="#f44336"
              gutterBottom
            >
              Confirmar Eliminación
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ maxWidth: 400 }}
            >
              ¿Estás seguro de que deseas eliminar esta cita? Esta acción no se
              puede deshacer.
            </Typography>
            {appointmentToDelete && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {appointmentToDelete.nombre} {appointmentToDelete.apellido}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {appointmentToDelete.date} - {appointmentToDelete.time}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={cancelDeleteAppointment}
            sx={{
              color: '#666',
              borderColor: '#666',
              borderRadius: '25px',
              px: 3,
            }}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDeleteAppointment}
            sx={{
              backgroundColor: '#f44336',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '25px',
              px: 3,
              '&:hover': {
                backgroundColor: '#d32f2f',
              },
            }}
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
