'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';

import {
  VideoCall as VideoCallIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import AdminLayout from '@/components/AdminLayout';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

/* ------------------------------------------------------------------ */
/*  Tipos                                                              */
/* ------------------------------------------------------------------ */

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
  fecha?: string;
  horaInicio: string;
  horaFin: string;
  capacidadMaxima: number;
  estado: string;
  enlaceMeet?: string;
  usuarios: User[];
}

/* 🔄  Garantizamos que siempre exista un array de citas ------------- */
interface DayAppointments {
  date: string;
  totalAppointments: number;
  appointments: Appointment[];
}

interface SlotStats {
  slots: {
    total: number;
    available: number;
    full: number;
  };
  users: {
    total: number;
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

/* ------------------------------------------------------------------ */
/*  Componente para mostrar slots llenos                              */
/* ------------------------------------------------------------------ */

interface FilledSlotsSectionProps {
  selectedWeek: Date;
  onRefresh: () => void;
}

const FilledSlotsSection: React.FC<FilledSlotsSectionProps> = ({ 
  selectedWeek, 
  onRefresh 
}) => {
  const [filledSlots, setFilledSlots] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);

  const fetchFilledSlots = async () => {
    setLoading(true);
    try {
      const startDate = startOfWeek(selectedWeek, { weekStartsOn: 1 });
      const endDate = endOfWeek(selectedWeek, { weekStartsOn: 1 });

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        }/api/slots/filled?startDate=${format(
          startDate,
          'yyyy-MM-dd'
        )}&endDate=${format(endDate, 'yyyy-MM-dd')}`
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFilledSlots(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching filled slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSlot = async (slotId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cupo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        }/api/slots/${slotId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Cupo eliminado exitosamente');
          fetchFilledSlots();
          onRefresh();
        } else {
          alert('Error: ' + result.message);
        }
      } else {
        const errorResult = await response.json();
        alert('Error eliminando cupo: ' + (errorResult.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Error de conexión al eliminar cupo');
    }
  };

  const generateMeetAndSendEmails = async (slotId: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        }/api/slots/${slotId}/generate-meet`,
        { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Enlace de Google Meet generado y correos enviados exitosamente');
          fetchFilledSlots();
          onRefresh();
        } else {
          alert('Error: ' + result.message);
        }
      } else {
        const errorResult = await response.json();
        alert('Error generando enlace de Meet: ' + (errorResult.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error generating meet link:', error);
      alert('Error de conexión al generar enlace de Meet');
    }
  };

  useEffect(() => {
    fetchFilledSlots();
  }, [selectedWeek]);

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress sx={{ color: '#ED1F80' }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (filledSlots.length === 0) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#ED1F80', mb: 2 }}>
            Cupos Llenos
          </Typography>
          <Alert severity="info">
            No hay cupos llenos para esta semana.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: '#ED1F80', mb: 2 }}>
          Cupos Llenos ({filledSlots.length})
        </Typography>
        
        {filledSlots.map((slot) => (
          <Card key={slot._id} sx={{ mb: 2, border: '1px solid #ff9800' }}>
            <CardContent>
              <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
                sx={{ cursor: 'pointer' }}
                onClick={() => setExpandedSlot(
                  expandedSlot === slot._id ? null : slot._id
                )}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <ScheduleIcon sx={{ color: '#ff9800' }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {format(new Date(slot.fecha || ''), 'dd/MM/yyyy')} - {slot.horaInicio} a {slot.horaFin}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {slot.usuarios.length}/{slot.capacidadMaxima} participantes
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip label="LLENO" color="warning" size="small" />
                  {expandedSlot === slot._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Box>
              </Box>

              {expandedSlot === slot._id && (
                <Box mt={2}>
                  <Divider sx={{ mb: 2 }} />
                  
                  {/* Acciones */}
                  <Box display="flex" gap={1} mb={2}>
                    {!slot.enlaceMeet && (
                      <Button
                        size="small"
                        startIcon={<VideoCallIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          generateMeetAndSendEmails(slot._id);
                        }}
                        sx={{
                          backgroundColor: '#ED1F80',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#c91a6b',
                          },
                        }}
                      >
                        Generar Meet y Enviar Correos
                      </Button>
                    )}
                    
                    {slot.enlaceMeet && (
                      <Button
                        size="small"
                        startIcon={<VideoCallIcon />}
                        href={slot.enlaceMeet}
                        target="_blank"
                        sx={{
                          backgroundColor: '#4caf50',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#45a049',
                          },
                        }}
                      >
                        Abrir Meet
                      </Button>
                    )}
                    
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlot(slot._id);
                      }}
                      sx={{
                        backgroundColor: '#f44336',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#d32f2f',
                        },
                      }}
                    >
                      Eliminar Cupo
                    </Button>
                  </Box>

                  {/* Lista de usuarios */}
                  <Typography variant="subtitle2" gutterBottom>
                    Participantes:
                  </Typography>
                  <List dense>
                    {slot.usuarios.map((user) => (
                      <ListItem key={user._id} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={`${user.nombre} ${user.apellido}`}
                          secondary={
                            <Box>
                              <Typography variant="body2" component="span">
                                {user.email}
                                {user.telefono ? ` - ${user.telefono}` : ''}
                              </Typography>
                              <Box display="flex" gap={1} mt={0.5}>
                                <Chip
                                  label={user.estado}
                                  size="small"
                                  color={user.estado === 'aprobado' ? 'success' : 'default'}
                                />
                                {user.estadoAprobacion && (
                                  <Chip
                                    label={user.estadoAprobacion}
                                    size="small"
                                    color={
                                      user.estadoAprobacion === 'aprobado' ? 'success' :
                                      user.estadoAprobacion === 'desaprobado' ? 'error' : 'warning'
                                    }
                                  />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */

export default function CuposPage() {
  const [appointmentsByDay, setAppointmentsByDay] = useState<
    Record<string, DayAppointments>
  >({});
  const [stats, setStats] = useState<SlotStats | null>(null);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  /* ---------------------------------------------------------------- */
  /*  Fetch configuración de horarios                                 */
  /* ---------------------------------------------------------------- */

  const fetchScheduleConfig = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        }/api/schedule-config`
      );
      if (response.ok) {
        const res = await response.json();
        const active =
          res.find((c: ScheduleConfig) => c.isActive) || res[0] || null;
        setScheduleConfig(active);
      }
    } catch (err) {
      console.error('Error fetching schedule config:', err);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Fetch citas – normalizando siempre appointments: []             */
  /* ---------------------------------------------------------------- */

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const startDate = startOfWeek(selectedWeek, { weekStartsOn: 1 });
      const endDate = endOfWeek(selectedWeek, { weekStartsOn: 1 });

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        }/api/appointments?startDate=${format(
          startDate,
          'yyyy-MM-dd'
        )}&endDate=${format(endDate, 'yyyy-MM-dd')}`
      );
      if (!response.ok) throw new Error('Error al cargar citas');

      const { success, data, message } = await response.json();
      if (!success) throw new Error(message || 'Error desconocido');

      const normalized: Record<string, DayAppointments> = {};

      Object.entries(data).forEach(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ([date, raw]: [string, any /* según backend */]) => {
          const originales: Appointment[] = raw.appointments ?? [];
          const filtradas =
            filterStatus === ''
              ? originales
              : originales.filter((a) => a.estado === filterStatus);

          normalized[date] = {
            ...raw,
            appointments: filtradas,
            totalAppointments: filtradas.reduce(
              (sum, a) => sum + a.usuarios.length,
              0
            ),
          };
        }
      );

      setAppointmentsByDay(normalized);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err?.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Fetch estadísticas                                              */
  /* ---------------------------------------------------------------- */

  const fetchStats = async () => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        }/api/appointments/stats`
      );
      if (res.ok) {
        const { success, data } = await res.json();
        if (success) setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Acciones (Meet / aprobar / desaprobar)                          */
  /* ---------------------------------------------------------------- */

  const generateMeetLink = async (id: string) => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        }/api/appointments/slot/${id}/generate-meet`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error();
      await fetchAppointments();
      alert('Enlace de Meet generado exitosamente');
    } catch {
      alert('Error al generar enlace de Meet');
    }
  };

  const approveUser = async (appId: string, userId: string) => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        }/api/appointments/slot/${appId}/user/${userId}/approve`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aprobadoPor: 'Admin' }),
        }
      );
      if (res.ok) {
        await fetchAppointments();
        alert('Usuario aprobado exitosamente');
      }
    } catch {
      alert('Error al aprobar usuario');
    }
  };

  const disapproveUser = async (appId: string, userId: string) => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        }/api/appointments/slot/${appId}/user/${userId}/disapprove`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            motivo: 'Desaprobado por admin',
            desaprobadoPor: 'Admin',
          }),
        }
      );
      if (res.ok) {
        await fetchAppointments();
        alert('Usuario desaprobado exitosamente');
      }
    } catch {
      alert('Error al desaprobar usuario');
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Helpers de UI                                                   */
  /* ---------------------------------------------------------------- */

  const getStatusColor = (estado: string) =>
    ({
      disponible: 'success',
      lleno: 'warning',
      realizada: 'info',
      cancelada: 'error',
    }[estado] ?? 'default');

  const getApprovalStatusColor = (status: string) =>
    ({
      pendiente: 'warning',
      aprobado: 'success',
      desaprobado: 'error',
    }[status] ?? 'default');

  const getApprovalIcon = (estado?: string) =>
    ({
      aprobado: <CheckCircleIcon sx={{ color: 'green', fontSize: 16 }} />,
      desaprobado: <CancelIcon sx={{ color: 'red', fontSize: 16 }} />,
      pendiente: <PendingIcon sx={{ color: 'orange', fontSize: 16 }} />,
    }[estado ?? 'pendiente']);

  /* ---------------------------------------------------------------- */
  /*  Agrupar citas en lotes de 15 – ahora defensivo                  */
  /* ---------------------------------------------------------------- */

  const groupAppointments = () => {
    const todas: Appointment[] = [];
    Object.values(appointmentsByDay).forEach((d) =>
      todas.push(...(d?.appointments ?? []))
    );

    const grupos: Appointment[][] = [];
    for (let i = 0; i < todas.length; i += 15)
      grupos.push(todas.slice(i, i + 15));
    return grupos;
  };

  const appointmentGroups = groupAppointments();

  /* ---------------------------------------------------------------- */
  /*  useEffect inicial / dependencias                                */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    fetchScheduleConfig();
    fetchAppointments();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWeek, filterStatus]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Encabezado y filtros */}
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h4" sx={{ color: '#ED1F80' }}>
            Gestión de Cupos
          </Typography>

          <Box display="flex" gap={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filtrar por estado</InputLabel>
              <Select
                label="Filtrar por estado"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="disponible">Disponible</MenuItem>
                <MenuItem value="lleno">Lleno</MenuItem>
                <MenuItem value="realizada">Realizada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                fetchAppointments();
                fetchStats();
              }}
              disabled={loading}
            >
              Actualizar
            </Button>
          </Box>
        </Box>

        {/* Configuración activa */}
        {scheduleConfig && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Configuración activa:</strong> {scheduleConfig.name} |{' '}
              <strong>Horarios:</strong>{' '}
              {scheduleConfig.dailyTimeSlots.join(', ')} |{' '}
              <strong>Días:</strong>{' '}
              {scheduleConfig.allowedWeekDays
                .map(
                  (d) => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d]
                )
                .join(', ')}
            </Typography>
          </Alert>
        )}

        {/* Estadísticas */}
        {stats && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 3,
              mb: 3,
            }}
          >
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#ED1F80' }}>
                  {stats.slots.total}
                </Typography>
                <Typography variant="body2">Total Cupos</Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#4caf50' }}>
                  {stats.slots.available}
                </Typography>
                <Typography variant="body2">Disponibles</Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#ff9800' }}>
                  {stats.slots.full}
                </Typography>
                <Typography variant="body2">Llenos</Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#2196f3' }}>
                  {stats.users.total}
                </Typography>
                <Typography variant="body2">Total Usuarios</Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Errores */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loader */}
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
                )}
                {' - '}
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

            {/* Citas agrupadas */}
            <Typography variant="h5" sx={{ mb: 2 }}>
              Citas Agrupadas (Grupos de 15)
            </Typography>

            {/* Sección de slots llenos */}
            <FilledSlotsSection 
              selectedWeek={selectedWeek}
              onRefresh={() => {
                fetchAppointments();
                fetchStats();
              }}
            />

            {appointmentGroups.length === 0 ? (
              <Alert severity="info">
                No hay citas programadas para esta semana.
              </Alert>
            ) : (
              appointmentGroups.map((grupo, i) => (
                <Card key={i} sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#ED1F80' }}>
                      Grupo {i + 1} ({grupo.length} citas)
                    </Typography>

                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Fecha y Hora</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Participantes</TableCell>
                            <TableCell>Capacidad</TableCell>
                            <TableCell>Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {grupo.map((app) => (
                            <TableRow key={app._id}>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <ScheduleIcon sx={{ color: '#ED1F80' }} />
                                  <Typography variant="body2" fontWeight="bold">
                                    {app.horaInicio} - {app.horaFin}
                                  </Typography>
                                </Box>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  label={app.estado}
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  color={getStatusColor(app.estado) as any}
                                  size="small"
                                />
                              </TableCell>

                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <PeopleIcon sx={{ fontSize: 16 }} />
                                  <Typography variant="body2">
                                    {app.usuarios.length}
                                  </Typography>

                                  {app.usuarios.filter(
                                    (u) => u.estadoAprobacion === 'pendiente'
                                  ).length > 0 && (
                                    <Chip
                                      label={`${
                                        app.usuarios.filter(
                                          (u) =>
                                            u.estadoAprobacion === 'pendiente'
                                        ).length
                                      } pendientes`}
                                      color="warning"
                                      size="small"
                                    />
                                  )}
                                </Box>
                              </TableCell>

                              <TableCell>
                                {app.usuarios.length}/{app.capacidadMaxima}
                              </TableCell>

                              <TableCell>
                                <Box display="flex" gap={1}>
                                  <Tooltip title="Ver detalles">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setSelectedAppointment(app);
                                        setViewDialog(true);
                                      }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>

                                  {!app.enlaceMeet &&
                                    app.usuarios.length >=
                                      app.capacidadMaxima && (
                                      <Tooltip title="Generar Meet">
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            generateMeetLink(app._id)
                                          }
                                        >
                                          <VideoCallIcon />
                                        </IconButton>
                                      </Tooltip>
                                    )}

                                  {app.enlaceMeet && (
                                    <Tooltip title="Abrir Meet">
                                      <IconButton
                                        size="small"
                                        component="a"
                                        href={app.enlaceMeet}
                                        target="_blank"
                                      >
                                        <VideoCallIcon color="primary" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}

        {/* Dialog de detalle */}
        <Dialog
          open={viewDialog}
          onClose={() => setViewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Detalles de la Cita</DialogTitle>
          <DialogContent dividers>
            {selectedAppointment && (
              <>
                <Typography variant="h6" gutterBottom>
                  {selectedAppointment.horaInicio} -{' '}
                  {selectedAppointment.horaFin}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  Estado:{' '}
                  <Chip
                    label={selectedAppointment.estado}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    color={getStatusColor(selectedAppointment.estado) as any}
                    size="small"
                  />
                </Typography>

                <Typography variant="body2" gutterBottom>
                  Capacidad: {selectedAppointment.usuarios.length}/
                  {selectedAppointment.capacidadMaxima}
                </Typography>

                {selectedAppointment.enlaceMeet && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Enlace Meet:</strong>{' '}
                    <a
                      href={selectedAppointment.enlaceMeet}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedAppointment.enlaceMeet}
                    </a>
                  </Typography>
                )}

                <Typography variant="h6" sx={{ mt: 2 }}>
                  Participantes
                </Typography>

                <List>
                  {selectedAppointment.usuarios.map((u) => (
                    <ListItem key={u._id} divider>
                      <ListItemText
                        primary={`${u.nombre} ${u.apellido}`}
                        secondary={
                          <>
                            <Typography variant="body2">
                              {u.email}
                              {u.telefono ? ` - ${u.telefono}` : ''}
                            </Typography>
                            <Box display="flex" gap={1} mt={0.5}>
                              {getApprovalIcon(u.estadoAprobacion)}
                              <Chip
                                label={u.estadoAprobacion ?? 'pendiente'}
                                size="small"
                                color={
                                  getApprovalStatusColor(
                                    u.estadoAprobacion ?? 'pendiente'
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  ) as any
                                }
                              />
                            </Box>
                          </>
                        }
                      />

                      <ListItemSecondaryAction>
                        {u.estadoAprobacion === 'pendiente' && (
                          <Box display="flex" gap={1}>
                            <Button
                              size="small"
                              color="success"
                              onClick={() =>
                                approveUser(selectedAppointment._id, u._id)
                              }
                            >
                              Aprobar
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() =>
                                disapproveUser(selectedAppointment._id, u._id)
                              }
                            >
                              Desaprobar
                            </Button>
                          </Box>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
