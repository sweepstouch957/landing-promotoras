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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  TextField,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface User {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  slot?: {
    _id: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    enlaceMeet?: string;
    estado: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AttendanceRecord {
  _id: string;
  user: User;
  slot: {
    _id: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    enlaceMeet?: string;
  };
  asistio: boolean | null;
  fechaAsistencia?: string;
  notas: string;
}

const ApprovalManager: React.FC = () => {
  const [candidatos, setCandidatos] = useState<User[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [viewMode, setViewMode] = useState<'candidates' | 'attendance'>(
    'candidates'
  );
  const [rejectionReason, setRejectionReason] = useState('');

  // Cargar candidatos para aprobación
  const fetchCandidatos = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filtroEstado) {
        params.append('estado', filtroEstado);
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/users?${params}`
      );

      if (!response.ok) {
        throw new Error('Error al cargar candidatos');
      }

      const result = await response.json();

      if (result.success) {
        // Filtrar solo usuarios que tienen slot asignado (han asistido a reuniones)
        const usersWithSlots = result.data.filter((user: User) => user.slot);
        setCandidatos(usersWithSlots);
      } else {
        throw new Error(result.message || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setCandidatos([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar registros de asistencia
  const fetchAttendanceRecords = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/attendance/filter?asistio=true`
      );

      if (!response.ok) {
        throw new Error('Error al cargar registros de asistencia');
      }

      const result = await response.json();

      if (result.success) {
        setAttendanceRecords(result.data || []);
      } else {
        throw new Error(result.message || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'candidates') {
      fetchCandidatos();
    } else {
      fetchAttendanceRecords();
    }
  }, [filtroEstado, viewMode]);

  // Aprobar usuario
  const approveUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/users/${selectedUser._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: 'aprobado' }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al aprobar usuario');
      }

      // Enviar correo de aprobación
      try {
        await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL ||
            'https://backend-promotoras.onrender.com'
          }/api/approval/approve`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: selectedUser._id }),
          }
        );
      } catch (emailError) {
        console.error('Error enviando correo de aprobación:', emailError);
        // No fallar la operación por error de email
      }

      if (viewMode === 'candidates') {
        await fetchCandidatos();
      } else {
        await fetchAttendanceRecords();
      }

      setApprovalDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error al aprobar usuario');
    }
  };

  // Rechazar usuario
  const rejectUser = async () => {
    if (!selectedUser) return;

    try {
      // Actualizar estado a rechazado
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/users/${selectedUser._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: 'rechazado' }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al rechazar usuario');
      }

      // Eliminar usuario si es necesario
      try {
        await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL ||
            'https://backend-promotoras.onrender.com'
          }/api/approval/reject`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: selectedUser._id,
              reason: rejectionReason,
            }),
          }
        );
      } catch (rejectError) {
        console.error('Error en proceso de rechazo:', rejectError);
      }

      if (viewMode === 'candidates') {
        await fetchCandidatos();
      } else {
        await fetchAttendanceRecords();
      }

      setRejectionDialog(false);
      setSelectedUser(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Error al rechazar usuario');
    }
  };

  // Obtener color del estado
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'success';
      case 'rechazado':
        return 'error';
      case 'pendiente':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Obtener texto del estado
  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'Aprobado';
      case 'rechazado':
        return 'Rechazado';
      case 'pendiente':
        return 'Pendiente';
      default:
        return estado;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" sx={{ color: '#ED1F80' }}>
          Gestión de Aprobaciones
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant={viewMode === 'candidates' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('candidates')}
            sx={{
              backgroundColor:
                viewMode === 'candidates' ? '#ED1F80' : 'transparent',
            }}
          >
            Candidatos
          </Button>
          <Button
            variant={viewMode === 'attendance' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('attendance')}
            sx={{
              backgroundColor:
                viewMode === 'attendance' ? '#ED1F80' : 'transparent',
            }}
          >
            Asistentes
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              if (viewMode === 'candidates') {
                fetchCandidatos();
              } else {
                fetchAttendanceRecords();
              }
            }}
            disabled={loading}
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* @ts-expect-error: MUI Grid typing conflict workaround */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pendiente">Pendientes</MenuItem>
                  <MenuItem value="aprobado">Aprobados</MenuItem>
                  <MenuItem value="rechazado">Rechazados</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* @ts-expect-error: MUI Grid typing conflict workaround */}
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                onClick={() => setFiltroEstado('')}
                fullWidth
              >
                Limpiar Filtros
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Contenido principal */}
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress sx={{ color: '#ED1F80' }} />
            </Box>
          ) : (
            <>
              {viewMode === 'candidates' ? (
                // Vista de candidatos
                <>
                  <Typography variant="h6" gutterBottom>
                    Candidatos para Aprobación ({candidatos.length})
                  </Typography>

                  {candidatos.length === 0 ? (
                    <Alert severity="info">
                      No hay candidatos disponibles para aprobación.
                    </Alert>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Usuario</TableCell>
                            <TableCell>Contacto</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Cita Asistida</TableCell>
                            <TableCell>Meet</TableCell>
                            <TableCell>Registro</TableCell>
                            <TableCell>Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {candidatos.map((user) => (
                            <TableRow key={user._id}>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <PersonIcon sx={{ color: '#ED1F80' }} />
                                  <Box>
                                    <Typography variant="subtitle2">
                                      {user.nombre} {user.apellido}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      ID: {user._id.slice(-6)}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={0.5}
                                    mb={0.5}
                                  >
                                    <EmailIcon
                                      sx={{ fontSize: 16, color: '#666' }}
                                    />
                                    <Typography variant="body2">
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
                                        sx={{ fontSize: 16, color: '#666' }}
                                      />
                                      <Typography variant="body2">
                                        {user.telefono}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={getStatusText(user.estado)}
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  color={getStatusColor(user.estado) as any}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {user.slot ? (
                                  <Box>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={0.5}
                                      mb={0.5}
                                    >
                                      <CalendarIcon
                                        sx={{ fontSize: 16, color: '#666' }}
                                      />
                                      <Typography variant="body2">
                                        {format(
                                          new Date(user.slot.fecha),
                                          'dd/MM/yyyy'
                                        )}
                                      </Typography>
                                    </Box>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {user.slot.horaInicio} -{' '}
                                      {user.slot.horaFin}
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Sin cita
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {user.slot?.enlaceMeet ? (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    href={user.slot.enlaceMeet}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                      borderColor: '#ED1F80',
                                      color: '#ED1F80',
                                      '&:hover': {
                                        borderColor: '#d1176b',
                                        backgroundColor:
                                          'rgba(237, 31, 128, 0.04)',
                                      },
                                    }}
                                  >
                                    Abrir Meet
                                  </Button>
                                ) : user.slot ? (
                                  <Chip
                                    label="No disponible"
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                  />
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    -
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {format(
                                    new Date(user.createdAt),
                                    'dd/MM/yyyy'
                                  )}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {format(new Date(user.createdAt), 'HH:mm')}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box display="flex" gap={0.5}>
                                  <Tooltip title="Ver detalles">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setViewDialog(true);
                                      }}
                                    >
                                      <ViewIcon />
                                    </IconButton>
                                  </Tooltip>
                                  {user.estado === 'pendiente' && (
                                    <>
                                      <Tooltip title="Aprobar">
                                        <IconButton
                                          size="small"
                                          color="success"
                                          onClick={() => {
                                            setSelectedUser(user);
                                            setApprovalDialog(true);
                                          }}
                                        >
                                          <ApproveIcon />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Rechazar">
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => {
                                            setSelectedUser(user);
                                            setRejectionDialog(true);
                                          }}
                                        >
                                          <RejectIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              ) : (
                // Vista de asistentes
                <>
                  <Typography variant="h6" gutterBottom>
                    Usuarios que Asistieron a Reuniones (
                    {attendanceRecords.length})
                  </Typography>

                  {attendanceRecords.length === 0 ? (
                    <Alert severity="info">
                      No hay registros de asistencia disponibles.
                    </Alert>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Usuario</TableCell>
                            <TableCell>Contacto</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Reunión Asistida</TableCell>
                            <TableCell>Meet</TableCell>
                            <TableCell>Fecha Asistencia</TableCell>
                            <TableCell>Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {attendanceRecords.map((record) => (
                            <TableRow key={record._id}>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <PersonIcon sx={{ color: '#ED1F80' }} />
                                  <Box>
                                    <Typography variant="subtitle2">
                                      {record.user.nombre}{' '}
                                      {record.user.apellido}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      ID: {record.user._id.slice(-6)}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={0.5}
                                    mb={0.5}
                                  >
                                    <EmailIcon
                                      sx={{ fontSize: 16, color: '#666' }}
                                    />
                                    <Typography variant="body2">
                                      {record.user.email}
                                    </Typography>
                                  </Box>
                                  {record.user.telefono && (
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={0.5}
                                    >
                                      <PhoneIcon
                                        sx={{ fontSize: 16, color: '#666' }}
                                      />
                                      <Typography variant="body2">
                                        {record.user.telefono}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={getStatusText(record.user.estado)}
                                  color={
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    getStatusColor(record.user.estado) as any
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={0.5}
                                    mb={0.5}
                                  >
                                    <CalendarIcon
                                      sx={{ fontSize: 16, color: '#666' }}
                                    />
                                    <Typography variant="body2">
                                      {format(
                                        new Date(record.slot.fecha),
                                        'dd/MM/yyyy'
                                      )}
                                    </Typography>
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {record.slot.horaInicio} -{' '}
                                    {record.slot.horaFin}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                {record.slot.enlaceMeet ? (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    href={record.slot.enlaceMeet}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                      borderColor: '#ED1F80',
                                      color: '#ED1F80',
                                      '&:hover': {
                                        borderColor: '#d1176b',
                                        backgroundColor:
                                          'rgba(237, 31, 128, 0.04)',
                                      },
                                    }}
                                  >
                                    Abrir Meet
                                  </Button>
                                ) : (
                                  <Chip
                                    label="No disponible"
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                {record.fechaAsistencia ? (
                                  <Typography variant="body2">
                                    {format(
                                      new Date(record.fechaAsistencia),
                                      'dd/MM/yyyy HH:mm'
                                    )}
                                  </Typography>
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    No registrada
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Box display="flex" gap={0.5}>
                                  <Tooltip title="Ver detalles">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setSelectedUser(record.user);
                                        setViewDialog(true);
                                      }}
                                    >
                                      <ViewIcon />
                                    </IconButton>
                                  </Tooltip>
                                  {record.user.estado === 'pendiente' && (
                                    <>
                                      <Tooltip title="Aprobar">
                                        <IconButton
                                          size="small"
                                          color="success"
                                          onClick={() => {
                                            setSelectedUser(record.user);
                                            setApprovalDialog(true);
                                          }}
                                        >
                                          <ApproveIcon />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Rechazar">
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => {
                                            setSelectedUser(record.user);
                                            setRejectionDialog(true);
                                          }}
                                        >
                                          <RejectIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de vista */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalles del Usuario</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Información Personal
                  </Typography>
                  <Typography>
                    <strong>Nombre:</strong> {selectedUser.nombre}{' '}
                    {selectedUser.apellido}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {selectedUser.email}
                  </Typography>
                  <Typography>
                    <strong>Teléfono:</strong> {selectedUser.telefono}
                  </Typography>
                  <Typography>
                    <strong>Estado:</strong>
                    <Chip
                      label={getStatusText(selectedUser.estado)}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      color={getStatusColor(selectedUser.estado) as any}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>
                {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Información de Cita
                  </Typography>
                  {selectedUser.slot ? (
                    <Box>
                      <Typography>
                        <strong>Fecha:</strong>{' '}
                        {format(
                          new Date(selectedUser.slot.fecha),
                          'dd/MM/yyyy'
                        )}
                      </Typography>
                      <Typography>
                        <strong>Hora:</strong> {selectedUser.slot.horaInicio} -{' '}
                        {selectedUser.slot.horaFin}
                      </Typography>
                      <Typography>
                        <strong>Estado del cupo:</strong>{' '}
                        {selectedUser.slot.estado}
                      </Typography>
                      {selectedUser.slot.enlaceMeet && (
                        <Box mt={1}>
                          <Button
                            variant="outlined"
                            startIcon={<EmailIcon />}
                            href={selectedUser.slot.enlaceMeet}
                            target="_blank"
                            size="small"
                          >
                            Enlace de Meet
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">
                      No tiene cita asignada
                    </Typography>
                  )}
                </Grid>
                {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Fechas
                  </Typography>
                  <Typography>
                    <strong>Registro:</strong>{' '}
                    {format(
                      new Date(selectedUser.createdAt),
                      'dd/MM/yyyy HH:mm'
                    )}
                  </Typography>
                  <Typography>
                    <strong>Última actualización:</strong>{' '}
                    {format(
                      new Date(selectedUser.updatedAt),
                      'dd/MM/yyyy HH:mm'
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de aprobación */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)}>
        <DialogTitle>Confirmar Aprobación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas aprobar a{' '}
            <strong>
              {selectedUser?.nombre} {selectedUser?.apellido}
            </strong>
            ?
          </Typography>
          <Typography color="primary" sx={{ mt: 1 }}>
            Se enviará un correo de confirmación con instrucciones para el
            siguiente paso.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancelar</Button>
          <Button onClick={approveUser} color="success" variant="contained">
            Aprobar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de rechazo */}
      <Dialog
        open={rejectionDialog}
        onClose={() => setRejectionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Rechazo</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            ¿Estás seguro de que deseas rechazar a{' '}
            <strong>
              {selectedUser?.nombre} {selectedUser?.apellido}
            </strong>
            ?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Motivo del rechazo (opcional)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Typography color="error" sx={{ mt: 1 }}>
            Esta acción marcará al usuario como rechazado.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialog(false)}>Cancelar</Button>
          <Button onClick={rejectUser} color="error" variant="contained">
            Rechazar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApprovalManager;
