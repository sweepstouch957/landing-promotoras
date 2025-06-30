'use client';

import React, { useRef, useEffect } from 'react';
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
import { formatPhone } from '@/app/utils/formatPhone';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useTranslation } from 'react-i18next';

const MySwal = withReactContent(Swal);

interface FormData {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  edad: number;
  zip: string;
  supermercado: string;
  acepta: boolean;
}

const inputStyles = {
  '& label.Mui-focused': {
    color: '#ED1F80',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#ccc',
    },
    '&:hover fieldset': {
      borderColor: '#ED1F80',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#ED1F80',
    },
  },
};

export default function ApplicationForm() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await fetch('https://sheetdb.io/api/v1/5rnrmuhqeq1h4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      await MySwal.fire({
        title: t('form_success_title'),
        text: t('form_success_text'),
        icon: 'success',
        confirmButtonColor: '#ED1F80',
        confirmButtonText: t('form_button_ok'),
        customClass: {
          popup: 'rounded-xl',
          title: 'font-bold text-lg',
          confirmButton: 'px-4 py-2',
        },
      });

      reset();
    } catch (err) {
      console.error(err);
      await MySwal.fire({
        title: t('form_error_title'),
        text: t('form_error_text'),
        icon: 'error',
        confirmButtonColor: '#ED1F80',
        confirmButtonText: t('form_button_ok'),
        customClass: {
          popup: 'rounded-xl',
          title: 'font-bold text-lg',
          confirmButton: 'px-4 py-2',
        },
      });
    }
  };

  return (
    <Box
      ref={formRef}
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
        color="#ED1F80"
        textTransform="uppercase"
        sx={{ fontFamily: 'Roboto, sans-serif' }}
      >
        {t('form_title')}
      </Typography>

      <TextField
        label={t('form_nombre')}
        {...register('nombre', {
          required: t('form_error_nombre'),
          pattern: {
            value: /^[A-Za-zÁ-ú\s]+$/,
            message: t('form_error_solo_letras'),
          },
        })}
        error={!!errors.nombre}
        helperText={errors.nombre?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label={t('form_apellido')}
        {...register('apellido', {
          required: t('form_error_apellido'),
          pattern: {
            value: /^[A-Za-zÁ-ú\s]+$/,
            message: t('form_error_solo_letras'),
          },
        })}
        error={!!errors.apellido}
        helperText={errors.apellido?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label={t('form_telefono')}
        {...register('telefono', {
          required: t('form_error_telefono'),
          pattern: {
            value: /^\(\d{3}\) \d{3}-\d{4}$/,
            message: t('form_error_telefono_invalido'),
          },
          onChange: (e) => {
            const formatted = formatPhone(e.target.value);
            setValue('telefono', formatted);
          },
        })}
        error={!!errors.telefono}
        helperText={errors.telefono?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label={t('form_correo')}
        type="email"
        {...register('correo', {
          required: t('form_error_correo'),
          pattern: {
            value: /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/,
            message: t('form_error_correo_invalido'),
          },
        })}
        error={!!errors.correo}
        helperText={errors.correo?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label={t('form_edad')}
        type="number"
        inputProps={{ min: 18 }}
        {...register('edad', {
          required: t('form_error_edad'),
          min: { value: 18, message: t('form_error_edad_minima') },
        })}
        error={!!errors.edad}
        helperText={errors.edad?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label={t('form_zip')}
        {...register('zip', {
          required: t('form_error_zip'),
        })}
        error={!!errors.zip}
        helperText={errors.zip?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label={t('form_supermercado')}
        {...register('supermercado', {
          required: t('form_error_supermercado'),
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
              color: '#ED1F80',
              '&.Mui-checked': {
                color: '#ED1F80',
              },
            }}
          />
        }
        label={t('form_acepta')}
      />
      {errors.acepta && (
        <Typography variant="caption" color="error">
          {t('form_error_acepta')}
        </Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{
          mt: 1,
          backgroundColor: '#ED1F80',
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
        {t('form_enviar')}
      </Button>
    </Box>
  );
}
