'use client';

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
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Person, Email, Phone, Schedule } from '@mui/icons-material';

interface ScheduleData {
  date: string; // formato YYYY-MM-DD
  time: string; // formato HH:mm
  nombre?: string;
  apellido?: string;
  telefono?: string;
  correo?: string;
}

type MyEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: ScheduleData;
};

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function AdminScheduleCalendar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [meetings, setMeetings] = useState<ScheduleData[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<ScheduleData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ScheduleData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('scheduledMeetings');
    if (stored) {
      setMeetings(JSON.parse(stored));
    }
  }, []);

  const events = useMemo(() => {
    return meetings.map((m) => {
      const [year, month, day] = m.date.split('-').map(Number);
      const [hour, minute] = m.time.split(':').map(Number);
      const date = new Date(year, month - 1, day, hour, minute);
      
      // Crear título más descriptivo
      const title = m.nombre && m.apellido 
        ? `${m.time} - ${m.nombre} ${m.apellido}`
        : m.time;
      
      return {
        title,
        start: date,
        end: date,
        allDay: false,
        resource: m,
      } as MyEvent;
    });
  }, [meetings]);

  const handleSelectSlot = (slotInfo: {
    start: Date;
    end: Date;
    action: string;
  }) => {
    const clickedDate = format(slotInfo.start, 'yyyy-MM-dd');
    const dayEvents = meetings.filter(
      (m) => m.date === clickedDate
    );
    setSelectedDateEvents(dayEvents);
    setSelectedDate(clickedDate);
  };

  const handleSelectEvent = (event: MyEvent) => {
    if (event.resource) {
      setSelectedAppointment(event.resource);
      setShowDetailsDialog(true);
    }
  };

  const handleCloseDetails = () => {
    setShowDetailsDialog(false);
    setSelectedAppointment(null);
  };

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
      <Typography
        variant="h5"
        fontWeight="bold"
        color="#ED1F80"
        align="center"
        mb={3}
      >
        Calendario de Citas
      </Typography>

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
          onSelectEvent={handleSelectEvent}
          views={['month']}
          popup
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
        />
      </Box>

      {selectedDateEvents.length > 0 && selectedDate && (
        <Card sx={{ mt: 3, borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              mb={2}
              color="#ED1F80"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Schedule />
              Citas para el {format(new Date(selectedDate), 'PPP', { locale: es })}
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
                      borderColor: '#ED1F80',
                    }
                  }}
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setShowDetailsDialog(true);
                  }}
                >
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {appointment.nombre && appointment.apellido 
                            ? `${appointment.nombre} ${appointment.apellido}`
                            : 'Cita agendada'
                          }
                        </Typography>
                        {appointment.correo && (
                          <Typography variant="body2" color="text.secondary">
                            {appointment.correo}
                          </Typography>
                        )}
                      </Box>
                      <Chip 
                        label={appointment.time}
                        sx={{ 
                          backgroundColor: '#ED1F80',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
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
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Typography
            variant="h6"
            fontWeight="bold"
            color="#ED1F80"
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
                <Schedule sx={{ color: '#ED1F80' }} />
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {format(new Date(selectedAppointment.date), 'PPP', { locale: es })}
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
                  <Person sx={{ color: '#ED1F80' }} />
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedAppointment.nombre} {selectedAppointment.apellido}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nombre completo
                    </Typography>
                  </Box>
                </Box>
              )}

              {selectedAppointment.correo && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Email sx={{ color: '#ED1F80' }} />
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
                  <Phone sx={{ color: '#ED1F80' }} />
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
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCloseDetails}
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
            fullWidth
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

