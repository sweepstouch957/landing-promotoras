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
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
  capacity: number;
}

interface ScheduleConfig {
  _id?: string;
  name: string;
  startDate: string;
  endDate: string;
  allowedWeekDays: number[];
  timeSlots: TimeSlot[];
  timeZone: string;
  isActive: boolean;
  autoCreateSlots: boolean;
  weeksInAdvance: number;
}

const diasSemana = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

const ScheduleConfigManager: React.FC = () => {
  const [configs, setConfigs] = useState<ScheduleConfig[]>([]);
  const [activeConfig, setActiveConfig] = useState<ScheduleConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configDialog, setConfigDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ScheduleConfig | null>(
    null
  );
  const [newTimeSlot, setNewTimeSlot] = useState<TimeSlot>({
    startTime: '09:00',
    endTime: '10:00',
    duration: 60,
    capacity: 15,
  });

  // Configuración por defecto
  const defaultConfig: ScheduleConfig = {
    name: 'Nueva Configuración',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // 3 meses
    allowedWeekDays: [1, 2, 3, 4, 5], // Lunes a viernes
    timeSlots: [
      { startTime: '09:00', endTime: '10:00', duration: 60, capacity: 15 },
      { startTime: '10:00', endTime: '11:00', duration: 60, capacity: 15 },
      { startTime: '16:00', endTime: '17:00', duration: 60, capacity: 15 },
      { startTime: '17:00', endTime: '18:00', duration: 60, capacity: 15 },
      { startTime: '18:00', endTime: '19:00', duration: 60, capacity: 15 },
    ],
    timeZone: 'America/Mexico_City',
    isActive: false,
    autoCreateSlots: true,
    weeksInAdvance: 4,
  };

  // Cargar configuraciones
  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        }/api/schedule-config`
      );

      if (!response.ok) {
        throw new Error('Error al cargar configuraciones');
      }

      const result = await response.json();
      setConfigs(result.data || []);

      // Buscar configuración activa
      const active = result.data?.find(
        (config: ScheduleConfig) => config.isActive
      );
      setActiveConfig(active || null);
    } catch (error) {
      console.error('Error fetching configs:', error);
      alert('Error al cargar las configuraciones');
    } finally {
      setLoading(false);
    }
  };

  // Cargar configuración activa
  const fetchActiveConfig = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        }/api/schedule-config/active`
      );

      if (!response.ok) {
        throw new Error('Error al cargar configuración activa');
      }

      const result = await response.json();
      setActiveConfig(result.data);
    } catch (error) {
      console.error('Error fetching active config:', error);
    }
  };

  useEffect(() => {
    fetchConfigs();
    fetchActiveConfig();
  }, []);

  // Abrir dialog para nueva configuración
  const openNewConfigDialog = () => {
    setEditingConfig({ ...defaultConfig });
    setConfigDialog(true);
  };

  // Abrir dialog para editar configuración
  const openEditConfigDialog = (config: ScheduleConfig) => {
    setEditingConfig({ ...config });
    setConfigDialog(true);
  };

  // Guardar configuración
  const saveConfig = async () => {
    if (!editingConfig) return;

    setSaving(true);
    try {
      const url = editingConfig._id
        ? `${
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
          }/api/schedule-config/${editingConfig._id}`
        : `${
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
          }/api/schedule-config`;

      const method = editingConfig._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingConfig),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar configuración');
      }

      await fetchConfigs();
      await fetchActiveConfig();
      setConfigDialog(false);
      setEditingConfig(null);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving config:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Error al guardar configuración'
      );
    } finally {
      setSaving(false);
    }
  };

  // Activar configuración
  const activateConfig = async (configId: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        }/api/schedule-config/activate/${configId}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Error al activar configuración');
      }

      await fetchConfigs();
      await fetchActiveConfig();
      alert('Configuración activada exitosamente');
    } catch (error) {
      console.error('Error activating config:', error);
      alert('Error al activar configuración');
    }
  };

  // Generar cupos desde configuración
  const generateSlots = async (configId: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        }/api/schedule-config/${configId}/generate-slots`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Error al generar cupos');
      }

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error('Error generating slots:', error);
      alert('Error al generar cupos');
    }
  };

  // Agregar franja horaria
  const addTimeSlot = () => {
    if (!editingConfig) return;

    setEditingConfig({
      ...editingConfig,
      timeSlots: [...editingConfig.timeSlots, { ...newTimeSlot }],
    });

    setNewTimeSlot({
      startTime: '09:00',
      endTime: '10:00',
      duration: 60,
      capacity: 15,
    });
  };

  // Remover franja horaria
  const removeTimeSlot = (index: number) => {
    if (!editingConfig) return;

    const newTimeSlots = editingConfig.timeSlots.filter((_, i) => i !== index);
    setEditingConfig({
      ...editingConfig,
      timeSlots: newTimeSlots,
    });
  };

  // Manejar cambio en días permitidos
  const handleWeekDayChange = (day: number, checked: boolean) => {
    if (!editingConfig) return;

    let newAllowedDays = [...editingConfig.allowedWeekDays];

    if (checked) {
      if (!newAllowedDays.includes(day)) {
        newAllowedDays.push(day);
      }
    } else {
      newAllowedDays = newAllowedDays.filter((d) => d !== day);
    }

    setEditingConfig({
      ...editingConfig,
      allowedWeekDays: newAllowedDays.sort(),
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={50} sx={{ color: '#ED1F80' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#ED1F80' }}>
        Configuración de Horarios
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
        Gestiona los horarios y días disponibles para las reuniones del
        programa.
      </Typography>

      {/* Configuración activa */}
      {activeConfig && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Configuración Activa: {activeConfig.name}
          </Typography>
          <Typography variant="body2">
            {activeConfig.timeSlots.length} franjas horarias configuradas •
            {activeConfig.allowedWeekDays.length} días permitidos • Creación
            automática:{' '}
            {activeConfig.autoCreateSlots ? 'Habilitada' : 'Deshabilitada'}
          </Typography>
        </Alert>
      )}

      {/* Botón para nueva configuración */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openNewConfigDialog}
          sx={{
            backgroundColor: '#ED1F80',
            '&:hover': { backgroundColor: '#c91a6b' },
          }}
        >
          Nueva Configuración
        </Button>
      </Box>

      {/* Lista de configuraciones */}
      {configs.length === 0 ? (
        <Alert severity="warning">
          No hay configuraciones creadas. Crea una nueva configuración para
          comenzar.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {configs.map((config) => (
            //@ts-expect-error: MUI Grid typing conflict workaround
            <Grid item xs={12} key={config._id}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      width: '100%',
                    }}
                  >
                    <Typography variant="h6">{config.name}</Typography>
                    {config.isActive && (
                      <Chip label="ACTIVA" color="success" size="small" />
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(config.startDate), 'dd/MM/yyyy')} -{' '}
                      {format(new Date(config.endDate), 'dd/MM/yyyy')}
                    </Typography>
                    <Chip
                      label={`${config.timeSlots.length} franjas`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <Grid container spacing={2}>
                    {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Días Permitidos
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {config.allowedWeekDays.map((day) => (
                          <Chip
                            key={day}
                            label={
                              diasSemana.find((d) => d.value === day)?.label
                            }
                            size="small"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Grid>
                    {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Configuración
                      </Typography>
                      <Typography variant="body2">
                        Zona horaria: {config.timeZone}
                        <br />
                        Creación automática:{' '}
                        {config.autoCreateSlots ? 'Sí' : 'No'}
                        <br />
                        Semanas adelantadas: {config.weeksInAdvance}
                      </Typography>
                    </Grid>
                    {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Franjas Horarias ({config.timeSlots.length})
                      </Typography>
                      <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Hora Inicio</TableCell>
                              <TableCell>Hora Fin</TableCell>
                              <TableCell>Duración</TableCell>
                              <TableCell>Capacidad</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {config.timeSlots.map((slot, index) => (
                              <TableRow key={index}>
                                <TableCell>{slot.startTime}</TableCell>
                                <TableCell>{slot.endTime}</TableCell>
                                <TableCell>{slot.duration} min</TableCell>
                                <TableCell>{slot.capacity} personas</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => openEditConfigDialog(config)}
                          sx={{
                            borderColor: '#ED1F80',
                            color: '#ED1F80',
                          }}
                        >
                          Editar
                        </Button>

                        {!config.isActive && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => activateConfig(config._id!)}
                            sx={{
                              backgroundColor: '#ED1F80',
                              '&:hover': { backgroundColor: '#c91a6b' },
                            }}
                          >
                            Activar
                          </Button>
                        )}

                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => generateSlots(config._id!)}
                        >
                          Generar Cupos
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog de configuración */}
      <Dialog
        open={configDialog}
        onClose={() => setConfigDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingConfig?._id ? 'Editar Configuración' : 'Nueva Configuración'}
        </DialogTitle>

        <DialogContent>
          {editingConfig && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Información básica */}
                {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre de la configuración"
                    value={editingConfig.name}
                    onChange={(e) =>
                      setEditingConfig({
                        ...editingConfig,
                        name: e.target.value,
                      })
                    }
                  />
                </Grid>
                {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de inicio"
                    value={editingConfig.startDate}
                    onChange={(e) =>
                      setEditingConfig({
                        ...editingConfig,
                        startDate: e.target.value,
                      })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de fin"
                    value={editingConfig.endDate}
                    onChange={(e) =>
                      setEditingConfig({
                        ...editingConfig,
                        endDate: e.target.value,
                      })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Días permitidos */}
                {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Días permitidos
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {diasSemana.map((dia) => (
                      <FormControlLabel
                        key={dia.value}
                        control={
                          <Checkbox
                            checked={editingConfig.allowedWeekDays.includes(
                              dia.value
                            )}
                            onChange={(e) =>
                              handleWeekDayChange(dia.value, e.target.checked)
                            }
                            sx={{
                              color: '#ED1F80',
                              '&.Mui-checked': { color: '#ED1F80' },
                            }}
                          />
                        }
                        label={dia.label}
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Configuración adicional */}
                {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editingConfig.autoCreateSlots}
                        onChange={(e) =>
                          setEditingConfig({
                            ...editingConfig,
                            autoCreateSlots: e.target.checked,
                          })
                        }
                        sx={{
                          color: '#ED1F80',
                          '&.Mui-checked': { color: '#ED1F80' },
                        }}
                      />
                    }
                    label="Crear cupos automáticamente"
                  />
                </Grid>
                {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Semanas por adelantado"
                    value={editingConfig.weeksInAdvance}
                    onChange={(e) =>
                      setEditingConfig({
                        ...editingConfig,
                        weeksInAdvance: parseInt(e.target.value) || 4,
                      })
                    }
                    inputProps={{ min: 1, max: 12 }}
                  />
                </Grid>

                {/* Franjas horarias */}
                {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Franjas Horarias
                  </Typography>

                  {/* Agregar nueva franja */}
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      border: '1px dashed #ccc',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" gutterBottom>
                      Agregar nueva franja horaria
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          type="time"
                          label="Hora inicio"
                          value={newTimeSlot.startTime}
                          onChange={(e) =>
                            setNewTimeSlot({
                              ...newTimeSlot,
                              startTime: e.target.value,
                            })
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          type="time"
                          label="Hora fin"
                          value={newTimeSlot.endTime}
                          onChange={(e) =>
                            setNewTimeSlot({
                              ...newTimeSlot,
                              endTime: e.target.value,
                            })
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                      <Grid item xs={2}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Duración (min)"
                          value={newTimeSlot.duration}
                          onChange={(e) =>
                            setNewTimeSlot({
                              ...newTimeSlot,
                              duration: parseInt(e.target.value) || 60,
                            })
                          }
                        />
                      </Grid>
                      {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                      <Grid item xs={2}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Capacidad"
                          value={newTimeSlot.capacity}
                          onChange={(e) =>
                            setNewTimeSlot({
                              ...newTimeSlot,
                              capacity: parseInt(e.target.value) || 15,
                            })
                          }
                          inputProps={{ min: 10, max: 15 }}
                        />
                      </Grid>
                      {/* @ts-expect-error: MUI Grid typing conflict workaround */}
                      <Grid item xs={2}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={addTimeSlot}
                          startIcon={<AddIcon />}
                        >
                          Agregar
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Lista de franjas existentes */}
                  <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Hora Inicio</TableCell>
                          <TableCell>Hora Fin</TableCell>
                          <TableCell>Duración</TableCell>
                          <TableCell>Capacidad</TableCell>
                          <TableCell>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {editingConfig.timeSlots.map((slot, index) => (
                          <TableRow key={index}>
                            <TableCell>{slot.startTime}</TableCell>
                            <TableCell>{slot.endTime}</TableCell>
                            <TableCell>{slot.duration} min</TableCell>
                            <TableCell>{slot.capacity} personas</TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => removeTimeSlot(index)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfigDialog(false)}>Cancelar</Button>
          <Button
            onClick={saveConfig}
            variant="contained"
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            sx={{
              backgroundColor: '#ED1F80',
              '&:hover': { backgroundColor: '#c91a6b' },
            }}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduleConfigManager;
