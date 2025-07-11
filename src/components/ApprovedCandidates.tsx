'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  VideoCall as VideoCallIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { api } from '../lib/api';

interface ApprovedUser {
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
  fechaCita: string;
  horaCita: string;
  enlaceMeet: string;
  fechaAprobacion: string;
}

const ApprovedCandidates: React.FC = () => {
  const [users, setUsers] = useState<ApprovedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovedUsers = async () => {
    try {
      setLoading(true);
      const result = await api.getApprovedUsers();

      if (result.success) {
        setUsers(result.data);
      } else {
        setError('Error al cargar los candidatos aprobados');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error fetching approved users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedUsers();
  }, []);

  const handleOpenMeet = (meetLink: string) => {
    if (meetLink) {
      window.open(meetLink, '_blank');
    }
  };

  const handleDeleteApprovedUser = async (userId: string) => {
    if (
      window.confirm(
        '¿Estás seguro de que quieres eliminar a este usuario aprobado?'
      )
    ) {
      try {
        await api.deleteApprovedUser(userId);
        alert('Usuario aprobado eliminado exitosamente');
        fetchApprovedUsers();
      } catch (err) {
        console.error('Error al eliminar usuario aprobado:', err);
        alert('Error al eliminar usuario aprobado');
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'HH:mm', { locale: es });
    } catch {
      return timeString;
    }
  };

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={fetchApprovedUsers} sx={{ ml: 2 }}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <CheckCircleIcon sx={{ mr: 1, color: '#4caf50' }} />
        <Typography variant="h5" fontWeight="bold">
          Candidatos Aprobados
        </Typography>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Total de candidatos aprobados: {users.length}
      </Typography>

      {users.length === 0 ? (
        <Card>
          <CardContent>
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              No hay candidatos aprobados aún
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} md={6} lg={4} key={user._id}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  background: 'linear-gradient(to top left, #ffffff, #f7f7f7)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                  p: 2,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 6px 30px rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar
                      sx={{
                        bgcolor: '#ED1F80',
                        width: 60,
                        height: 60,
                        fontSize: 24,
                      }}
                    >
                      {getInitials(user.nombre, user.apellido)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {user.nombre} {user.apellido}
                      </Typography>
                      <Chip
                        label="Aprobado"
                        color="success"
                        size="small"
                        icon={<CheckCircleIcon />}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  </Box>

                  <List dense>
                    <ListItem disablePadding>
                      <ListItemIcon>
                        <EmailIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={user.email}
                        secondary="Correo electrónico"
                      />
                    </ListItem>

                    <ListItem disablePadding>
                      <ListItemIcon>
                        <PhoneIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={user.telefono}
                        secondary="Teléfono"
                      />
                    </ListItem>

                    <ListItem disablePadding>
                      <ListItemIcon>
                        <PersonIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${user.edad} años`}
                        secondary="Edad"
                      />
                    </ListItem>

                    <ListItem disablePadding>
                      <ListItemIcon>
                        <LocationIcon color="action" />
                      </ListItemIcon>
                      <ListItemText primary={user.ciudad} secondary="Ciudad" />
                    </ListItem>

                    <ListItem disablePadding>
                      <ListItemIcon>
                        <WorkIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={user.experiencia}
                        secondary="Experiencia laboral"
                      />
                    </ListItem>

                    <ListItem disablePadding>
                      <ListItemIcon>
                        <ScheduleIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${formatDate(user.fechaCita)} - ${formatTime(
                          user.horaCita
                        )}`}
                        secondary="Fecha de entrevista"
                      />
                    </ListItem>
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="text.secondary" mb={1}>
                    <strong>Motivación:</strong> {user.motivacion}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    <strong>Disponibilidad:</strong> {user.disponibilidad}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    textAlign="right"
                  >
                    Aprobado el: {formatDate(user.fechaAprobacion)}
                  </Typography>

                  <Box mt={3} display="flex" flexDirection="column" gap={1}>
                    {user.enlaceMeet && (
                      <Button
                        variant="contained"
                        startIcon={<VideoCallIcon />}
                        onClick={() => handleOpenMeet(user.enlaceMeet)}
                        fullWidth
                        sx={{
                          backgroundColor: '#ED1F80',
                          fontWeight: 'bold',
                          '&:hover': {
                            backgroundColor: '#c91a6b',
                          },
                        }}
                      >
                        Enlace de Meet
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteApprovedUser(user._id)}
                      fullWidth
                      sx={{
                        borderWidth: 2,
                        fontWeight: 'bold',
                        '&:hover': {
                          borderWidth: 2,
                          backgroundColor: '#ffe5e5',
                        },
                      }}
                    >
                      Eliminar Usuario
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box mt={3}>
        <Button variant="outlined" onClick={fetchApprovedUsers} fullWidth>
          Actualizar Lista
        </Button>
      </Box>
    </Box>
  );
};

export default ApprovedCandidates;
