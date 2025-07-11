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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Pagination,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  VideoCall as VideoCallIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface UserStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  withSlots: number;
  thisMonth: number;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Cargar usuarios
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (filterStatus) {
        params.append('estado', filterStatus);
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users?${params}`
      );
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data);
        setTotalPages(result.pagination?.pages || 1);
      } else {
        throw new Error(result.message || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users/stats/overview`
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [page, filterStatus]);

  // Actualizar usuario
  const updateUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users/${selectedUser._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        }
      );
      
      if (!response.ok) {
        throw new Error('Error al actualizar usuario');
      }
      
      await fetchUsers();
      await fetchStats();
      setEditDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error al actualizar usuario');
    }
  };

  // Eliminar usuario
  const deleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users/${selectedUser._id}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }
      
      await fetchUsers();
      await fetchStats();
      setDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar usuario');
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: '#ED1F80' }}>
          Gestión de Usuarios
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            fetchUsers();
            fetchStats();
          }}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {/* Estadísticas */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#ED1F80' }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#ff9800' }}>
                  {stats.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pendientes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#4caf50' }}>
                  {stats.approved}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aprobados
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#f44336' }}>
                  {stats.rejected}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rechazados
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#2196f3' }}>
                  {stats.withSlots}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Con Citas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#9c27b0' }}>
                  {stats.thisMonth}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Este Mes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pendiente">Pendientes</MenuItem>
                  <MenuItem value="aprobado">Aprobados</MenuItem>
                  <MenuItem value="rechazado">Rechazados</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                onClick={() => {
                  setFilterStatus('');
                  setPage(1);
                }}
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

      {/* Tabla de usuarios */}
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress sx={{ color: '#ED1F80' }} />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Contacto</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Cita</TableCell>
                      <TableCell>Registro</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PersonIcon sx={{ color: '#ED1F80' }} />
                            <Box>
                              <Typography variant="subtitle2">
                                {user.nombre} {user.apellido}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {user._id.slice(-6)}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                              <EmailIcon sx={{ fontSize: 16, color: '#666' }} />
                              <Typography variant="body2">{user.email}</Typography>
                            </Box>
                            {user.telefono && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <PhoneIcon sx={{ fontSize: 16, color: '#666' }} />
                                <Typography variant="body2">{user.telefono}</Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(user.estado)}
                            color={getStatusColor(user.estado) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {user.slot ? (
                            <Box>
                              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                <CalendarIcon sx={{ fontSize: 16, color: '#666' }} />
                                <Typography variant="body2">
                                  {format(new Date(user.slot.fecha), 'dd/MM/yyyy')}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {user.slot.horaInicio} - {user.slot.horaFin}
                              </Typography>
                              {user.slot.enlaceMeet && (
                                <Tooltip title="Enlace de Meet disponible">
                                  <VideoCallIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                                </Tooltip>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Sin cita
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
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
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setEditDialog(true);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setDeleteDialog(true);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Paginación */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                    sx={{
                      '& .MuiPaginationItem-root.Mui-selected': {
                        backgroundColor: '#ED1F80',
                        color: 'white'
                      }
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de edición */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    defaultValue={selectedUser.nombre}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      nombre: e.target.value
                    })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    defaultValue={selectedUser.apellido}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      apellido: e.target.value
                    })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    defaultValue={selectedUser.email}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      email: e.target.value
                    })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    defaultValue={selectedUser.telefono}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      telefono: e.target.value
                    })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={selectedUser.estado}
                      onChange={(e) => setSelectedUser({
                        ...selectedUser,
                        estado: e.target.value as any
                      })}
                      label="Estado"
                    >
                      <MenuItem value="pendiente">Pendiente</MenuItem>
                      <MenuItem value="aprobado">Aprobado</MenuItem>
                      <MenuItem value="rechazado">Rechazado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancelar</Button>
          <Button
            onClick={() => updateUser(selectedUser!)}
            variant="contained"
            sx={{ backgroundColor: '#ED1F80' }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de vista */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles del Usuario</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Información Personal</Typography>
                  <Typography><strong>Nombre:</strong> {selectedUser.nombre} {selectedUser.apellido}</Typography>
                  <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
                  <Typography><strong>Teléfono:</strong> {selectedUser.telefono}</Typography>
                  <Typography><strong>Estado:</strong> 
                    <Chip
                      label={getStatusText(selectedUser.estado)}
                      color={getStatusColor(selectedUser.estado) as any}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Información de Cita</Typography>
                  {selectedUser.slot ? (
                    <Box>
                      <Typography><strong>Fecha:</strong> {format(new Date(selectedUser.slot.fecha), 'dd/MM/yyyy')}</Typography>
                      <Typography><strong>Hora:</strong> {selectedUser.slot.horaInicio} - {selectedUser.slot.horaFin}</Typography>
                      <Typography><strong>Estado del cupo:</strong> {selectedUser.slot.estado}</Typography>
                      {selectedUser.slot.enlaceMeet && (
                        <Box mt={1}>
                          <Button
                            variant="outlined"
                            startIcon={<VideoCallIcon />}
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
                    <Typography color="text.secondary">No tiene cita asignada</Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Fechas</Typography>
                  <Typography><strong>Registro:</strong> {format(new Date(selectedUser.createdAt), 'dd/MM/yyyy HH:mm')}</Typography>
                  <Typography><strong>Última actualización:</strong> {format(new Date(selectedUser.updatedAt), 'dd/MM/yyyy HH:mm')}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de eliminación */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar al usuario{' '}
            <strong>{selectedUser?.nombre} {selectedUser?.apellido}</strong>?
          </Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={deleteUser} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserManagement;

