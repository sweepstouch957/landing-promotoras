
'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  TablePagination,
  useMediaQuery,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  VideoCall as VideoCallIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Today as TodayIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface User {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  edad: number;
  ciudad: string;
  experiencia: string;
  motivacion: string;
  disponibilidad: string;
  fechaCita?: string;
  horaCita?: string;
  enlaceMeet?: string;
  esImportado: boolean;
  fechaCreacion: string;
  estado?: 'pendiente' | 'reunion_realizada';
}

export default function AdminScheduleList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [filterHour, setFilterHour] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [page, setPage] = useState(0);
  const [disapproveDialogOpen, setDisapproveDialogOpen] = useState(false);
  const [userToDisapprove, setUserToDisapprove] = useState<User | null>(null);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [meetingUser, setMeetingUser] = useState<User | null>(null);
  const [meetingConfirmDialogOpen, setMeetingConfirmDialogOpen] = useState(false);
  const [meetingHeld, setMeetingHeld] = useState<boolean | null>(null);
  const rowsPerPage = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/users');
      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
      } else {
        setError('Error al cargar los usuarios');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDisapproveConfirm = async () => {
    if (!userToDisapprove) return;

    try {
      const response = await fetch(`http://localhost:5001/api/users/${userToDisapprove._id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        setUsers(users.filter(u => u._id !== userToDisapprove._id));
        setDisapproveDialogOpen(false);
        setUserToDisapprove(null);
        alert('Usuario desaprobado y eliminado exitosamente');
      } else {
        alert('Error al desaprobar usuario: ' + result.message);
      }
    } catch (err) {
      console.error('Error disapproving user:', err);
      alert('Error de conexión al desaprobar usuario');
    }
  };

  const handleDisapproveClick = (user: User) => {
    setUserToDisapprove(user);
    setDisapproveDialogOpen(true);
  };

  const handleMeetLinkClick = (user: User) => {
    // Abrir el enlace en una nueva pestaña
    window.open(user.enlaceMeet, '_blank');
    
    // Mostrar el diálogo de confirmación después de un breve delay
    setTimeout(() => {
      setMeetingUser(user);
      setMeetingDialogOpen(true);
    }, 1000);
  };

  const handleMeetingResponse = (held: boolean) => {
    setMeetingHeld(held);
    setMeetingDialogOpen(false);
    
    if (held) {
      setMeetingConfirmDialogOpen(true);
    }
  };

  const handleMeetingAction = async (action: 'disapprove' | 'pending' | 'approve') => {
    if (!meetingUser) return;

    try {
      if (action === 'disapprove') {
        const response = await fetch(`http://localhost:5001/api/users/${meetingUser._id}`, {
          method: 'DELETE',
        });
        const result = await response.json();

        if (result.success) {
          setUsers(users.filter(u => u._id !== meetingUser._id));
          alert('Usuario desaprobado y eliminado exitosamente');
        } else {
          alert('Error al desaprobar usuario: ' + result.message);
        }
      } else if (action === 'approve') {
        const response = await fetch(`http://localhost:5001/api/users/${meetingUser._id}/approve`, {
          method: 'POST',
        });
        const result = await response.json();

        if (result.success) {
          setUsers(users.filter(u => u._id !== meetingUser._id));
          alert('Usuario aprobado exitosamente');
        } else {
          alert('Error al aprobar usuario: ' + result.message);
        }
      } else {
        // Actualizar estado a pendiente
        const updatedUsers = users.map(u => 
          u._id === meetingUser._id 
            ? { ...u, estado: 'pendiente' as const }
            : u
        );
        setUsers(updatedUsers);
        alert('Usuario marcado como pendiente');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Error de conexión al actualizar usuario');
    }

    setMeetingConfirmDialogOpen(false);
    setMeetingUser(null);
    setMeetingHeld(null);
  };

  const filteredUsers = users.filter((user) => {
    if (filterStart && user.fechaCita && user.fechaCita < filterStart) return false;
    if (filterEnd && user.fechaCita && user.fechaCita > filterEnd) return false;
    
    // Filtro por hora
    if (filterHour && user.horaCita) {
      const userHour = user.horaCita.split(':')[0];
      if (userHour !== filterHour) return false;
    }
    
    // Filtro por día de la semana
    if (filterDay && user.fechaCita) {
      const date = new Date(user.fechaCita);
      const dayOfWeek = date.getDay().toString();
      if (dayOfWeek !== filterDay) return false;
    }
    
    return true;
  });

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No programada';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'No programada';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'HH:mm', { locale: es });
    } catch {
      return timeString;
    }
  };

  const handleExport = () => {
    if (filteredUsers.length === 0) {
      alert('No hay usuarios para exportar.');
      return;
    }

    const json = JSON.stringify(filteredUsers, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'usuarios_promotoras.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generar opciones de horas (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i.toString().padStart(2, '0'),
    label: `${i.toString().padStart(2, '0')}:00`
  }));

  // Opciones de días de la semana
  const dayOptions = [
    { value: '0', label: 'Domingo' },
    { value: '1', label: 'Lunes' },
    { value: '2', label: 'Martes' },
    { value: '3', label: 'Miércoles' },
    { value: '4', label: 'Jueves' },
    { value: '5', label: 'Viernes' },
    { value: '6', label: 'Sábado' },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={fetchUsers} sx={{ ml: 2 }}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        pt: 8,
        px: 2,
        fontFamily: 'Inter, sans-serif',
        paddingBottom: '80px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1200,
          backgroundColor: '#fff',
          borderRadius: 4,
          px: 4,
          py: 3,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: '#ED1F80',
            textAlign: 'center',
            mb: 3,
          }}
        >
          Gestión de Usuarios por Aprobar
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Fecha inicio"
              type="date"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: <TodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Fecha fin"
              type="date"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: <TodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Hora</InputLabel>
              <Select
                value={filterHour}
                onChange={(e) => setFilterHour(e.target.value)}
                label="Hora"
                startAdornment={<ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="">Todas</MenuItem>
                {hourOptions.map((hour) => (
                  <MenuItem key={hour.value} value={hour.value}>
                    {hour.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Día</InputLabel>
              <Select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                label="Día"
                startAdornment={<TodayIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="">Todos</MenuItem>
                {dayOptions.map((day) => (
                  <MenuItem key={day.value} value={day.value}>
                    {day.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <Button
              variant="outlined"
              onClick={handleExport}
              sx={{ color: '#ED1F80', borderColor: '#ED1F80' }}
              fullWidth
              size="small"
            >
              Exportar
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <Button
              variant="outlined"
              onClick={fetchUsers}
              sx={{ color: '#ED1F80', borderColor: '#ED1F80' }}
              fullWidth
              size="small"
            >
              Actualizar
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" sx={{ mb: 2 }}>
          Total de usuarios: {filteredUsers.length}
        </Typography>

        {filteredUsers.length === 0 ? (
          <Typography variant="body1" color="text.secondary" textAlign="center">
            No hay usuarios registrados
          </Typography>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Fecha Cita</strong></TableCell>
                  <TableCell><strong>Hora</strong></TableCell>
                  <TableCell><strong>Meet</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {user.nombre} {user.apellido}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.edad} años - {user.ciudad}
                        </Typography>
                        {user.esImportado && (
                          <Chip 
                            label="Importado" 
                            size="small" 
                            color="info" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        {user.email}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(user.fechaCita)}</TableCell>
                    <TableCell>{formatTime(user.horaCita)}</TableCell>
                    <TableCell>
                      {user.enlaceMeet ? (
                        <IconButton
                          color="primary"
                          onClick={() => handleMeetLinkClick(user)}
                          sx={{
                            backgroundColor: '#e3f2fd',
                            '&:hover': {
                              backgroundColor: '#bbdefb',
                            },
                          }}
                        >
                          <VideoCallIcon />
                        </IconButton>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No disponible
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.estado === 'reunion_realizada' ? 'Reunión realizada' : 'Pendiente'} 
                        size="small" 
                        color={user.estado === 'reunion_realizada' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => handleDisapproveClick(user)}
                        sx={{
                          backgroundColor: '#f44336',
                          '&:hover': {
                            backgroundColor: '#d32f2f',
                          },
                        }}
                      >
                        Desaprobar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={filteredUsers.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10]}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count}`
              }
              labelRowsPerPage="Filas por página:"
            />
          </>
        )}

        {/* Dialog de confirmación de desaprobación */}
        <Dialog
          open={disapproveDialogOpen}
          onClose={() => setDisapproveDialogOpen(false)}
        >
          <DialogTitle>Confirmar desaprobación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que deseas desaprobar a {userToDisapprove?.nombre} {userToDisapprove?.apellido}?
              Esta acción eliminará al usuario permanentemente.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDisapproveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleDisapproveConfirm} 
              color="error"
              variant="contained"
            >
              Desaprobar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de confirmación de reunión */}
        <Dialog
          open={meetingDialogOpen}
          onClose={() => setMeetingDialogOpen(false)}
        >
          <DialogTitle>Confirmación de reunión</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Se realizó la reunión con {meetingUser?.nombre} {meetingUser?.apellido}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleMeetingResponse(false)}>
              No
            </Button>
            <Button 
              onClick={() => handleMeetingResponse(true)}
              color="primary"
              variant="contained"
            >
              Sí
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de acción post-reunión */}
        <Dialog
          open={meetingConfirmDialogOpen}
          onClose={() => setMeetingConfirmDialogOpen(false)}
        >
          <DialogTitle>Acción después de la reunión</DialogTitle>
          <DialogContent>
            <Typography>
              La reunión se realizó con {meetingUser?.nombre} {meetingUser?.apellido}.
              ¿Qué acción deseas tomar?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => handleMeetingAction('pending')}
              color="warning"
              variant="outlined"
            >
              Dejar pendiente
            </Button>
            <Button 
              onClick={() => handleMeetingAction('disapprove')}
              color="error"
              variant="contained"
            >
              Desaprobar
            </Button>
            <Button 
              onClick={() => handleMeetingAction('approve')}
              color="success"
              variant="contained"
              startIcon={<CheckCircleIcon />}
            >
              Aprobar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}



