'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Badge,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ThumbUp as ThumbUpIcon,
  FilterList as FilterListIcon,
  Group as GroupIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface User {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  estado: string;
  estadoAprobacion?: string;
  asistencia?: boolean | null;
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

interface Attendance {
  _id: string;
  appointmentId: string;
  userId: string;
  asistio: boolean | null;
  fechaMarcado?: string;
  marcadoPor?: string;
  observaciones?: string;
}

interface AppointmentWithAttendance extends Appointment {
  asistencias: Attendance[];
  estadisticas: {
    totalRegistrados: number;
    asistieron: number;
    noAsistieron: number;
    sinMarcar: number;
    aprobados: number;
  };
}

interface ScheduleConfig {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  allowedWeekDays: number[];
  dailyTimeSlots: string[];
  timeZone: string;
  isActive: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`attendance-tabpanel-${index}`}
      aria-labelledby={`attendance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AttendanceManagerImproved: React.FC = () => {
  const [appointmentsByDay, setAppointmentsByDay] = useState<
    Record<string, DayAppointments>
  >({});
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithAttendance | null>(null);
  const [attendanceDialog, setAttendanceDialog] = useState(false);
  const [bulkAttendance, setBulkAttendance] = useState<{
    [key: string]: boolean | null;
  }>({});
  const [observaciones, setObservaciones] = useState<{ [key: string]: string }>(
    {}
  );
  const [saving, setSaving] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('realizada');
  const [attendanceState, setAttendanceState] = useState<{
    [appointmentId: string]: { [userId: string]: boolean | null };
  }>({});
  const [tabValue, setTabValue] = useState(0);
  const [attendanceFilter, setAttendanceFilter] = useState<string>('todos');

  // Función para aprobar usuario
  const approveUser = async (appointmentId: string, userId: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/appointments/slot/${appointmentId}/user/${userId}/approve`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aprobadoPor: 'Admin' }),
        }
      );

      if (response.ok) {
        await fetchAppointmentsWithAttendance();
        alert('Usuario aprobado exitosamente');
      } else {
        alert('Error al aprobar usuario');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error al aprobar usuario');
    }
  };

  // Función para marcar/desmarcar asistencia
  const toggleAttendance = (
    appointmentId: string,
    userId: string,
    attended: boolean | null
  ) => {
    setAttendanceState((prev) => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        [userId]: attended,
      },
    }));
  };

  // Cargar configuración de horarios
  const fetchScheduleConfig = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/schedule-config`
      );

      if (response.ok) {
        const result = await response.json();
        if (result && result.length > 0) {
          const activeConfig = result.find(
            (config: ScheduleConfig) => config.isActive
          );
          setScheduleConfig(activeConfig || result[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching schedule config:', error);
    }
  };

  // Cargar citas con asistencias
  const fetchAppointmentsWithAttendance = async () => {
    setLoading(true);
    try {
      const startDate = startOfWeek(selectedWeek, { weekStartsOn: 1 });
      const endDate = endOfWeek(selectedWeek, { weekStartsOn: 1 });

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/appointments?startDate=${format(
          startDate,
          'yyyy-MM-dd'
        )}&endDate=${format(endDate, 'yyyy-MM-dd')}&includeAttendance=true`
      );

      if (!response.ok) {
        throw new Error('Error al cargar los datos');
      }

      const result = await response.json();

      if (result.success) {
        // Filtrar por estado si es necesario
        let filteredData = result.data;
        if (filterStatus) {
          filteredData = {};
          Object.keys(result.data).forEach((date) => {
            const dayData = result.data[date];
            const filteredAppointments = dayData.appointments.filter(
              (app: Appointment) => app.estado === filterStatus
            );
            if (filteredAppointments.length > 0) {
              filteredData[date] = {
                ...dayData,
                appointments: filteredAppointments,
                totalAppointments: filteredAppointments.reduce(
                  (sum: number, app: Appointment) => sum + app.usuarios.length,
                  0
                ),
              };
            }
          });
        }

        setAppointmentsByDay(filteredData);
      }
    } catch (error) {
      console.error('Error fetching appointments with attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleConfig();
    fetchAppointmentsWithAttendance();
  }, [selectedWeek, filterStatus]);

  // Marcar asistencia individual
  const markAttendance = async (
    appointmentId: string,
    userId: string,
    asistio: boolean | null,
    observaciones?: string
  ) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/attendance`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId,
            userId,
            asistio,
            observaciones: observaciones || '',
            marcadoPor: 'Admin',
          }),
        }
      );

      if (response.ok) {
        await fetchAppointmentsWithAttendance();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking attendance:', error);
      return false;
    }
  };

  // Marcar asistencia masiva
  const markBulkAttendance = async () => {
    if (!selectedAppointment) return;

    setSaving(true);
    try {
      const promises = Object.entries(bulkAttendance).map(
        ([userId, asistio]) => {
          if (asistio !== null) {
            return markAttendance(
              selectedAppointment._id,
              userId,
              asistio,
              observaciones[userId] || ''
            );
          }
          return Promise.resolve(true);
        }
      );

      await Promise.all(promises);

      setAttendanceDialog(false);
      setBulkAttendance({});
      setObservaciones({});
      alert('Asistencias marcadas exitosamente');
    } catch (error) {
      console.error('Error marking bulk attendance:', error);
      alert('Error al marcar asistencias');
    } finally {
      setSaving(false);
    }
  };

  // Abrir dialog de asistencia
  const openAttendanceDialog = (appointment: Appointment) => {
    // Simular datos de asistencia para el ejemplo
    const appointmentWithAttendance: AppointmentWithAttendance = {
      ...appointment,
      asistencias: [],
      estadisticas: {
        totalRegistrados: appointment.usuarios.length,
        asistieron: 0,
        noAsistieron: 0,
        sinMarcar: appointment.usuarios.length,
        aprobados: appointment.usuarios.filter(
          (u) => u.estadoAprobacion === 'aprobado'
        ).length,
      },
    };

    setSelectedAppointment(appointmentWithAttendance);

    // Inicializar estado de asistencia masiva
    const initialBulkAttendance: { [key: string]: boolean | null } = {};
    appointment.usuarios.forEach((user) => {
      initialBulkAttendance[user._id] = null;
    });
    setBulkAttendance(initialBulkAttendance);

    setAttendanceDialog(true);
  };

  // Obtener todas las citas de la semana
  const getAllAppointments = (): Appointment[] => {
    const allAppointments: Appointment[] = [];
    Object.values(appointmentsByDay).forEach((dayData) => {
      allAppointments.push(...dayData.appointments);
    });
    return allAppointments;
  };

  const allAppointments = getAllAppointments();

  // Agrupar citas por horarios según configuración
  const groupAppointmentsByTimeSlots = () => {
    if (!scheduleConfig) return {};

    const grouped: { [timeSlot: string]: Appointment[] } = {};

    scheduleConfig.dailyTimeSlots.forEach((timeSlot) => {
      grouped[timeSlot] = allAppointments.filter((app) =>
        app.horaInicio.startsWith(timeSlot)
      );
    });

    return grouped;
  };

  const groupedAppointments = groupAppointmentsByTimeSlots();

  // Filtrar usuarios según el filtro de asistencia
  const filterUsersByAttendance = (users: User[], appointmentId: string) => {
    if (attendanceFilter === 'todos') return users;

    return users.filter((user) => {
      const userAttendance = attendanceState[appointmentId]?.[user._id];
      switch (attendanceFilter) {
        case 'asistieron':
          return userAttendance === true;
        case 'no_asistieron':
          return userAttendance === false;
        case 'sin_marcar':
          return userAttendance === null || userAttendance === undefined;
        case 'aprobados':
          return user.estadoAprobacion === 'aprobado';
        default:
          return true;
      }
    });
  };

  // Obtener estadísticas de asistencia
  const getAttendanceStats = (appointmentId: string, users: User[]) => {
    const asistieron = users.filter(
      (u) => attendanceState[appointmentId]?.[u._id] === true
    ).length;
    const noAsistieron = users.filter(
      (u) => attendanceState[appointmentId]?.[u._id] === false
    ).length;
    const sinMarcar =
      users.length - Object.keys(attendanceState[appointmentId] || {}).length;
    const aprobados = users.filter(
      (u) => u.estadoAprobacion === 'aprobado'
    ).length;

    return { asistieron, noAsistieron, sinMarcar, aprobados };
  };

  // Obtener usuarios aprobados para el componente de aprobados
  const getApprovedUsers = () => {
    const approvedUsers: User[] = [];
    allAppointments.forEach((appointment) => {
      appointment.usuarios.forEach((user) => {
        if (user.estadoAprobacion === 'aprobado') {
          approvedUsers.push(user);
        }
      });
    });
    return approvedUsers;
  };

  const approvedUsers = getApprovedUsers();

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" sx={{ color: '#ED1F80' }}>
          Gestión de Asistencias
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="realizada">Realizadas</MenuItem>
              <MenuItem value="lleno">Llenas</MenuItem>
              <MenuItem value="cancelada">Canceladas</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filtrar por</InputLabel>
            <Select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              label="Filtrar por"
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="asistieron">Asistieron</MenuItem>
              <MenuItem value="no_asistieron">No asistieron</MenuItem>
              <MenuItem value="sin_marcar">Sin marcar</MenuItem>
              <MenuItem value="aprobados">Aprobados</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAppointmentsWithAttendance}
            disabled={loading}
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      {/* Tabs para diferentes vistas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
        >
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <ScheduleIcon />
                Gestión de Asistencias
              </Box>
            }
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircleIcon />
                <Badge badgeContent={approvedUsers.length} color="primary">
                  Aprobados
                </Badge>
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Panel de Gestión de Asistencias */}
      <TabPanel value={tabValue} index={0}>
        {/* Configuración de horarios activa */}
        {scheduleConfig && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Configuración activa:</strong> {scheduleConfig.name} |
              <strong> Horarios:</strong>{' '}
              {scheduleConfig.dailyTimeSlots.join(', ')} |
              <strong> Días:</strong>{' '}
              {scheduleConfig.allowedWeekDays
                .map(
                  (day) =>
                    ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][day]
                )
                .join(', ')}
            </Typography>
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress sx={{ color: '#ED1F80' }} />
          </Box>
        ) : (
          <>
            {/* Navegación de semanas */}
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={2}
              mb={3}
            >
              <Button
                variant="outlined"
                onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}
              >
                Semana Anterior
              </Button>
              <Typography variant="h6">
                {format(
                  startOfWeek(selectedWeek, { weekStartsOn: 1 }),
                  'dd/MM'
                )}{' '}
                -{' '}
                {format(
                  endOfWeek(selectedWeek, { weekStartsOn: 1 }),
                  'dd/MM/yyyy'
                )}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
              >
                Semana Siguiente
              </Button>
            </Box>

            {/* Asistencias agrupadas por horarios */}
            {scheduleConfig && Object.keys(groupedAppointments).length > 0 ? (
              Object.entries(groupedAppointments).map(
                ([timeSlot, appointments]) =>
                  appointments.length > 0 && (
                    <Card key={timeSlot} sx={{ mb: 3 }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <AccessTimeIcon sx={{ color: '#ED1F80' }} />
                          <Typography variant="h6" sx={{ color: '#ED1F80' }}>
                            Horario: {timeSlot}
                          </Typography>
                          <Chip
                            label={`${appointments.length} citas`}
                            color="primary"
                            size="small"
                          />
                        </Box>

                        {appointments.map((appointment) => {
                          const filteredUsers = filterUsersByAttendance(
                            appointment.usuarios,
                            appointment._id
                          );
                          const stats = getAttendanceStats(
                            appointment._id,
                            appointment.usuarios
                          );

                          return (
                            <Accordion key={appointment._id}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={2}
                                  width="100%"
                                >
                                  <ScheduleIcon sx={{ color: '#ED1F80' }} />
                                  <Box flex={1}>
                                    <Typography variant="subtitle1">
                                      {appointment.horaInicio} -{' '}
                                      {appointment.horaFin}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {appointment.usuarios.length}{' '}
                                      participantes registrados
                                    </Typography>
                                  </Box>
                                  <Box display="flex" gap={1}>
                                    <Chip
                                      label={`✓ ${stats.asistieron}`}
                                      color="success"
                                      size="small"
                                    />
                                    <Chip
                                      label={`✗ ${stats.noAsistieron}`}
                                      color="error"
                                      size="small"
                                    />
                                    <Chip
                                      label={`? ${stats.sinMarcar}`}
                                      color="warning"
                                      size="small"
                                    />
                                    <Chip
                                      label={`👍 ${stats.aprobados}`}
                                      color="info"
                                      size="small"
                                    />
                                  </Box>
                                  <Chip
                                    label={appointment.estado}
                                    color={
                                      appointment.estado === 'realizada'
                                        ? 'success'
                                        : 'default'
                                    }
                                    size="small"
                                  />
                                </Box>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Box>
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={2}
                                  >
                                    <Typography variant="subtitle2">
                                      Participantes ({filteredUsers.length} de{' '}
                                      {appointment.usuarios.length}):
                                    </Typography>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={() =>
                                        openAttendanceDialog(appointment)
                                      }
                                      disabled={
                                        appointment.usuarios.length === 0
                                      }
                                    >
                                      Marcar Asistencias
                                    </Button>
                                  </Box>

                                  <TableContainer component={Paper}>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Participante</TableCell>
                                          <TableCell>Email</TableCell>
                                          <TableCell>Estado</TableCell>
                                          <TableCell>Asistencia</TableCell>
                                          <TableCell>Acciones</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {filteredUsers.map((user) => {
                                          const userAttendance =
                                            attendanceState[appointment._id]?.[
                                              user._id
                                            ] ?? null;
                                          return (
                                            <TableRow key={user._id}>
                                              <TableCell>
                                                <Box
                                                  display="flex"
                                                  alignItems="center"
                                                  gap={1}
                                                >
                                                  <PersonIcon
                                                    sx={{ fontSize: 16 }}
                                                  />
                                                  {user.nombre} {user.apellido}
                                                </Box>
                                              </TableCell>
                                              <TableCell>
                                                {user.email}
                                              </TableCell>
                                              <TableCell>
                                                <Chip
                                                  label={
                                                    user.estadoAprobacion ||
                                                    user.estado
                                                  }
                                                  size="small"
                                                  color={
                                                    user.estadoAprobacion ===
                                                    'aprobado'
                                                      ? 'success'
                                                      : user.estadoAprobacion ===
                                                        'pendiente'
                                                      ? 'warning'
                                                      : 'default'
                                                  }
                                                />
                                              </TableCell>
                                              <TableCell>
                                                <Box
                                                  display="flex"
                                                  alignItems="center"
                                                  gap={1}
                                                >
                                                  <IconButton
                                                    size="small"
                                                    color={
                                                      userAttendance === true
                                                        ? 'success'
                                                        : 'default'
                                                    }
                                                    onClick={() =>
                                                      toggleAttendance(
                                                        appointment._id,
                                                        user._id,
                                                        userAttendance === true
                                                          ? null
                                                          : true
                                                      )
                                                    }
                                                  >
                                                    <CheckIcon />
                                                  </IconButton>
                                                  <IconButton
                                                    size="small"
                                                    color={
                                                      userAttendance === false
                                                        ? 'error'
                                                        : 'default'
                                                    }
                                                    onClick={() =>
                                                      toggleAttendance(
                                                        appointment._id,
                                                        user._id,
                                                        userAttendance === false
                                                          ? null
                                                          : false
                                                      )
                                                    }
                                                  >
                                                    <CloseIcon />
                                                  </IconButton>
                                                  <Typography variant="caption">
                                                    {userAttendance === true
                                                      ? 'Asistió'
                                                      : userAttendance === false
                                                      ? 'No asistió'
                                                      : 'Sin marcar'}
                                                  </Typography>
                                                </Box>
                                              </TableCell>
                                              <TableCell>
                                                <Box display="flex" gap={1}>
                                                  {user.estadoAprobacion ===
                                                    'pendiente' && (
                                                    <Tooltip title="Aprobar usuario">
                                                      <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() =>
                                                          approveUser(
                                                            appointment._id,
                                                            user._id
                                                          )
                                                        }
                                                      >
                                                        <ThumbUpIcon />
                                                      </IconButton>
                                                    </Tooltip>
                                                  )}
                                                </Box>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>

                                  {/* Resumen de asistencias */}
                                  <Box
                                    mt={2}
                                    p={2}
                                    bgcolor="#f5f5f5"
                                    borderRadius={1}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      gutterBottom
                                    >
                                      Resumen de Asistencias:
                                    </Typography>
                                    <Grid container spacing={2}>
                                      {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                                      <Grid item xs={3}>
                                        <Box textAlign="center">
                                          <Typography
                                            variant="h6"
                                            color="success.main"
                                          >
                                            {stats.asistieron}
                                          </Typography>
                                          <Typography variant="caption">
                                            Asistieron
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                                      <Grid item xs={3}>
                                        <Box textAlign="center">
                                          <Typography
                                            variant="h6"
                                            color="error.main"
                                          >
                                            {stats.noAsistieron}
                                          </Typography>
                                          <Typography variant="caption">
                                            No asistieron
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                                      <Grid item xs={3}>
                                        <Box textAlign="center">
                                          <Typography
                                            variant="h6"
                                            color="warning.main"
                                          >
                                            {stats.sinMarcar}
                                          </Typography>
                                          <Typography variant="caption">
                                            Sin marcar
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                                      <Grid item xs={3}>
                                        <Box textAlign="center">
                                          <Typography
                                            variant="h6"
                                            color="info.main"
                                          >
                                            {stats.aprobados}
                                          </Typography>
                                          <Typography variant="caption">
                                            Aprobados
                                          </Typography>
                                        </Box>
                                      </Grid>
                                    </Grid>
                                  </Box>
                                </Box>
                              </AccordionDetails>
                            </Accordion>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )
              )
            ) : (
              <Alert severity="info">
                No hay citas programadas para esta semana con el estado
                seleccionado.
              </Alert>
            )}
          </>
        )}
      </TabPanel>

      {/* Panel de Usuarios Aprobados */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <CheckCircleIcon sx={{ color: '#ED1F80' }} />
              <Typography variant="h6" sx={{ color: '#ED1F80' }}>
                Usuarios Aprobados
              </Typography>
              <Chip
                label={`${approvedUsers.length} usuarios`}
                color="success"
                size="small"
              />
            </Box>

            {approvedUsers.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Teléfono</TableCell>
                      <TableCell>Fecha de Aprobación</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {approvedUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PersonIcon sx={{ fontSize: 16 }} />
                            {user.nombre} {user.apellido}
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.telefono || 'No especificado'}
                        </TableCell>
                        <TableCell>
                          {user.fechaAprobacion
                            ? format(
                                new Date(user.fechaAprobacion),
                                'dd/MM/yyyy HH:mm'
                              )
                            : 'No especificada'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Aprobado"
                            color="success"
                            size="small"
                            icon={<CheckCircleIcon />}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                No hay usuarios aprobados en esta semana.
              </Alert>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Dialog para marcar asistencias */}
      <Dialog
        open={attendanceDialog}
        onClose={() => setAttendanceDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Marcar Asistencias
          {selectedAppointment && (
            <Typography variant="subtitle2" color="text.secondary">
              {selectedAppointment.horaInicio} - {selectedAppointment.horaFin}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Marca la asistencia de cada participante:
              </Typography>

              <Grid container spacing={2}>
                {selectedAppointment.usuarios.map((user) => (
                  //@ts-expect-error: MUI Grid typing conflict workaround
                  <Grid item xs={12} key={user._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <Typography variant="subtitle2">
                            {user.nombre} {user.apellido}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>

                        <Box display="flex" gap={1} mb={2}>
                          <Button
                            variant={
                              bulkAttendance[user._id] === true
                                ? 'contained'
                                : 'outlined'
                            }
                            color="success"
                            size="small"
                            onClick={() =>
                              setBulkAttendance((prev) => ({
                                ...prev,
                                [user._id]: true,
                              }))
                            }
                          >
                            Asistió
                          </Button>
                          <Button
                            variant={
                              bulkAttendance[user._id] === false
                                ? 'contained'
                                : 'outlined'
                            }
                            color="error"
                            size="small"
                            onClick={() =>
                              setBulkAttendance((prev) => ({
                                ...prev,
                                [user._id]: false,
                              }))
                            }
                          >
                            No Asistió
                          </Button>
                          <Button
                            variant={
                              bulkAttendance[user._id] === null
                                ? 'contained'
                                : 'outlined'
                            }
                            size="small"
                            onClick={() =>
                              setBulkAttendance((prev) => ({
                                ...prev,
                                [user._id]: null,
                              }))
                            }
                          >
                            Sin marcar
                          </Button>
                        </Box>

                        <TextField
                          fullWidth
                          size="small"
                          label="Observaciones (opcional)"
                          value={observaciones[user._id] || ''}
                          onChange={(e) =>
                            setObservaciones((prev) => ({
                              ...prev,
                              [user._id]: e.target.value,
                            }))
                          }
                          multiline
                          rows={2}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttendanceDialog(false)}>Cancelar</Button>
          <Button
            onClick={markBulkAttendance}
            variant="contained"
            disabled={saving}
            sx={{ backgroundColor: '#ED1F80' }}
          >
            {saving ? <CircularProgress size={20} /> : 'Guardar Asistencias'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceManagerImproved;
