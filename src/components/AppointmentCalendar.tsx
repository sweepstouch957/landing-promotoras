/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  MenuItem,
  Select,
  FormControl,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Link as LinkIcon,
  Person as PersonIcon,
  // eslint-disable-line @typescript-eslint/no-unused-vars
  Check as CheckIcon,
  // eslint-disable-line @typescript-eslint/no-unused-vars
  Close as CloseIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from '@mui/icons-material';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';

interface User {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  estado: string;
  estadoAprobacion?: string;
  fechaRegistro?: string;
  fechaAprobacion?: string;
}

interface Appointment {
  _id: string;
  horaInicio: string;
  horaFin: string;
  capacidadMaxima: number;
  estado: string;
  enlaceMeet?: string;
  usuarios: User[];
}

interface DayAppointments {
  date: string;
  totalAppointments: number;
  appointments: Appointment[];
}

const AppointmentCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointmentsByDay, setAppointmentsByDay] = useState<
    Record<string, DayAppointments>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDayData, setSelectedDayData] =
    useState<DayAppointments | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [slotStatus, setSlotStatus] = useState<string>('');

  const fetchAppointmentsForMonth = async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const start = format(startOfMonth(date), 'yyyy-MM-dd');
      const end = format(endOfMonth(date), 'yyyy-MM-dd');

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/appointments?startDate=${start}&endDate=${end}`
      );

      if (!response.ok) {
        throw new Error('Error al cargar citas del calendario');
      }

      const result = await response.json();
      if (result.success) {
        setAppointmentsByDay(result.data);
      } else {
        throw new Error(result.message || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error fetching calendar appointments:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentsForMonth(currentMonth);
  }, [currentMonth]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getAppointmentsCount = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return appointmentsByDay[dateKey]?.totalAppointments || 0;
  };

  const handleDateClick = async (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateKey);

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/appointments/day/${dateKey}`
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSelectedDayData(result.data);
          setDialogOpen(true);
        }
      }
    } catch (err) {
      console.error('Error fetching day appointments:', err);
    }
  };

  const handleApproveUser = async (slotId: string, userId: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/appointments/slot/${slotId}/user/${userId}/approve`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aprobadoPor: 'Admin' }),
        }
      );

      if (response.ok) {
        // Refrescar datos
        if (selectedDate) {
          const dayResponse = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL ||
              'https://backend-promotoras.onrender.com'
            }/api/appointments/day/${selectedDate}`
          );
          if (dayResponse.ok) {
            const result = await dayResponse.json();
            if (result.success) {
              setSelectedDayData(result.data);
            }
          }
        }
        fetchAppointmentsForMonth(currentMonth);
      }
    } catch (err) {
      console.error('Error approving user:', err);
    }
  };

  const handleDisapproveUser = async (
    slotId: string,
    userId: string,
    motivo: string
  ) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/appointments/slot/${slotId}/user/${userId}/disapprove`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            motivo: motivo || 'No especificado',
            desaprobadoPor: 'Admin',
          }),
        }
      );

      if (response.ok) {
        // Refrescar datos
        if (selectedDate) {
          const dayResponse = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL ||
              'https://backend-promotoras.onrender.com'
            }/api/appointments/day/${selectedDate}`
          );
          if (dayResponse.ok) {
            const result = await dayResponse.json();
            if (result.success) {
              setSelectedDayData(result.data);
            }
          }
        }
        fetchAppointmentsForMonth(currentMonth);
      }
    } catch (err) {
      console.error('Error disapproving user:', err);
    }
  };

  const handleRemoveUser = async (slotId: string, userId: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/appointments/slot/${slotId}/user/${userId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        // Refrescar datos
        if (selectedDate) {
          const dayResponse = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL ||
              'https://backend-promotoras.onrender.com'
            }/api/appointments/day/${selectedDate}`
          );
          if (dayResponse.ok) {
            const result = await dayResponse.json();
            if (result.success) {
              setSelectedDayData(result.data);
            }
          }
        }
        fetchAppointmentsForMonth(currentMonth);
      }
    } catch (err) {
      console.error('Error removing user:', err);
    }
  };

  const handleUpdateSlotStatus = async (slotId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/appointments/slot/${slotId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: newStatus }),
        }
      );

      if (response.ok) {
        // Refrescar datos
        if (selectedDate) {
          const dayResponse = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL ||
              'https://backend-promotoras.onrender.com'
            }/api/appointments/day/${selectedDate}`
          );
          if (dayResponse.ok) {
            const result = await dayResponse.json();
            if (result.success) {
              setSelectedDayData(result.data);
            }
          }
        }
        fetchAppointmentsForMonth(currentMonth);
        setEditingSlot(null);
      }
    } catch (err) {
      console.error('Error updating slot status:', err);
    }
  };

  const handleGenerateMeetLink = async (slotId: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/appointments/slot/${slotId}/generate-meet`,
        { method: 'POST' }
      );

      if (response.ok) {
        // Refrescar datos
        if (selectedDate) {
          const dayResponse = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL ||
              'https://backend-promotoras.onrender.com'
            }/api/appointments/day/${selectedDate}`
          );
          if (dayResponse.ok) {
            const result = await dayResponse.json();
            if (result.success) {
              setSelectedDayData(result.data);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error generating meet link:', err);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible':
        return 'success';
      case 'lleno':
        return 'warning';
      case 'realizada':
        return 'info';
      case 'cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'primary';
      case 'aprobado':
        return 'success';
      case 'desaprobado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'warning';
      case 'aprobado':
        return 'success';
      case 'desaprobado':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <TodayIcon sx={{ color: '#ED1F80' }} />
              <Typography variant="h6" sx={{ color: '#ED1F80' }}>
                Calendario de Citas
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <IconButton onClick={handlePrevMonth}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography
                variant="h6"
                sx={{ minWidth: '120px', textAlign: 'center' }}
              >
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </Typography>
              <IconButton onClick={handleNextMonth}>
                <ChevronRightIcon />
              </IconButton>
              <Button onClick={handleToday} startIcon={<RefreshIcon />}>
                Hoy
              </Button>
            </Box>
          </Box>

          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Total de citas programadas:{' '}
            {Object.values(appointmentsByDay).reduce(
              (sum, day) => sum + day.totalAppointments,
              0
            )}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress sx={{ color: '#ED1F80' }} />
            </Box>
          ) : (
            <Grid container spacing={1}>
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                //@ts-expect-error: MUI Grid typing conflict workaround
                <Grid
                  item
                  xs={12 / 7}
                  key={day}
                  sx={{ textAlign: 'center', fontWeight: 'bold' }}
                >
                  {day}
                </Grid>
              ))}
              {Array.from({
                length:
                  daysInMonth[0].getDay() === 0
                    ? 6
                    : daysInMonth[0].getDay() - 1,
              }).map((_, i) => (
                //@ts-expect-error: MUI Grid typing conflict workaround
                <Grid item xs={12 / 7} key={`empty-start-${i}`}></Grid>
              ))}
              {daysInMonth.map((date) => {
                const count = getAppointmentsCount(date);
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isTodayDate = isSameDay(date, new Date());
                return (
                  //@ts-expect-error: MUI Grid typing conflict workaround
                  <Grid
                    item
                    xs={12 / 7}
                    key={date.toISOString()}
                    sx={{
                      textAlign: 'center',
                      p: 1,
                      border: '1px solid #eee',
                      borderRadius: '4px',
                      backgroundColor: isTodayDate
                        ? '#ffebee'
                        : isCurrentMonth
                        ? 'white'
                        : '#f5f5f5',
                      color: isCurrentMonth ? 'inherit' : '#ccc',
                      cursor: count > 0 ? 'pointer' : 'default',
                      '&:hover':
                        count > 0 ? { backgroundColor: '#f0f0f0' } : {},
                    }}
                    onClick={() => count > 0 && handleDateClick(date)}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {format(date, 'd')}
                    </Typography>
                    {count > 0 && (
                      <Typography
                        variant="caption"
                        sx={{
                          backgroundColor: '#ED1F80',
                          color: 'white',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mt: 0.5,
                        }}
                      >
                        {count}
                      </Typography>
                    )}
                  </Grid>
                );
              })}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Dialog para mostrar citas del día */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon sx={{ color: '#ED1F80' }} />
            Citas del{' '}
            {selectedDate &&
              format(new Date(selectedDate), 'dd/MM/yyyy', { locale: es })}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDayData && (
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 2, color: 'text.secondary' }}
              >
                Total de personas agendadas: {selectedDayData.totalAppointments}
              </Typography>

              {selectedDayData.appointments.map((appointment) => (
                <Card key={appointment._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography variant="h6">
                        {appointment.horaInicio} - {appointment.horaFin}
                      </Typography>
                      <Box display="flex" gap={1} alignItems="center">
                        <Chip
                          label={appointment.estado}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          color={getStatusColor(appointment.estado) as any}
                          size="small"
                        />
                        {editingSlot === appointment._id ? (
                          <Box display="flex" gap={1}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={slotStatus}
                                onChange={(e) => setSlotStatus(e.target.value)}
                              >
                                <MenuItem value="disponible">
                                  Disponible
                                </MenuItem>
                                <MenuItem value="lleno">Lleno</MenuItem>
                                <MenuItem value="realizada">Realizada</MenuItem>
                                <MenuItem value="cancelada">Cancelada</MenuItem>
                              </Select>
                            </FormControl>
                            <Button
                              size="small"
                              onClick={() =>
                                handleUpdateSlotStatus(
                                  appointment._id,
                                  slotStatus
                                )
                              }
                            >
                              Guardar
                            </Button>
                            <Button
                              size="small"
                              onClick={() => setEditingSlot(null)}
                            >
                              Cancelar
                            </Button>
                          </Box>
                        ) : (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingSlot(appointment._id);
                              setSlotStatus(appointment.estado);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        {!appointment.enlaceMeet &&
                          appointment.usuarios.length >=
                            appointment.capacidadMaxima && (
                            <Button
                              size="small"
                              startIcon={<LinkIcon />}
                              onClick={() =>
                                handleGenerateMeetLink(appointment._id)
                              }
                            >
                              Generar Meet
                            </Button>
                          )}
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Capacidad: {appointment.usuarios.length}/
                      {appointment.capacidadMaxima}
                    </Typography>

                    {appointment.enlaceMeet && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Enlace Meet:</strong>{' '}
                        <a
                          href={appointment.enlaceMeet}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {appointment.enlaceMeet}
                        </a>
                      </Typography>
                    )}

                    {appointment.usuarios.length > 0 ? (
                      <List dense>
                        {appointment.usuarios.map((user) => (
                          <ListItem key={user._id}>
                            <ListItemText
                              primary={`${user.nombre} ${user.apellido}`}
                              secondary={
                                <Box>
                                  <Typography variant="body2" component="span">
                                    {user.email}{' '}
                                    {user.telefono ? `- ${user.telefono}` : ''}
                                  </Typography>
                                  <br />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Registrado:{' '}
                                    {user.fechaRegistro
                                      ? format(
                                          new Date(user.fechaRegistro),
                                          'dd/MM/yyyy HH:mm'
                                        )
                                      : 'N/A'}
                                  </Typography>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Box
                                display="flex"
                                gap={1}
                                alignItems="center"
                                flexWrap="wrap"
                              >
                                <Chip
                                  label={user.estado}
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  color={getUserStatusColor(user.estado) as any}
                                  size="small"
                                />
                                {user.estadoAprobacion && (
                                  <Chip
                                    label={user.estadoAprobacion}
                                    color={
                                      getApprovalStatusColor(
                                        user.estadoAprobacion
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      ) as any
                                    }
                                    size="small"
                                  />
                                )}
                                {user.estadoAprobacion === 'pendiente' && (
                                  <>
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={() =>
                                        handleApproveUser(
                                          appointment._id,
                                          user._id
                                        )
                                      }
                                      title="Aprobar usuario"
                                    >
                                      <ThumbUpIcon />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() =>
                                        handleDisapproveUser(
                                          appointment._id,
                                          user._id,
                                          'Desaprobado por admin'
                                        )
                                      }
                                      title="Desaprobar usuario"
                                    >
                                      <ThumbDownIcon />
                                    </IconButton>
                                  </>
                                )}
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleRemoveUser(appointment._id, user._id)
                                  }
                                  title="Remover usuario"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No hay usuarios registrados en este horario
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AppointmentCalendar;
