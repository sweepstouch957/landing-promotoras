'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isToday, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

interface Slot {
  _id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  capacidadMaxima: number;
  usuariosRegistrados: any[];
  enlaceMeet?: string;
  estado: 'disponible' | 'lleno' | 'realizada' | 'cancelada';
  usuariosCount: number;
  estaLleno: boolean;
  cuposDisponibles: number;
}

interface SlotSelectorProps {
  onSlotSelect: (slot: Slot) => void;
  selectedSlot?: Slot | null;
  disabled?: boolean;
}

const SlotSelector: React.FC<SlotSelectorProps> = ({
  onSlotSelect,
  selectedSlot,
  disabled = false
}) => {
  const [slots, setSlots] = useState<{ [key: string]: Slot[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [systemInitialized, setSystemInitialized] = useState(false);
  const [initializationAttempted, setInitializationAttempted] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [selectedSlotForConfirm, setSelectedSlotForConfirm] = useState<Slot | null>(null);

  // Verificar estado del sistema
  const checkSystemStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/schedule-config/active`
      );
      
      if (response.ok) {
        const result = await response.json();
        setSystemInitialized(result.success && result.data);
        return result.success && result.data;
      }
      
      setSystemInitialized(false);
      return false;
    } catch (error) {
      console.error('Error checking system status:', error);
      setSystemInitialized(false);
      return false;
    }
  };

  // Inicializar sistema automáticamente
  const initializeSystem = async () => {
    if (initializationAttempted) return;
    
    setInitializationAttempted(true);
    
    try {
      // Primero verificar si ya está inicializado
      const isInitialized = await checkSystemStatus();
      if (isInitialized) {
        setSystemInitialized(true);
        return true;
      }

      // Si no está inicializado, intentar inicializar
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/initialize`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        console.log('Sistema inicializado automáticamente');
        setSystemInitialized(true);
        return true;
      } else {
        console.warn('No se pudo inicializar automáticamente');
        setSystemInitialized(false);
        return false;
      }
    } catch (error) {
      console.error('Error initializing system:', error);
      setSystemInitialized(false);
      return false;
    }
  };

  // Obtener slots disponibles
  const fetchSlots = async () => {
    if (!systemInitialized) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const weekParam = startDate.toISOString().split('T')[0];
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/slots/week/${weekParam}`
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSlots(result.data || {});
      } else {
        throw new Error(result.message || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar cupos');
      setSlots({});
    } finally {
      setLoading(false);
    }
  };

  // Crear cupos si no existen
  const createSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/slots/create-weekly`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        await fetchSlots();
      } else {
        throw new Error('Error al crear cupos');
      }
    } catch (error) {
      console.error('Error creating slots:', error);
      setError('Error al crear cupos');
    } finally {
      setLoading(false);
    }
  };

  // Efecto principal
  useEffect(() => {
    const initAndFetch = async () => {
      const initialized = await initializeSystem();
      if (initialized) {
        await fetchSlots();
      }
    };
    
    initAndFetch();
  }, [currentWeek]);

  // Manejar selección de slot
  const handleSlotSelect = (slot: Slot) => {
    if (disabled || slot.estado !== 'disponible' || slot.estaLleno) return;
    
    setSelectedSlotForConfirm(slot);
    setConfirmDialog(true);
  };

  // Confirmar selección
  const confirmSlotSelection = () => {
    if (selectedSlotForConfirm) {
      onSlotSelect(selectedSlotForConfirm);
      setConfirmDialog(false);
      setSelectedSlotForConfirm(null);
    }
  };

  // Obtener días de la semana
  const getWeekDays = () => {
    const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const days = [];
    
    for (let i = 0; i < 5; i++) { // Solo lunes a viernes
      const day = addDays(startDate, i);
      const dayKey = day.toISOString().split('T')[0];
      const daySlots = slots[dayKey] || [];
      
      days.push({
        date: day,
        key: dayKey,
        slots: daySlots.filter(slot => 
          slot.estado === 'disponible' || slot.estado === 'lleno'
        )
      });
    }
    
    return days;
  };

  // Obtener color del estado
  const getStatusColor = (slot: Slot) => {
    if (slot.estado === 'cancelada') return 'error';
    if (slot.estaLleno) return 'warning';
    if (slot.estado === 'disponible') return 'success';
    return 'default';
  };

  // Verificar si el slot está disponible para selección
  const isSlotSelectable = (slot: Slot) => {
    const slotDate = new Date(slot.fecha);
    return !disabled && 
           slot.estado === 'disponible' && 
           !slot.estaLleno && 
           !isBefore(slotDate, new Date());
  };

  const weekDays = getWeekDays();
  const weekStart = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd MMM', { locale: es });
  const weekEnd = format(addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), 4), 'dd MMM yyyy', { locale: es });

  // Si el sistema no está inicializado
  if (!systemInitialized && initializationAttempted) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            El sistema necesita ser configurado. Por favor, contacte al administrador.
          </Alert>
          <Button
            variant="contained"
            onClick={initializeSystem}
            sx={{ backgroundColor: '#ED1F80' }}
          >
            Reintentar Inicialización
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" sx={{ color: '#ED1F80' }}>
            Seleccionar Horario
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSlots}
            disabled={loading}
            size="small"
          >
            Actualizar
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Elige el día y hora para tu cita. Cada reunión tiene capacidad para 10-15 personas.
        </Typography>

        {/* Navegación de semana */}
        <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            disabled={loading}
            size="small"
          >
            Semana Anterior
          </Button>
          
          <Typography variant="h6" textAlign="center">
            {weekStart} - {weekEnd}
          </Typography>
          
          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            disabled={loading}
            size="small"
          >
            Semana Siguiente
          </Button>
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button 
              size="small" 
              onClick={fetchSlots}
              sx={{ ml: 2, color: '#ED1F80' }}
            >
              Reintentar
            </Button>
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress sx={{ color: '#ED1F80' }} />
          </Box>
        )}

        {/* Días de la semana */}
        {!loading && (
          <Grid container spacing={2}>
            {weekDays.map((day) => (
              <Grid item xs={12} sm={6} md={2.4} key={day.key}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    minHeight: 200,
                    backgroundColor: isToday(day.date) ? '#f0f8ff' : 'white'
                  }}
                >
                  <CardContent>
                    <Box textAlign="center" mb={2}>
                      <Typography variant="h6" sx={{ color: '#ED1F80' }}>
                        {format(day.date, 'EEEE', { locale: es })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(day.date, 'dd MMM', { locale: es })}
                      </Typography>
                      {isToday(day.date) && (
                        <Chip label="Hoy" size="small" color="primary" sx={{ mt: 0.5 }} />
                      )}
                    </Box>

                    {day.slots.length === 0 ? (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        textAlign="center"
                        sx={{ py: 2 }}
                      >
                        Sin cupos disponibles
                      </Typography>
                    ) : (
                      <Box>
                        {day.slots.map((slot) => (
                          <Button
                            key={slot._id}
                            fullWidth
                            variant={selectedSlot?._id === slot._id ? "contained" : "outlined"}
                            onClick={() => handleSlotSelect(slot)}
                            disabled={!isSlotSelectable(slot)}
                            sx={{
                              mb: 1,
                              justifyContent: 'flex-start',
                              backgroundColor: selectedSlot?._id === slot._id ? '#ED1F80' : 'transparent',
                              borderColor: getStatusColor(slot) === 'success' ? '#4caf50' : 
                                          getStatusColor(slot) === 'warning' ? '#ff9800' : '#ccc',
                              '&:hover': {
                                backgroundColor: isSlotSelectable(slot) ? 'rgba(237, 31, 128, 0.04)' : 'transparent'
                              }
                            }}
                          >
                            <Box textAlign="left" width="100%">
                              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                <ScheduleIcon sx={{ fontSize: 16 }} />
                                <Typography variant="body2" fontWeight="bold">
                                  {slot.horaInicio} - {slot.horaFin}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <PeopleIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption">
                                  {slot.usuariosCount}/{slot.capacidadMaxima}
                                </Typography>
                                <Chip
                                  label={slot.estaLleno ? 'Lleno' : 'Disponible'}
                                  size="small"
                                  color={getStatusColor(slot) as any}
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              </Box>
                            </Box>
                          </Button>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Si no hay cupos en la semana */}
        {!loading && Object.keys(slots).length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No hay cupos disponibles para esta semana.
            <Button
              variant="contained"
              onClick={createSlots}
              sx={{ ml: 2, backgroundColor: '#ED1F80' }}
            >
              Crear Cupos
            </Button>
          </Alert>
        )}

        {/* Información adicional */}
        <Box mt={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
          <Typography variant="h6" gutterBottom sx={{ color: '#ED1F80' }}>
            Información importante:
          </Typography>
          <Typography variant="body2" component="div">
            • Cada reunión tiene una duración de 30 minutos<br/>
            • Capacidad máxima: 15 personas por cupo<br/>
            • El enlace de Google Meet se enviará cuando el cupo esté completo<br/>
            • Horarios disponibles: Lunes a Viernes, 9:00-11:00 AM y 4:00-7:00 PM
          </Typography>
        </Box>

        {/* Dialog de confirmación */}
        <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
          <DialogTitle>Confirmar Selección de Horario</DialogTitle>
          <DialogContent>
            {selectedSlotForConfirm && (
              <Box>
                <Typography gutterBottom>
                  Has seleccionado el siguiente horario:
                </Typography>
                <Box p={2} bgcolor="#f5f5f5" borderRadius={1} my={2}>
                  <Typography><strong>Fecha:</strong> {format(new Date(selectedSlotForConfirm.fecha), 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: es })}</Typography>
                  <Typography><strong>Hora:</strong> {selectedSlotForConfirm.horaInicio} - {selectedSlotForConfirm.horaFin}</Typography>
                  <Typography><strong>Disponibilidad:</strong> {selectedSlotForConfirm.cuposDisponibles} cupos disponibles</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  ¿Deseas continuar con este horario?
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmSlotSelection}
              variant="contained"
              sx={{ backgroundColor: '#ED1F80' }}
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SlotSelector;

