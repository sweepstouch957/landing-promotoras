'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  FormGroup,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const daysOfWeek = [
  { label: 'Lunes', value: 1 },
  { label: 'Martes', value: 2 },
  { label: 'Miércoles', value: 3 },
  { label: 'Jueves', value: 4 },
  { label: 'Viernes', value: 5 },
  { label: 'Sábado', value: 6 },
  { label: 'Domingo', value: 0 },
];

export default function AdminDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startHour, setStartHour] = useState('09:00');
  const [endHour, setEndHour] = useState('17:00');

  useEffect(() => {
    // Cargar configuración previa
    const config = localStorage.getItem('scheduleConfig');
    if (config) {
      const parsed = JSON.parse(config);
      setStartDate(parsed.startDate);
      setEndDate(parsed.endDate);
      setSelectedDays(parsed.selectedDays);
      setStartHour(parsed.startHour);
      setEndHour(parsed.endHour);
    }
  }, []);

  const handleDayChange = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    const config = {
      startDate,
      endDate,
      selectedDays,
      startHour,
      endHour,
    };
    localStorage.setItem('scheduleConfig', JSON.stringify(config));
    alert('¡Configuración guardada correctamente!');
  };

  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: 'auto',
        mt: 4,
        p: isMobile ? 2 : 4,
        border: '1px solid #ccc',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h6" fontWeight="bold" color="#ED1F80" align="center">
        Dashboard Admin - Configurar horarios
      </Typography>

      <TextField
        label="Fecha inicio"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />

      <TextField
        label="Fecha fin"
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />

      <Typography variant="subtitle1" fontWeight="bold">
        Días permitidos
      </Typography>
      <FormGroup row>
        {daysOfWeek.map((day) => (
          <FormControlLabel
            key={day.value}
            control={
              <Checkbox
                checked={selectedDays.includes(day.value)}
                onChange={() => handleDayChange(day.value)}
              />
            }
            label={day.label}
          />
        ))}
      </FormGroup>

      <Box display="flex" gap={2}>
        <TextField
          label="Hora inicio"
          type="time"
          value={startHour}
          onChange={(e) => setStartHour(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <TextField
          label="Hora fin"
          type="time"
          value={endHour}
          onChange={(e) => setEndHour(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </Box>

      <Button
        variant="contained"
        onClick={handleSave}
        sx={{
          backgroundColor: '#ED1F80',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '25px',
          py: 1,
          '&:hover': {
            backgroundColor: '#e50575',
          },
        }}
      >
        Guardar configuración
      </Button>
      <Button
        variant="outlined"
        onClick={() => {
          localStorage.removeItem('scheduleConfig');
          alert('¡Configuración eliminada!');
          // Opcional: reiniciar estado
          setStartDate('');
          setEndDate('');
          setSelectedDays([]);
          setStartHour('09:00');
          setEndHour('17:00');
        }}
        sx={{
          borderColor: '#ED1F80',
          color: '#ED1F80',
          fontWeight: 'bold',
          borderRadius: '25px',
          py: 1,
          '&:hover': {
            backgroundColor: '#fce4ec',
            borderColor: '#e50575',
          },
        }}
      >
        Reset Configuración
      </Button>
      <Button
        variant="outlined"
        onClick={() => {
          const config = localStorage.getItem('scheduleConfig');
          if (config) {
            const blob = new Blob([config], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'configuracion_horarios.json';
            link.click();
            URL.revokeObjectURL(url);
          } else {
            alert('No hay configuración para exportar.');
          }
        }}
        sx={{
          borderColor: '#ED1F80',
          color: '#ED1F80',
          fontWeight: 'bold',
          borderRadius: '25px',
          py: 1,
          '&:hover': {
            backgroundColor: '#fce4ec',
            borderColor: '#e50575',
          },
        }}
      >
        Exportar configuración JSON
      </Button>
    </Box>
  );
}
