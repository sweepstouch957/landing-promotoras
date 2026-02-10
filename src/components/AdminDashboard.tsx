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
  Divider,
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
    const config = { startDate, endDate, selectedDays, startHour, endHour };
    localStorage.setItem('scheduleConfig', JSON.stringify(config));
    alert('¡Configuración guardada correctamente!');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 600,
          backgroundColor: '#fff',
          borderRadius: 4,
          px: 4,
          py: 5,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Typography
          variant="h5"
          fontWeight="700"
          color="#ff0f6e"
          textAlign="center"
          gutterBottom
        >
          Configuración de Horarios
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <TextField
          label="Fecha de inicio"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="Fecha de fin"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{ mb: 3 }}
        />

        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Días permitidos
        </Typography>

        <FormGroup row sx={{ mb: 3 }}>
          {daysOfWeek.map((day) => (
            <FormControlLabel
              key={day.value}
              control={
                <Checkbox
                  checked={selectedDays.includes(day.value)}
                  onChange={() => handleDayChange(day.value)}
                  sx={{ color: '#ff0f6e' }}
                />
              }
              label={day.label}
              sx={{ mr: 1 }}
            />
          ))}
        </FormGroup>

        <Box
          display="flex"
          gap={2}
          sx={{ mb: 3 }}
          flexDirection={isMobile ? 'column' : 'row'}
        >
          <TextField
            label="Hora de inicio"
            type="time"
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Hora de fin"
            type="time"
            value={endHour}
            onChange={(e) => setEndHour(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              backgroundColor: '#ff0f6e',
              fontWeight: 'bold',
              borderRadius: 3,
              py: 1.2,
              '&:hover': { backgroundColor: '#d0176e' },
            }}
          >
            Guardar configuración
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              localStorage.removeItem('scheduleConfig');
              alert('¡Configuración eliminada!');
              setStartDate('');
              setEndDate('');
              setSelectedDays([]);
              setStartHour('09:00');
              setEndHour('17:00');
            }}
            sx={{
              borderColor: '#ff0f6e',
              color: '#ff0f6e',
              fontWeight: 'bold',
              borderRadius: 3,
              py: 1.2,
              '&:hover': {
                backgroundColor: '#fce4ec',
                borderColor: '#d0176e',
              },
            }}
          >
            Reset configuración
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
              borderColor: '#ff0f6e',
              color: '#ff0f6e',
              fontWeight: 'bold',
              borderRadius: 3,
              py: 1.2,
              '&:hover': {
                backgroundColor: '#fce4ec',
                borderColor: '#d0176e',
              },
            }}
          >
            Exportar configuración JSON
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
