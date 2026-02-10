'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Alert,
  CircularProgress,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface ScheduleConfig {
  _id?: string;
  name: string;
  startDate: string;
  endDate: string;
  allowedWeekDays: number[];
  dailyTimeSlots: string[];
  timeZone: string;
  isActive: boolean;
}

const weekDays = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const ConfiguracionHorarios: React.FC = () => {
  const [configs, setConfigs] = useState<ScheduleConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ScheduleConfig>({
    name: 'Configuración Principal',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    allowedWeekDays: [1, 2, 3, 4, 5], // Lunes a Viernes
    dailyTimeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    timeZone: 'America/Mexico_City',
    isActive: true,
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/schedule-config`);
      if (response.ok) {
        const data = await response.json();
        setConfigs(data);
      }
    } catch (error) {
      console.error('Error loading configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/schedule-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        MySwal.fire({
          title: 'Éxito',
          text: 'Configuración guardada correctamente',
          icon: 'success',
          confirmButtonColor: '#ff0f6e',
        });
        loadConfigs();
      } else {
        throw new Error('Error al guardar la configuración');
      }
    } catch (error) {
      MySwal.fire({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Error al guardar la configuración',
        icon: 'error',
        confirmButtonColor: '#ff0f6e',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWeekDaysChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      allowedWeekDays: typeof value === 'string' ? [] : value,
    });
  };

  const handleTimeSlotsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      dailyTimeSlots: typeof value === 'string' ? [] : value,
    });
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#ff0f6e', textAlign: 'center' }}>
        Configuración de Horarios
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Nueva Configuración
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nombre de la configuración"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Fecha de inicio"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Fecha de fin"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <FormControl fullWidth>
            <InputLabel>Días de la semana permitidos</InputLabel>
            <Select
              multiple
              value={formData.allowedWeekDays}
              onChange={handleWeekDaysChange}
              input={<OutlinedInput label="Días de la semana permitidos" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={weekDays.find(day => day.value === value)?.label} />
                  ))}
                </Box>
              )}
            >
              {weekDays.map((day) => (
                <MenuItem key={day.value} value={day.value}>
                  {day.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Horarios disponibles</InputLabel>
            <Select
              multiple
              value={formData.dailyTimeSlots}
              onChange={handleTimeSlotsChange}
              input={<OutlinedInput label="Horarios disponibles" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {timeSlots.map((time) => (
                <MenuItem key={time} value={time}>
                  {time}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Zona horaria"
            value={formData.timeZone}
            onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
            required
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ 
              backgroundColor: '#ff0f6e',
              '&:hover': { backgroundColor: '#C91A6B' }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Guardar Configuración'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Configuraciones Existentes
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : configs.length === 0 ? (
          <Alert severity="info">No hay configuraciones guardadas</Alert>
        ) : (
          configs.map((config) => (
            <Box key={config._id} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {config.name} {config.isActive && <Chip label="Activa" color="primary" size="small" />}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Período: {config.startDate} - {config.endDate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Días: {config.allowedWeekDays.map(day => weekDays.find(d => d.value === day)?.label).join(', ')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Horarios: {config.dailyTimeSlots.join(', ')}
              </Typography>
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default ConfiguracionHorarios;

