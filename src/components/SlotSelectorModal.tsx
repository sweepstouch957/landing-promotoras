'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

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
  Chip,
} from '@mui/material';
import { ChevronLeft, ChevronRight, Close, Refresh } from '@mui/icons-material';
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  addDays,
  parseISO,
  isBefore,
  isAfter,
  isEqual,
} from 'date-fns';
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

const DIAS_SEMANA = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
];

const SlotSelectorModal: React.FC<SlotSelectorModalProps> = ({
  open,
  onClose,
  onSlotSelect,
  isSubmitting = false,
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scheduleConfig, setScheduleConfig] = useState<any>(null);

  // Obtener el inicio de la semana (lunes)
  const getWeekStart = (date: Date) => {
    return startOfWeek(date, { weekStartsOn: 1 }); // 1 = lunes
  };

  // Cargar configuración de horarios
  const loadScheduleConfig = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/schedule-config/active`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setScheduleConfig(result.data);

          // Determinar la semana inicial a mostrar
          const configStartDate = getWeekStart(parseISO(result.data.startDate));
          const configEndDate = getWeekStart(parseISO(result.data.endDate));
          const today = getWeekStart(new Date());

          let initialWeek = today;

          // Si la fecha actual es anterior a la fecha de inicio de la configuración,
          // la semana inicial debe ser la semana de la fecha de inicio de la configuración.
          if (isBefore(today, configStartDate)) {
            initialWeek = configStartDate;
          } else if (isAfter(today, configEndDate)) {
            // Si la fecha actual es posterior a la fecha de fin, usar la última semana válida
            initialWeek = configEndDate;
          }
          setCurrentWeek(initialWeek);

          console.log('✅ Configuración de horarios cargada:', result.data);
        } else {
          console.warn('⚠️ No se pudo obtener configuración activa');
        }
      }
    } catch (error) {
      console.error('❌ Error cargando configuración de horarios:', error);
    }
  };

  // Cargar cupos para la semana actual
  const loadSlots = async (weekStart: Date) => {
    setLoading(true);
    setError(null);

    try {
      console.log(
        '🔍 Cargando cupos para la semana:',
        format(weekStart, 'yyyy-MM-dd')
      );

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/slots/week/${format(weekStart, 'yyyy-MM-dd')}`,
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
      setError(
        'Error cargando los cupos disponibles. Verifica la conexión con el servidor.'
      );
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar configuración y cupos cuando se abre el modal
  useEffect(() => {
    if (open) {
      console.log('🚀 Modal abierto, cargando configuración y cupos...');
      loadScheduleConfig();
    }
  }, [open]);

  // Cargar cupos cuando cambia la semana o la configuración
  useEffect(() => {
    if (open && scheduleConfig) {
      const weekStart = getWeekStart(currentWeek);
      loadSlots(weekStart);
    }
  }, [currentWeek, scheduleConfig, open]);

  // Navegar a la semana anterior
  const goToPreviousWeek = () => {
    if (scheduleConfig) {
      const newWeek = subWeeks(currentWeek, 1);
      const configStartDate = getWeekStart(parseISO(scheduleConfig.startDate));

      // No permitir ir antes de la fecha de inicio de la configuración
      if (
        isAfter(getWeekStart(newWeek), configStartDate) ||
        isEqual(getWeekStart(newWeek), configStartDate)
      ) {
        setCurrentWeek(newWeek);
      }
    } else {
      setCurrentWeek((prev) => subWeeks(prev, 1));
    }
  };

  // Navegar a la semana siguiente
  const goToNextWeek = () => {
    if (scheduleConfig) {
      const newWeek = addWeeks(currentWeek, 1);
      const configEndDate = getWeekStart(parseISO(scheduleConfig.endDate));

      // No permitir ir después de la fecha de fin de la configuración
      if (
        isBefore(getWeekStart(newWeek), configEndDate) ||
        isEqual(getWeekStart(newWeek), configEndDate)
      ) {
        setCurrentWeek(newWeek);
      }
    } else {
      setCurrentWeek((prev) => addWeeks(prev, 1));
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

    // Inicializar días de la semana (Lunes a Viernes) según la configuración
    const allowedDays = scheduleConfig?.allowedWeekDays || [1, 2, 3, 4, 5]; // Default a L-V si no hay config

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayOfWeek = day.getDay() === 0 ? 7 : day.getDay(); // Convertir domingo (0) a 7

      if (allowedDays.includes(dayOfWeek)) {
        const dayKey = format(day, 'yyyy-MM-dd');
        groupedSlots[dayKey] = [];
      }
    }

    // Agrupar cupos por día
    slots.forEach((slot) => {
      const slotDate = format(parseISO(slot.fecha), 'yyyy-MM-dd');
      if (groupedSlots[slotDate]) {
        groupedSlots[slotDate].push(slot);
      }
    });

    // Ordenar cupos por hora dentro de cada día
    Object.keys(groupedSlots).forEach((day) => {
      groupedSlots[day].sort((a, b) =>
        a.horaInicio.localeCompare(b.horaInicio)
      );
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
  const weekEnd = addDays(weekStart, 4); // Viernes (esto debe ser dinámico si los días permitidos cambian)
  const groupedSlots = groupSlotsByDay();

  // Verificar si se puede navegar a semanas anteriores/siguientes
  const canGoPrevious = scheduleConfig
    ? isAfter(
        getWeekStart(currentWeek),
        getWeekStart(parseISO(scheduleConfig.startDate))
      ) ||
      isEqual(
        getWeekStart(currentWeek),
        getWeekStart(parseISO(scheduleConfig.startDate))
      )
    : true;

  const canGoNext = scheduleConfig
    ? isBefore(
        getWeekStart(currentWeek),
        getWeekStart(parseISO(scheduleConfig.endDate))
      ) ||
      isEqual(
        getWeekStart(currentWeek),
        getWeekStart(parseISO(scheduleConfig.endDate))
      )
    : true;

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
            color: '#ff0f6e',
          },
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="div" sx={{ color: '#ff0f6e' }}>
            Seleccionar Horario
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Elige el día y hora para tu cita. Cada reunión tiene capacidad para
          10-15 personas.
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Navegación de semana */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Button
            startIcon={<ChevronLeft />}
            onClick={goToPreviousWeek}
            variant="outlined"
            size="small"
            disabled={!canGoPrevious}
            sx={{
              borderColor: '#ff0f6e',
              color: '#ff0f6e',
              '&:hover': {
                borderColor: '#c10061',
                backgroundColor: 'rgba(237, 31, 128, 0.04)',
              },
              '&:disabled': {
                borderColor: 'grey.300',
                color: 'grey.400',
              },
            }}
          >
            Semana Anterior
          </Button>

          <Typography variant="h6" sx={{ color: '#ff0f6e' }}>
            {format(weekStart, 'dd MMM', { locale: es })} -{' '}
            {format(weekEnd, 'dd MMM yyyy', { locale: es })}
          </Typography>

          <Button
            endIcon={<ChevronRight />}
            onClick={goToNextWeek}
            variant="outlined"
            size="small"
            disabled={!canGoNext}
            sx={{
              borderColor: '#ff0f6e',
              color: '#ff0f6e',
              '&:hover': {
                borderColor: '#c10061',
                backgroundColor: 'rgba(237, 31, 128, 0.04)',
              },
              '&:disabled': {
                borderColor: 'grey.300',
                color: 'grey.400',
              },
            }}
          >
            Semana Siguiente
          </Button>
        </Box>

        {/* Estado de carga */}
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress sx={{ color: '#ff0f6e' }} />
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
              const dayDate = parseISO(dayKey);
              const dayName = DIAS_SEMANA[dayDate.getDay()];
              const dayNumber = format(dayDate, 'dd MMM', { locale: es });

              return (
                //@ts-expect-error: MUI Grid typing conflict workaround
                <Grid item xs={12} sm={6} md={2.4} key={dayKey}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{ color: '#ff0f6e' }}
                        align="center"
                        gutterBottom
                      >
                        {dayName}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ mb: 2 }}
                      >
                        {dayNumber}
                      </Typography>

                      {daySlots.length === 0 ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          align="center"
                        >
                          Sin cupos disponibles
                        </Typography>
                      ) : (
                        <Box>
                          {daySlots.map((slot) => {
                            const status = getSlotStatus(slot);
                            const isAvailable =
                              status.color === 'success' ||
                              status.color === 'warning';

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
                                    borderColor: isAvailable
                                      ? '#ff0f6e'
                                      : 'grey.300',
                                    color: isAvailable ? '#ff0f6e' : 'grey.500',
                                    '&:hover': isAvailable
                                      ? {
                                          borderColor: '#c10061',
                                          backgroundColor:
                                            'rgba(237, 31, 128, 0.04)',
                                        }
                                      : {},
                                  }}
                                >
                                  <Typography variant="caption">
                                    {slot.horaInicio}-{slot.horaFin}
                                  </Typography>
                                  <Chip
                                    label={status.text}
                                    size="small"
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          <Typography variant="h6" sx={{ color: '#ff0f6e' }} gutterBottom>
            Información importante:
          </Typography>
          <Typography variant="body2" component="div">
            • Cada reunión tiene una duración de 1 hora
            <br />
            • Capacidad máxima: 15 personas por cupo
            <br />
            • El enlace de Google Meet se enviará cuando el cupo esté completo
            <br />• Horarios disponibles: Lunes a Viernes, 9:00-11:00 AM y
            4:00-7:00 PM
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            color: '#ff0f6e',
            '&:hover': {
              backgroundColor: 'rgba(237, 31, 128, 0.04)',
            },
          }}
        >
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SlotSelectorModal;
