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
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  // eslint-disable-line @typescript-eslint/no-unused-vars
  CheckCircle as CheckCircleIcon,
  // eslint-disable-line @typescript-eslint/no-unused-vars
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
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

const AttendanceManager: React.FC = () => {
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

  // Cargar configuración de horarios
  const fetchScheduleConfig = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
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
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
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
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
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

      {/* Configuración de horarios activa */}
      {scheduleConfig && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Configuración activa:</strong> {scheduleConfig.name} |
            <strong> Horarios:</strong>{' '}
            {scheduleConfig.dailyTimeSlots.join(', ')} |<strong> Días:</strong>{' '}
            {scheduleConfig.allowedWeekDays
              .map(
                (day) => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][day]
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
              {format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'dd/MM')}{' '}
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
                      <Typography variant="h6" sx={{ mb: 2, color: '#ED1F80' }}>
                        Horario: {timeSlot} ({appointments.length} citas)
                      </Typography>

                      {appointments.map((appointment) => (
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
                                  {appointment.usuarios.length} participantes
                                </Typography>
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
                                  Participantes registrados:
                                </Typography>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() =>
                                    openAttendanceDialog(appointment)
                                  }
                                  disabled={appointment.usuarios.length === 0}
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
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {appointment.usuarios.map((user) => (
                                      <TableRow key={user._id}>
                                        <TableCell>
                                          <Box
                                            display="flex"
                                            alignItems="center"
                                            gap={1}
                                          >
                                            <PersonIcon sx={{ fontSize: 16 }} />
                                            {user.nombre} {user.apellido}
                                          </Box>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
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
                                                : 'default'
                                            }
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Chip
                                            icon={<PendingIcon />}
                                            label="Sin marcar"
                                            size="small"
                                            color="warning"
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
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

export default AttendanceManager;
