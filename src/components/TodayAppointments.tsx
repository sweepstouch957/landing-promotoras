'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  VideoCall as VideoCallIcon,
  Today as TodayIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { format, isToday } from 'date-fns';
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

const TodayAppointments: React.FC = () => {
  const [todayData, setTodayData] = useState<DayAppointments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/appointments/day/${today}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          // No hay citas para hoy, esto es válido
          setTodayData({
            date: today,
            totalAppointments: 0,
            appointments: [],
          });
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Filtrar solo citas con usuarios registrados
        const appointmentsWithUsers = result.data.appointments.filter(
          (appointment: Appointment) =>
            appointment.usuarios && appointment.usuarios.length > 0
        );

        setTodayData({
          ...result.data,
          appointments: appointmentsWithUsers,
          totalAppointments: appointmentsWithUsers.reduce(
            (sum: number, app: Appointment) => sum + app.usuarios.length,
            0
          ),
        });
        setLastRefresh(new Date());
      } else {
        throw new Error(
          result.message || 'Error desconocido al obtener las citas'
        );
      }
    } catch (error) {
      console.error('Error fetching today appointments:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Error desconocido al cargar las citas'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();

    // Refrescar automáticamente cada 5 minutos
    const interval = setInterval(fetchTodayAppointments, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (estado: string) => {
    switch (estado) {
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

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return 'Disponible';
      case 'lleno':
        return 'Lleno';
      case 'realizada':
        return 'Realizada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  const getApprovalIcon = (estadoAprobacion?: string) => {
    switch (estadoAprobacion) {
      case 'aprobado':
        return <CheckCircleIcon sx={{ color: 'green', fontSize: 16 }} />;
      case 'desaprobado':
        return <CancelIcon sx={{ color: 'red', fontSize: 16 }} />;
      case 'pendiente':
      default:
        return <PendingIcon sx={{ color: 'orange', fontSize: 16 }} />;
    }
  };

  const getApprovalColor = (estadoAprobacion?: string) => {
    switch (estadoAprobacion) {
      case 'aprobado':
        return 'success';
      case 'desaprobado':
        return 'error';
      case 'pendiente':
      default:
        return 'warning';
    }
  };

  // Calcular estadísticas
  const stats = todayData
    ? {
        totalMeetings: todayData.appointments.length,
        totalParticipants: todayData.totalAppointments,
        approvedUsers: todayData.appointments.reduce(
          (sum, app) =>
            sum +
            app.usuarios.filter((u) => u.estadoAprobacion === 'aprobado')
              .length,
          0
        ),
        pendingUsers: todayData.appointments.reduce(
          (sum, app) =>
            sum +
            app.usuarios.filter((u) => u.estadoAprobacion === 'pendiente')
              .length,
          0
        ),
        meetingsWithLinks: todayData.appointments.filter(
          (app) => app.enlaceMeet
        ).length,
      }
    : null;

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress sx={{ color: '#ED1F80' }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
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
              Citas de Hoy
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="caption" color="text.secondary">
              Última actualización: {format(lastRefresh, 'HH:mm')}
            </Typography>
            <IconButton onClick={fetchTodayAppointments} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Error al obtener las citas de hoy:</strong> {error}
            </Typography>
            <Button
              size="small"
              onClick={fetchTodayAppointments}
              sx={{ mt: 1, color: '#ED1F80' }}
              variant="outlined"
            >
              Reintentar
            </Button>
          </Alert>
        )}

        {!todayData || todayData.appointments.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>No hay citas programadas para hoy.</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Las citas aparecerán aquí cuando los usuarios se registren en los
              horarios disponibles.
            </Typography>
          </Alert>
        ) : (
          <>
            {/* Estadísticas */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* @ts-expect-error: MUI Grid typing conflict workaround */}
              <Grid item xs={6} sm={3}>
                <Box
                  textAlign="center"
                  p={2}
                  bgcolor="#f5f5f5"
                  borderRadius={1}
                >
                  <Typography variant="h4" sx={{ color: '#ED1F80' }}>
                    {stats?.totalMeetings || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reuniones
                  </Typography>
                </Box>
              </Grid>
              {/* @ts-expect-error: MUI Grid typing conflict workaround */}
              <Grid item xs={6} sm={3}>
                <Box
                  textAlign="center"
                  p={2}
                  bgcolor="#f5f5f5"
                  borderRadius={1}
                >
                  <Typography variant="h4" sx={{ color: '#ED1F80' }}>
                    {stats?.totalParticipants || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Participantes
                  </Typography>
                </Box>
              </Grid>
              {/* @ts-expect-error: MUI Grid typing conflict workaround */}
              <Grid item xs={6} sm={3}>
                <Box
                  textAlign="center"
                  p={2}
                  bgcolor="#e8f5e8"
                  borderRadius={1}
                >
                  <Typography variant="h4" sx={{ color: '#4caf50' }}>
                    {stats?.approvedUsers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aprobados
                  </Typography>
                </Box>
              </Grid>
              {/* @ts-expect-error: MUI Grid typing conflict workaround */}
              <Grid item xs={6} sm={3}>
                <Box
                  textAlign="center"
                  p={2}
                  bgcolor="#fff3e0"
                  borderRadius={1}
                >
                  <Typography variant="h4" sx={{ color: '#ff9800' }}>
                    {stats?.pendingUsers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pendientes
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Lista de citas */}
            <List>
              {todayData.appointments.map((appointment, index) => (
                <React.Fragment key={appointment._id}>
                  <ListItem
                    sx={{
                      bgcolor: '#fafafa',
                      borderRadius: 1,
                      mb: 1,
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    }}
                  >
                    {/* Información de la cita */}
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      width="100%"
                      mb={1}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <ScheduleIcon sx={{ color: '#ED1F80' }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {appointment.horaInicio} - {appointment.horaFin}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.usuarios.length}/
                            {appointment.capacidadMaxima} participantes
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={getStatusText(appointment.estado)}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          color={getStatusColor(appointment.estado) as any}
                          size="small"
                        />
                        {appointment.enlaceMeet && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VideoCallIcon />}
                            href={appointment.enlaceMeet}
                            target="_blank"
                            sx={{
                              borderColor: '#ED1F80',
                              color: '#ED1F80',
                              '&:hover': {
                                borderColor: '#c91a6b',
                                backgroundColor: 'rgba(237, 31, 128, 0.04)',
                              },
                            }}
                          >
                            Meet
                          </Button>
                        )}
                      </Box>
                    </Box>

                    {/* Lista de usuarios */}
                    {appointment.usuarios &&
                      appointment.usuarios.length > 0 && (
                        <Box width="100%">
                          <Divider sx={{ my: 1 }} />
                          <Typography
                            variant="subtitle2"
                            gutterBottom
                            sx={{ color: '#666' }}
                          >
                            Participantes:
                          </Typography>
                          <Grid container spacing={1}>
                            {appointment.usuarios.map((user) => (
                              //@ts-expect-error: MUI Grid typing conflict workaround
                              <Grid item xs={12} sm={6} key={user._id}>
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={1}
                                  p={1}
                                  bgcolor="white"
                                  borderRadius={1}
                                  border="1px solid #eee"
                                >
                                  <PersonIcon
                                    sx={{ color: '#ED1F80', fontSize: 20 }}
                                  />
                                  <Box flex={1} minWidth={0}>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                        noWrap
                                      >
                                        {user.nombre} {user.apellido}
                                      </Typography>
                                      {getApprovalIcon(user.estadoAprobacion)}
                                    </Box>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={0.5}
                                    >
                                      <EmailIcon
                                        sx={{ fontSize: 14, color: '#666' }}
                                      />
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        noWrap
                                      >
                                        {user.email}
                                      </Typography>
                                    </Box>
                                    {user.telefono && (
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={0.5}
                                      >
                                        <PhoneIcon
                                          sx={{ fontSize: 14, color: '#666' }}
                                        />
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {user.telefono}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                  <Box
                                    display="flex"
                                    flexDirection="column"
                                    gap={0.5}
                                  >
                                    <Chip
                                      label={user.estado}
                                      size="small"
                                      color={
                                        user.estado === 'aprobado'
                                          ? 'success'
                                          : 'default'
                                      }
                                      sx={{ fontSize: '0.7rem' }}
                                    />
                                    {user.estadoAprobacion && (
                                      <Chip
                                        label={user.estadoAprobacion}
                                        size="small"
                                        color={
                                          getApprovalColor(
                                            user.estadoAprobacion
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                          ) as any
                                        }
                                        sx={{ fontSize: '0.7rem' }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                  </ListItem>
                  {index < todayData.appointments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </>
        )}

        {/* Información adicional */}
        <Box mt={2} p={2} bgcolor="#f0f8ff" borderRadius={1}>
          <Typography variant="body2" color="text.secondary">
            💡 <strong>Tip:</strong> Los enlaces de Google Meet se generan
            automáticamente cuando un cupo se llena. Los correos de confirmación
            se envían a todos los participantes.
            {stats && stats.pendingUsers > 0 && (
              <>
                <br />
                ⚠️ Hay {stats.pendingUsers} usuario(s) pendiente(s) de
                aprobación.
              </>
            )}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TodayAppointments;
