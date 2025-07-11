'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Close,
  Refresh
} from '@mui/icons-material';
import { format, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface Slot {
  _id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  capacidadMaxima: number;
  usuariosRegistrados: string[];
  estado: string;
  enlaceMeet?: string;
}

interface SlotSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSlotSelect: (slot: Slot) => void;
  isSubmitting?: boolean;
}

const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

const SlotSelectorModal: React.FC<SlotSelectorModalProps> = ({
  open,
  onClose,
  onSlotSelect,
  isSubmitting = false
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduleConfig, setScheduleConfig] = useState<any>(null);

  // Obtener el inicio de la semana (lunes)
  const getWeekStart = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // 1 = lunes
    return start;
  };

  // Cargar configuración de horarios
  const loadScheduleConfig = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/schedule-config`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          const activeConfig = result.data.find((config: any) => config.isActive) || result.data[0];
          setScheduleConfig(activeConfig);
          
          // Ajustar la semana actual para que esté dentro del rango permitido
          const configStartDate = new Date(activeConfig.startDate);
          const configEndDate = new Date(activeConfig.endDate);
          const currentDate = new Date();
          
          if (currentDate < configStartDate) {
            setCurrentWeek(configStartDate);
          } else if (currentDate > configEndDate) {
            setCurrentWeek(configEndDate);
          }
        }
      }
    } catch (error) {
      console.error('Error cargando configuración de horarios:', error);
    }
  };

  // Cargar cupos para la semana actual
  const loadSlots = async (weekStart: Date) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Cargando cupos para la semana:', format(weekStart, 'yyyy-MM-dd'));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/slots/week/${format(weekStart, 'yyyy-MM-dd')}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 Respuesta de cupos:', result);

      if (result.success) {
        console.log('✅ Cupos cargados:', result.data.length);
        setSlots(result.data || []);
      } else {
        throw new Error(result.message || 'Error obteniendo cupos');
      }
    } catch (error) {
      console.error('❌ Error cargando cupos:', error);
      setError('Error cargando los cupos disponibles. Verifica la conexión con el servidor.');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar configuración y cupos cuando se abre el modal
  useEffect(() => {
    if (open) {
      console.log('🚀 Modal abierto, cargando configuración y cupos...');
      loadScheduleConfig().then(() => {
        const weekStart = getWeekStart(currentWeek);
        loadSlots(weekStart);
      });
    }
  }, [open]);

  // Cargar cupos cuando cambia la semana
  useEffect(() => {
    if (open && scheduleConfig) {
      const weekStart = getWeekStart(currentWeek);
      loadSlots(weekStart);
    }
  }, [currentWeek, scheduleConfig]);

  // Navegar a la semana anterior
  const goToPreviousWeek = () => {
    if (scheduleConfig) {
      const newWeek = subWeeks(currentWeek, 1);
      const configStartDate = new Date(scheduleConfig.startDate);
      
      // No permitir ir antes de la fecha de inicio de la configuración
      if (getWeekStart(newWeek) >= getWeekStart(configStartDate)) {
        setCurrentWeek(newWeek);
      }
    } else {
      setCurrentWeek(prev => subWeeks(prev, 1));
    }
  };

  // Navegar a la semana siguiente
  const goToNextWeek = () => {
    if (scheduleConfig) {
      const newWeek = addWeeks(currentWeek, 1);
      const configEndDate = new Date(scheduleConfig.endDate);
      
      // No permitir ir después de la fecha de fin de la configuración
      if (getWeekStart(newWeek) <= getWeekStart(configEndDate)) {
        setCurrentWeek(newWeek);
      }
    } else {
      setCurrentWeek(prev => addWeeks(prev, 1));
    }
  };

  // Actualizar cupos manualmente
  const handleRefresh = () => {
    const weekStart = getWeekStart(currentWeek);
    loadSlots(weekStart);
  };

  // Agrupar cupos por día
  const groupSlotsByDay = () => {
    const weekStart = getWeekStart(currentWeek);
    const groupedSlots: { [key: string]: Slot[] } = {};

    // Inicializar días de la semana
    for (let i = 0; i < 5; i++) { // Solo lunes a viernes
      const day = addDays(weekStart, i);
      const dayKey = format(day, 'yyyy-MM-dd');
      groupedSlots[dayKey] = [];
    }

    // Agrupar cupos por día
    slots.forEach(slot => {
      const slotDate = format(new Date(slot.fecha), 'yyyy-MM-dd');
      if (groupedSlots[slotDate]) {
        groupedSlots[slotDate].push(slot);
      }
    });

    // Ordenar cupos por hora dentro de cada día
    Object.keys(groupedSlots).forEach(day => {
      groupedSlots[day].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    });

    return groupedSlots;
  };

  // Obtener el estado visual del cupo
  const getSlotStatus = (slot: Slot) => {
    const ocupados = slot.usuariosRegistrados.length;
    const capacidad = slot.capacidadMaxima;
    
    if (slot.estado === 'cancelado') {
      return { color: 'error', text: 'Cancelado' };
    }
    
    if (ocupados >= capacidad) {
      return { color: 'error', text: 'Lleno' };
    }
    
    if (ocupados > 0) {
      return { color: 'warning', text: `${ocupados}/${capacidad}` };
    }
    
    return { color: 'success', text: 'Disponible' };
  };

  const weekStart = getWeekStart(currentWeek);
  const weekEnd = addDays(weekStart, 4); // Viernes
  const groupedSlots = groupSlotsByDay();

  // Verificar si se puede navegar a semanas anteriores/siguientes
  const canGoPrevious = scheduleConfig ? 
    getWeekStart(subWeeks(currentWeek, 1)) >= getWeekStart(new Date(scheduleConfig.startDate)) : 
    true;
  
  const canGoNext = scheduleConfig ? 
    getWeekStart(addWeeks(currentWeek, 1)) <= getWeekStart(new Date(scheduleConfig.endDate)) : 
    true;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { 
          minHeight: '600px',
          '& .MuiDialogTitle-root': {
            color: '#ED1F80'
          }
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="div" sx={{ color: '#ED1F80' }}>
            Seleccionar Horario
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Elige el día y hora para tu cita. Cada reunión tiene capacidad para 10-15 personas.
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Navegación de semana */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Button
            startIcon={<ChevronLeft />}
            onClick={goToPreviousWeek}
            variant="outlined"
            size="small"
            disabled={!canGoPrevious}
            sx={{ 
              borderColor: '#ED1F80',
              color: '#ED1F80',
              '&:hover': {
                borderColor: '#d1176b',
                backgroundColor: 'rgba(237, 31, 128, 0.04)'
              },
              '&:disabled': {
                borderColor: 'grey.300',
                color: 'grey.400'
              }
            }}
          >
            Semana Anterior
          </Button>
          
          <Typography variant="h6" sx={{ color: '#ED1F80' }}>
            {format(weekStart, 'dd MMM', { locale: es })} - {format(weekEnd, 'dd MMM yyyy', { locale: es })}
          </Typography>
          
          <Button
            endIcon={<ChevronRight />}
            onClick={goToNextWeek}
            variant="outlined"
            size="small"
            disabled={!canGoNext}
            sx={{ 
              borderColor: '#ED1F80',
              color: '#ED1F80',
              '&:hover': {
                borderColor: '#d1176b',
                backgroundColor: 'rgba(237, 31, 128, 0.04)'
              },
              '&:disabled': {
                borderColor: 'grey.300',
                color: 'grey.400'
              }
            }}
          >
            Semana Siguiente
          </Button>
        </Box>



        {/* Estado de carga */}
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress sx={{ color: '#ED1F80' }} />
          </Box>
        )}

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Cupos por día */}
        {!loading && !error && (
          <Grid container spacing={2}>
            {Object.entries(groupedSlots).map(([dayKey, daySlots]) => {
              const dayDate = new Date(dayKey);
              const dayName = DIAS_SEMANA[dayDate.getDay() - 1]; // -1 porque getDay() devuelve 0-6 y necesitamos 0-4
              const dayNumber = format(dayDate, 'dd MMM', { locale: es });

              return (
                <Grid item xs={12} sm={6} md={2.4} key={dayKey}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ color: '#ED1F80' }} align="center" gutterBottom>
                        {dayName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                        {dayNumber}
                      </Typography>

                      {daySlots.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" align="center">
                          Sin cupos disponibles
                        </Typography>
                      ) : (
                        <Box>
                          {daySlots.map((slot) => {
                            const status = getSlotStatus(slot);
                            const isAvailable = status.color === 'success' || status.color === 'warning';

                            return (
                              <Box key={slot._id} sx={{ mb: 1 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  disabled={!isAvailable || isSubmitting}
                                  onClick={() => onSlotSelect(slot)}
                                  sx={{
                                    justifyContent: 'space-between',
                                    textTransform: 'none',
                                    borderColor: isAvailable ? '#ED1F80' : 'grey.300',
                                    color: isAvailable ? '#ED1F80' : 'grey.500',
                                    '&:hover': isAvailable ? {
                                      borderColor: '#d1176b',
                                      backgroundColor: 'rgba(237, 31, 128, 0.04)'
                                    } : {}
                                  }}
                                >
                                  <Typography variant="caption">
                                    {slot.horaInicio}-{slot.horaFin}
                                  </Typography>
                                  <Chip
                                    label={status.text}
                                    size="small"
                                    color={status.color as any}
                                    variant="outlined"
                                  />
                                </Button>
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Información importante */}
        <Box mt={3}>
          <Typography variant="h6" sx={{ color: '#ED1F80' }} gutterBottom>
            Información importante:
          </Typography>
          <Typography variant="body2" component="div">
            • Cada reunión tiene una duración de 1 hora<br/>
            • Capacidad máxima: 15 personas por cupo<br/>
            • El enlace de Google Meet se enviará cuando el cupo esté completo<br/>
            • Horarios disponibles: Lunes a Viernes, 9:00-11:00 AM y 4:00-7:00 PM
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={isSubmitting}
          sx={{ 
            color: '#ED1F80',
            '&:hover': {
              backgroundColor: 'rgba(237, 31, 128, 0.04)'
            }
          }}
        >
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SlotSelectorModal;

