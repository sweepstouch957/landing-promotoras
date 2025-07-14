'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import SlotSelectorModal from './SlotSelectorModal';

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

import { useSearchParams } from 'next/navigation';
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
type InvitationFormData = {
  correo: string;
  nombre: string;
  apellido: string;
  idiomas: string[];
};

const InvitationForm: React.FC = () => {
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLDivElement>(null);

  const [showSlotSelector, setShowSlotSelector] = useState(false);
  const [currentFormData, setCurrentFormData] =
    useState<InvitationFormData | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedIdiomas, setSelectedIdiomas] = useState<string[]>(['Español']);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<InvitationFormData>({
    defaultValues: {
      idiomas: ['Español'],
    },
  });
  const watchedIdiomas = watch('idiomas');

  useEffect(() => {
    setValue('idiomas', selectedIdiomas);
  }, [selectedIdiomas, setValue]);

  // Obtener email de los parámetros de URL
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setValue('correo', emailParam);
    }
  }, [setValue, searchParams]);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Manejar cambio de idiomas múltiples
  const handleIdiomasChange = (
    event: SelectChangeEvent<typeof selectedIdiomas>
  ) => {
    const value = event.target.value;
    const newIdiomas = typeof value === 'string' ? value.split(',') : value;
    setSelectedIdiomas(newIdiomas);
  };

  // Manejar envío del formulario principal
  const onSubmit = async (data: InvitationFormData) => {
    console.log('📧 Datos de invitación antes de enviar:', data);

    // Asegurar que los idiomas estén incluidos
    const formDataWithIdiomas = {
      ...data,
      idiomas: selectedIdiomas,
    };

    console.log('✅ Datos de invitación procesados:', formDataWithIdiomas);
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
          (user: any) => user.email.toLowerCase() === data.correo.toLowerCase()
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
      console.log('🎯 Enviando invitación al backend:', {
        email: currentFormData.correo,
        idiomas: currentFormData.idiomas,
        slotId: slot._id,
      });

      // Crear usuario de invitación con slot seleccionado
      const userResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://backend-promotoras.onrender.com'
        }/api/users/invitation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: currentFormData.correo,
            nombre: currentFormData.nombre,
            apellido: currentFormData.apellido,
            idiomas: currentFormData.idiomas,
            slotId: slot._id,
          }),
        }
      );

      const userResult = await userResponse.json();
      console.log('📊 Respuesta del backend para invitación:', userResult);

      if (!userResult.success) {
        throw new Error(
          userResult.message || 'Error al crear usuario de invitación'
        );
      }

      setSubmitSuccess(true);
      setShowSlotSelector(false);

      // Limpiar formulario
      reset();
      setSelectedIdiomas(['Español']);
      setCurrentFormData(null);
      setSelectedSlot(null);
    } catch (error) {
      console.error('❌ Error en la invitación:', error);
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
      <Paper
        elevation={3}
        sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}
        ref={formRef}
      >
        <Alert severity="success" sx={{ mb: 2 }}>
          ¡Invitación procesada exitosamente! Se ha enviado un correo de
          confirmación con los detalles de la cita.
        </Alert>
        <Button
          variant="outlined"
          onClick={() => {
            setSubmitSuccess(false);
            setSubmitError(null);
          }}
          fullWidth
        >
          Procesar otra invitación
        </Button>
      </Paper>
    );
  }

  return (
    <>
      <Paper
        elevation={3}
        sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}
        ref={formRef}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ color: '#ED1F80' }}
        >
          Formulario de Invitación
        </Typography>

        <Typography
          variant="body1"
          sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}
        >
          Ingresa el email de la persona que deseas invitar y selecciona los
          idiomas que habla.
        </Typography>

        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={3}>
            {/* @ts-expect-error: MUI Grid typing conflict workaround */}
            <Grid item xs={12}>
              <TextField
                {...register('nombre')}
                label="Nombre *"
                fullWidth
                variant="outlined"
              />
            </Grid>
            {/* @ts-expect-error: MUI Grid typing conflict workaround */}
            <Grid item xs={12}>
              <TextField
                {...register('apellido')}
                label="Apellido *"
                fullWidth
                variant="outlined"
              />
            </Grid>
            {/* @ts-expect-error: MUI Grid typing conflict workaround */}
            <Grid item xs={12}>
              <TextField
                {...register('correo')}
                label="Email de la persona a invitar *"
                type="email"
                fullWidth
                variant="outlined"
                placeholder="ejemplo@correo.com"
              />
            </Grid>
            {/* @ts-expect-error: MUI Grid typing conflict workaround */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Idiomas que habla *</InputLabel>
                <Select
                  multiple
                  value={selectedIdiomas}
                  onChange={handleIdiomasChange}
                  input={<OutlinedInput label="Idiomas que habla *" />}
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
                >
                  {IDIOMAS_DISPONIBLES.map((idioma) => (
                    <MenuItem key={idioma} value={idioma}>
                      <Checkbox
                        checked={selectedIdiomas.indexOf(idioma) > -1}
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
                sx={{
                  mt: 2,
                  py: 1.5,
                  backgroundColor: '#ED1F80',
                  '&:hover': {
                    backgroundColor: '#d1176b',
                  },
                }}
              >
                Seleccionar Horario para Invitación
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

export default InvitationForm;

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
