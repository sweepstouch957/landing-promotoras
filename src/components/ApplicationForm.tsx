'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SlotSelectorModal from './SlotSelectorModal';

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Checkbox,
  ListItemText,
} from '@mui/material';
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

type FormData = {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  edad?: string;
  zipCode?: string;
  idiomas: string[];
};

const ApplicationForm: React.FC = () => {
  const [showSlotSelector, setShowSlotSelector] = useState(false);

  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);
  // eslint-disable-line @typescript-eslint/no-unused-vars
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedIdiomas, setSelectedIdiomas] = useState<string[]>(['Español']);

  const {
    register,
    handleSubmit,
    // eslint-disable-line @typescript-eslint/no-unused-vars
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      idiomas: ['Español'],
    },
    mode: 'onChange',
  });

  // Observar cambios en idiomas
  // eslint-disable-line @typescript-eslint/no-unused-vars
  const watchedIdiomas = watch('idiomas');

  useEffect(() => {
    setValue('idiomas', selectedIdiomas);
  }, [selectedIdiomas, setValue]);

  // Manejar cambio de idiomas múltiples
  const handleIdiomasChange = (
    event: SelectChangeEvent<typeof selectedIdiomas>
  ) => {
    const value = event.target.value;
    const newIdiomas = typeof value === 'string' ? value.split(',') : value;
    setSelectedIdiomas(newIdiomas);
  };

  // Manejar envío del formulario principal
  const onSubmit = async (data: FormData) => {
    console.log('📝 Datos del formulario antes de enviar:', data);

    // Asegurar que los idiomas estén incluidos
    const formDataWithIdiomas = {
      ...data,
      idiomas: selectedIdiomas,
    };

    console.log('✅ Datos del formulario procesados:', formDataWithIdiomas);
    setCurrentFormData(formDataWithIdiomas);
    setSubmitError(null);

    // Verificar si el usuario ya existe
    try {
      const checkResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/users`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (checkResponse.ok) {
        const usersResult = await checkResponse.json();
        const existingUser = usersResult.data?.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (user: any) => user.email.toLowerCase() === data.email.toLowerCase()
        );

        if (existingUser) {
          setSubmitError('Ya existe un usuario registrado con este email');
          return;
        }
      }

      // Si no existe, mostrar selector de slot
      setShowSlotSelector(true);
    } catch (error) {
      console.error('❌ Error verificando usuario:', error);
      setSubmitError('Error verificando el usuario. Intenta nuevamente.');
    }
  };

  // Manejar selección de slot
  const handleSlotSelect = async (slot: Slot) => {
    if (!currentFormData) return;

    setSelectedSlot(slot);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('🎯 Enviando datos al backend:', {
        ...currentFormData,
        slotId: slot._id,
      });

      // Crear usuario con slot seleccionado
      const userResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...currentFormData,
            slotId: slot._id,
          }),
        }
      );

      const userResult = await userResponse.json();
      console.log('📊 Respuesta del backend:', userResult);

      if (!userResult.success) {
        throw new Error(userResult.message || 'Error al crear usuario');
      }

      setSubmitSuccess(true);
      setShowSlotSelector(false);

      // Limpiar formulario
      reset();
      setSelectedIdiomas(['Español']);
      setCurrentFormData(null);
      setSelectedSlot(null);
    } catch (error) {
      console.error('❌ Error en el registro:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Error desconocido'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cerrar modal de selección de slot
  const handleCloseSlotSelector = () => {
    setShowSlotSelector(false);
    setSelectedSlot(null);
    setIsSubmitting(false);
  };

  if (submitSuccess) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          ¡Registro exitoso! Se ha enviado un correo de confirmación con los
          detalles de tu cita.
        </Alert>
        <Button
          variant="outlined"
          onClick={() => {
            setSubmitSuccess(false);
            setSubmitError(null);
          }}
          fullWidth
          sx={{
            borderColor: '#ED1F80',
            color: '#ED1F80',
            '&:hover': {
              borderColor: '#d1176b',
              backgroundColor: 'rgba(237, 31, 128, 0.04)',
            },
          }}
        >
          Realizar otro registro
        </Button>
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ color: '#ED1F80' }}
        >
          Formulario de Aplicación
        </Typography>

        <Typography
          variant="body1"
          sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}
        >
          Completa tus datos para agendar una cita. Los campos marcados con *
          son obligatorios.
        </Typography>

        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={3}>
            {/* @ts-expect-error: MUI Grid typing conflict workaround */}
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('nombre', { required: true })}
                label="Nombre *"
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#ED1F80',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    '&.Mui-focused': {
                      color: '#ED1F80',
                    },
                  },
                }}
              />
            </Grid>
            {/* @ts-expect-error: MUI Grid typing conflict workaround */}
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('apellido', { required: true })}
                label="Apellido *"
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#ED1F80',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    '&.Mui-focused': {
                      color: '#ED1F80',
                    },
                  },
                }}
              />
            </Grid>
            {/* @ts-expect-error: MUI Grid typing conflict workaround */}
            <Grid item xs={12}>
              <TextField
                {...register('email', {
                  required: true,
                  pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i,
                })}
                label="Email *"
                type="email"
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#ED1F80',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    '&.Mui-focused': {
                      color: '#ED1F80',
                    },
                  },
                }}
              />
            </Grid>
            {/* @ts-expect-error: MUI Grid typing conflict workaround */}
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('telefono')}
                label="Teléfono"
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#ED1F80',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    '&.Mui-focused': {
                      color: '#ED1F80',
                    },
                  },
                }}
              />
            </Grid>
            {/* @ts-expect-error: MUI Grid typing conflict workaround */}
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('edad')}
                label="Edad"
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#ED1F80',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    '&.Mui-focused': {
                      color: '#ED1F80',
                    },
                  },
                }}
              />
            </Grid>
            {/* @ts-expect-error: MUI Grid typing conflict workaround */}
            <Grid item xs={12}>
              <TextField
                {...register('zipCode')}
                label="Código Postal (Zip Code)"
                fullWidth
                variant="outlined"
                placeholder="12345"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#ED1F80',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    '&.Mui-focused': {
                      color: '#ED1F80',
                    },
                  },
                }}
              />
            </Grid>
            {/* @ts-expect-error: MUI Grid typing conflict workaround */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ '&.Mui-focused': { color: '#ED1F80' } }}>
                  Idiomas que hablas *
                </InputLabel>
                <Select
                  multiple
                  value={selectedIdiomas}
                  onChange={handleIdiomasChange}
                  input={<OutlinedInput label="Idiomas que hablas *" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(237, 31, 128, 0.1)',
                            color: '#ED1F80',
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  sx={{
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ED1F80',
                    },
                  }}
                >
                  {IDIOMAS_DISPONIBLES.map((idioma) => (
                    <MenuItem key={idioma} value={idioma}>
                      <Checkbox
                        checked={selectedIdiomas.indexOf(idioma) > -1}
                        sx={{
                          '&.Mui-checked': {
                            color: '#ED1F80',
                          },
                        }}
                      />
                      <ListItemText primary={idioma} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* @ts-expect-error: MUI Grid typing conflict workaround */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={!isValid}
                sx={{
                  mt: 2,
                  py: 1.5,
                  backgroundColor: '#ED1F80',
                  '&:hover': {
                    backgroundColor: '#d1176b',
                  },
                }}
              >
                Seleccionar Horario de Cita
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Modal de selección de slot */}
      <SlotSelectorModal
        open={showSlotSelector}
        onClose={handleCloseSlotSelector}
        onSlotSelect={handleSlotSelect}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default ApplicationForm;

const IDIOMAS_DISPONIBLES = [
  'Español',
  'Inglés',
  'Portugués',
  'Francés',
  'Alemán',
  'Italiano',
  'Chino',
  'Japonés',
  'Coreano',
  'Árabe',
  'Ruso',
  'Otro',
];
