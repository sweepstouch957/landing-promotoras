'use client';

import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTheme } from '@mui/material/styles';

type FormData = {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  edad: number;
  zip: string;
  supermercado: string;
  acepta: boolean;
};

const inputStyles = {
  '& label.Mui-focused': {
    color: '#fc0680',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#ccc',
    },
    '&:hover fieldset': {
      borderColor: '#fc0680',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#fc0680',
    },
  },
};

export default function ApplicationForm() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Error al enviar');

      alert('Formulario enviado correctamente');
      reset();
    } catch (err) {
      console.error(err);
      alert('Error al enviar el formulario');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        width: '100%',
        maxWidth: 420,
        mx: 'auto',
        p: isMobile ? 2 : 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography
        variant="h6"
        align="center"
        fontWeight="bold"
        color="#fc0680"
        textTransform="uppercase"
      >
        Formulario de Aplicación
      </Typography>

      <Typography variant="subtitle1">Información personal</Typography>

      <TextField
        label="Nombre"
        {...register('nombre', { required: 'El nombre es obligatorio' })}
        error={!!errors.nombre}
        helperText={errors.nombre?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label="Apellido"
        {...register('apellido', { required: 'El apellido es obligatorio' })}
        error={!!errors.apellido}
        helperText={errors.apellido?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label="Teléfono"
        {...register('telefono', {
          required: 'El teléfono es obligatorio',
          pattern: {
            value: /^[0-9]{8,15}$/,
            message: 'Teléfono inválido',
          },
        })}
        error={!!errors.telefono}
        helperText={errors.telefono?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label="Correo electrónico"
        type="email"
        {...register('correo', {
          required: 'El correo es obligatorio',
          pattern: {
            value: /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/,
            message: 'Correo inválido',
          },
        })}
        error={!!errors.correo}
        helperText={errors.correo?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label="Edad"
        type="number"
        inputProps={{ min: 18 }}
        {...register('edad', {
          required: 'La edad es obligatoria',
          min: { value: 18, message: 'Debe ser mayor de edad' },
        })}
        error={!!errors.edad}
        helperText={errors.edad?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label="Código ZIP"
        {...register('zip', { required: 'El ZIP es obligatorio' })}
        error={!!errors.zip}
        helperText={errors.zip?.message}
        fullWidth
        sx={inputStyles}
      />

      <Typography variant="subtitle1">
        ¿En qué supermercado realiza habitualmente sus compras?
      </Typography>

      <TextField
        {...register('supermercado', {
          required: 'Este campo es obligatorio',
        })}
        error={!!errors.supermercado}
        helperText={errors.supermercado?.message}
        fullWidth
        sx={inputStyles}
      />

      <FormControlLabel
        control={
          <Checkbox
            {...register('acepta', { required: true })}
            color="primary"
            sx={{
              color: '#fc0680',
              '&.Mui-checked': {
                color: '#fc0680',
              },
            }}
          />
        }
        label="He leído y acepto los términos del programa."
      />
      {errors.acepta && (
        <Typography variant="caption" color="error">
          Debes aceptar los términos
        </Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{
          mt: 1,
          backgroundColor: '#fc0680',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '25px',
          py: 1.5,
          fontSize: '1rem',
          '&:hover': {
            backgroundColor: '#e50575',
          },
        }}
      >
        Enviar mi solicitud
      </Button>
    </Box>
  );
}
