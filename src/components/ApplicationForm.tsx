'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Checkbox,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type FormData = {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  edad?: string;
  zipCode?: string;
  supermercado: string;
  idiomas: string[];
};

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

const inputStyles = {
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
};

const ApplicationForm: React.FC = () => {
  const { t } = useTranslation('common');
  const [selectedIdiomas, setSelectedIdiomas] = useState<string[]>(['Español']);
  const [modalOpen, setModalOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [existingUserData, setExistingUserData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<FormData>({
    defaultValues: { idiomas: ['Español'] },
    mode: 'onChange',
  });

  // Verificar si hay datos en localStorage al cargar el componente
  useEffect(() => {
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
      try {
        const userData = JSON.parse(savedUserData);
        setExistingUserData(userData);
        setShowConfirmModal(true);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem("userData");
      }
    }
  }, []);

  useEffect(() => {
    setValue('idiomas', selectedIdiomas);
  }, [selectedIdiomas, setValue]);

  const handleContinueWithExistingData = () => {
    setShowConfirmModal(false);
    // Redirigir directamente a training con flag para evitar validación
    localStorage.setItem('skipEmailValidation', 'true');
    window.location.href = "/training";
  };

  const handleModifyData = () => {
    setShowConfirmModal(false);
    // Cargar los datos existentes en el formulario para editar
    if (existingUserData) {
      setValue('nombre', existingUserData.nombre || '');
      setValue('apellido', existingUserData.apellido || '');
      setValue('email', existingUserData.email || '');
      setValue('telefono', existingUserData.telefono || '');
      setValue('edad', existingUserData.edad?.toString() || '');
      setValue('zipCode', existingUserData.zipCode || '');
      setValue('supermercado', existingUserData.supermercado || '');
      setSelectedIdiomas(existingUserData.idiomas || ['Español']);
    }
    // Marcar que viene de modificación para evitar validación de email existente
    localStorage.setItem('isModifyingData', 'true');
  };

  const handleNewApplication = () => {
    setShowConfirmModal(false);
    // Limpiar todo el localStorage y reiniciar formulario
    localStorage.removeItem('userData');
    localStorage.removeItem('elearning-progress');
    localStorage.removeItem('userMessage');
    localStorage.removeItem('skipEmailValidation');
    localStorage.removeItem('isModifyingData');
    
    // Reiniciar formulario
    reset();
    setSelectedIdiomas(['Español']);
    setExistingUserData(null);
  };

  const handleIdiomasChange = (
    event: SelectChangeEvent<typeof selectedIdiomas>
  ) => {
    const value = event.target.value;
    const newIdiomas = typeof value === 'string' ? value.split(',') : value;
    setSelectedIdiomas(newIdiomas);
  };

  const onSubmit = async (data: FormData) => {
    setNombre(data.nombre);

    try {
      setLoading(true);
      
      // Verificar si el usuario ya existe (solo si no viene de modificación)
      const isModifyingData = localStorage.getItem('isModifyingData');
      if (!isModifyingData) {
        const existingUser = await fetch(`https://backend-promotoras.onrender.com/api/users/email/${encodeURIComponent(data.email)}`);
        
        if (existingUser.ok) {
          // Usuario ya existe, redirigir a training con mensaje
          localStorage.setItem('userMessage', JSON.stringify({
            type: 'info',
            message: `¡Hola ${data.nombre}! Ya tienes una cuenta registrada. Te hemos enviado un correo anteriormente.`
          }));
          localStorage.setItem('skipEmailValidation', 'true');
          window.location.href = '/training';
          return;
        }
      } else {
        // Limpiar flag de modificación
        localStorage.removeItem('isModifyingData');
      }

      const formDataForSheet = {
        Nombre: data.nombre,
        apellido: data.apellido,
        edad: data.edad ?? '',
        telefono: data.telefono ?? '',
        zip: data.zipCode ?? '',
        correo: data.email,
        supermercado: data.supermercado,
        idiomas: selectedIdiomas.join(', '),
      };

      // Estructura de datos para la nueva API
      const apiData = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono ?? '',
        edad: data.edad ? parseInt(data.edad) : 0,
        zipCode: data.zipCode ?? '',
        idiomas: selectedIdiomas,
        videoWatched: false,
        photoUrl: null,
      };

      // Envío a SheetDB (mantener lógica existente)
      const sheetResponse = await fetch('https://sheetdb.io/api/v1/5rnrmuhqeq1h4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formDataForSheet }),
      });

      // Envío a la nueva API de usuarios
      const apiResponse = await fetch('https://backend-promotoras.onrender.com/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      if (!sheetResponse.ok) {
        console.error('❌ Error al enviar a SheetDB:', sheetResponse.statusText);
      }

      if (!apiResponse.ok) {
        console.error('❌ Error al enviar a la API de usuarios:', apiResponse.statusText);
      }

      // Guardar datos del usuario en localStorage para uso posterior
      localStorage.setItem('userData', JSON.stringify(apiData));
      
      setModalOpen(true);
      reset();
      setSelectedIdiomas(['Español']);
    } catch (error) {
      console.error('❌ Error al enviar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const allFields = watch();
  const isFormReady =
    allFields.nombre &&
    allFields.apellido &&
    allFields.email &&
    allFields.edad &&
    selectedIdiomas.length > 0 &&
    isValid;

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
          {t('form.title')}
        </Typography>

        <Typography
          variant="body1"
          sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}
        >
          {t('form.subtitle')}
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={3}>
            {/* @ts-expect-error: MUI Grid typing conflict workaround */}
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('nombre', { required: true })}
                label={`${t('form.name')} *`}
                fullWidth
                variant="outlined"
                sx={inputStyles}
              />
            </Grid>
            {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
            {/* @ts-expect-error */}
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('apellido', { required: true })}
                label={`${t('form.lastname')} *`}
                fullWidth
                variant="outlined"
                sx={inputStyles}
              />
            </Grid>
            {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
            {/* @ts-expect-error */}
            <Grid item xs={12}>
              <TextField
                {...register('email', {
                  required: true,
                  pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i,
                })}
                label={`${t('form.email')} *`}
                type="email"
                fullWidth
                variant="outlined"
                sx={inputStyles}
              />
            </Grid>
            {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
            {/* @ts-expect-error */}
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('telefono')}
                label={t('form.phone')}
                fullWidth
                variant="outlined"
                sx={inputStyles}
              />
            </Grid>
            {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
            {/* @ts-expect-error */}
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('edad', {
                  required: t('form.ageRequired'),
                  validate: (value) => {
                    const num = Number(value);
                    if (isNaN(num)) return t('form.ageNumber');
                    if (num < 18) return t('form.ageMin');
                    if (num > 100) return t('form.ageMax');
                    return true;
                  },
                })}
                label={`${t('form.age')} *`}
                fullWidth
                variant="outlined"
                error={!!errors.edad}
                helperText={errors.edad?.message}
                sx={inputStyles}
              />
            </Grid>
            {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
            {/* @ts-expect-error */}
            <Grid item xs={12}>
              <TextField
                {...register('zipCode')}
                label={t('form.zip')}
                fullWidth
                variant="outlined"
                sx={inputStyles}
              />
            </Grid>
            {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
            {/* @ts-expect-error */}
            <Grid item xs={12}>
              <TextField
                {...register('supermercado', { required: t('form.storeRequired') })}
                label={`${t('form.store')} *`}
                fullWidth
                variant="outlined"
                sx={inputStyles}
                error={!!errors.supermercado}
                helperText={errors.supermercado?.message}
              />
            </Grid>
            {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
            {/* @ts-expect-error */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ '&.Mui-focused': { color: '#ED1F80' } }}>
                  {t('form.languages')} *
                </InputLabel>
                <Select
                  multiple
                  value={selectedIdiomas}
                  onChange={handleIdiomasChange}
                  input={<OutlinedInput label={`${t('form.languages')} *`} />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
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
                        sx={{ '&.Mui-checked': { color: '#ED1F80' } }}
                      />
                      <ListItemText primary={idioma} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Botón siempre visible pero deshabilitado */}
            {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
            {/* @ts-expect-error */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={!isFormReady}
                sx={{
                  mt: 2,
                  py: 1.5,
                  backgroundColor: '#ED1F80',
                  '&:hover': {
                    backgroundColor: !isFormReady ? '#ED1F80' : '#d1176b',
                  },
                  opacity: !isFormReady ? 0.6 : 1,
                  cursor: !isFormReady ? 'not-allowed' : 'pointer',
                }}
              >
                {t('form.submit')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Modal de éxito con redirección */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        TransitionComponent={Transition}
        keepMounted
        sx={{
          backdropFilter: 'blur(6px)',
          backgroundColor: 'rgba(0,0,0,0.2)',
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 3,
            backgroundColor: 'rgba(255, 240, 247, 0.85)',
            border: '2px solid #ED1F80',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: '#ED1F80',
            fontWeight: 'bold',
            fontSize: '1.5rem',
          }}
        >
          <CheckCircleIcon sx={{ color: '#ED1F80' }} />
          ¡Registro completado, {nombre}!
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '1rem', color: '#333', mt: 1 }}>
            El siguiente paso es ver el video introductorio del programa de impulsadoras.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => (window.location.href = '/training')}
            variant="contained"
            sx={{
              backgroundColor: '#ED1F80',
              color: 'white',
              '&:hover': { backgroundColor: '#d1176b' },
              borderRadius: 2,
              px: 3,
            }}
          >
            ¡Ver Vídeo!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Spinner */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Modal de confirmación para usuarios existentes */}
      <Dialog 
        open={showConfirmModal} 
        onClose={() => {}}
        TransitionComponent={Transition}
        keepMounted
        sx={{
          backdropFilter: 'blur(6px)',
          backgroundColor: 'rgba(0,0,0,0.2)',
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 3,
            backgroundColor: 'rgba(255, 240, 247, 0.85)',
            border: '2px solid #ED1F80',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#ED1F80', fontWeight: 'bold' }}>
          Datos Guardados Encontrados
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            Hemos encontrado que ya tienes datos guardados de una sesión anterior:
          </Typography>
          {existingUserData && (
            <Box sx={{ backgroundColor: '#f5f5f5', padding: 2, borderRadius: 1, marginBottom: 2 }}>
              <Typography variant="body2"><strong>Nombre:</strong> {existingUserData.nombre} {existingUserData.apellido}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {existingUserData.email}</Typography>
              <Typography variant="body2"><strong>Teléfono:</strong> {existingUserData.telefono || 'No especificado'}</Typography>
            </Box>
          )}
          <Typography variant="body1">
            ¿Deseas continuar con estos datos o modificar alguna información?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleModifyData} 
            sx={{ color: '#ED1F80' }}
          >
            Modificar Datos
          </Button>
          <Button 
            onClick={handleNewApplication} 
            sx={{ color: '#666' }}
          >
            Nueva Solicitud
          </Button>
          <Button 
            onClick={handleContinueWithExistingData} 
            variant="contained" 
            sx={{
              backgroundColor: '#ED1F80',
              '&:hover': { backgroundColor: '#d1176b' }
            }}
          >
            Continuar con estos Datos
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ApplicationForm;
