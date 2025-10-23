'use client';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Box, TextField, Button, Typography, Paper, Grid,
  CircularProgress, Autocomplete, Snackbar, Alert
} from '@mui/material';
import useStore from '@/hooks/useStore';
import { createCashier } from '@/services/cashier.service';

type FormData = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  storeId: string;
};

const onlyDigits = (s: string) => s.replace(/\D/g, '');

const CashiersForm: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'cashiers' });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    resetField,
  } = useForm<FormData>({
    defaultValues: { nombre: '', apellido: '', email: '', telefono: '', storeId: '' },
  });

  const { data: stores = [], isLoading: loading } = useStore();

  // Filtro opcional por ZIP (client-side)
  const [zipFilter, setZipFilter] = React.useState('');
  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = onlyDigits(e.target.value).slice(0, 5); // 5 para ZIP US
    setZipFilter(digits);
  };

  const filteredStores = React.useMemo(() => {
    if (!zipFilter) return stores as any[];
    return (stores as any[]).filter((s) =>
      String(s?.zipCode ?? '').startsWith(zipFilter)
    );
  }, [stores, zipFilter]);

  // Teléfono: solo números y máximo 11
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = onlyDigits(e.target.value).slice(0, 11);
    setValue('telefono', v, { shouldValidate: true, shouldDirty: true });
  };

  const [snack, setSnack] = React.useState<{
    open: boolean;
    msg: string;
    severity: 'success' | 'error' | 'warning';
  }>({ open: false, msg: '', severity: 'success' });

  const onSubmit = async (f: FormData) => {
    try {
      // 1) Crear cajera en tu backend
      const payload = {
        firstName: f.nombre,
        lastName: f.apellido,
        storeId: f.storeId,
        email: f.email || undefined,
        phoneNumber: f.telefono || undefined,
        active: true,
      };
      const res = await createCashier(payload);
      setSnack({
        open: true,
        msg: (res?.message ?? (t('success') as string)) as string,
        severity: 'success',
      });

      // 2) Tomar accessCode del response (ajusta si tu backend lo devuelve en otra ruta)
      const accessCode =
        res?.credentials?.accessCode ||
        res?.user?.accessCode ||
        '';

      // 3) Enviar correo (Gmail SMTP) usando API route
      if (f.email && accessCode) {
        try {
          await fetch('/api/send-cashier-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: f.email,
              firstName: f.nombre,
              accessCode,
            }),
          });
          // Si quieres mostrar un snackbar suave de envío:
          // setSnack({ open: true, msg: t('emailSent') as string, severity: 'success' });
        } catch (e) {
          console.warn('No se pudo enviar el email (Gmail SMTP route)', e);
          // setSnack({ open: true, msg: t('emailFailed') as string, severity: 'warning' });
        }
      }

      // 4) Limpiar formulario (incluye tienda). Si prefieres limpiar solo tienda:
      // resetField('storeId');  // y dejar el resto como esté
      reset();
      setZipFilter(''); // también limpiamos el filtro ZIP
    } catch (err: any) {
      const msg = (err?.response?.data?.message || err?.message || (t('errorGeneric') as string)) as string;
      setSnack({ open: true, msg, severity: 'error' });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 720, mx: 'auto', mt: 2 }}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 600, mb: 1 }}>
        {t('title')}
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
        {t('subtitle')}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3} direction="column">
          {/* Nombre */}
          {/* @ts-expect-error */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('firstName') + ' *'}
              {...register('nombre', { required: t('errors.required') as string })}
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
            />
          </Grid>

          {/* Apellido */}
          {/* @ts-expect-error */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('lastName') + ' *'}
              {...register('apellido', { required: t('errors.required') as string })}
              error={!!errors.apellido}
              helperText={errors.apellido?.message}
            />
          </Grid>

          {/* Email */}
          {/* @ts-expect-error */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="email"
              label={t('email') + ' *'}
              {...register('email', {
                required: t('errors.required') as string,
                pattern: {
                  value: /[^@\s]+@[^@\s]+\.[^@\s]+/,
                  message: t('errors.emailInvalid') as string,
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Grid>

          {/* Teléfono: solo números y máx 11 */}
          {/* @ts-expect-error */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="tel"
              label={t('phone') + ' *'}
              value={watch('telefono') || ''}   // seguimos controlando el valor
              // 👇 usamos SÓLO el onChange que provee react-hook-form
              {...register('telefono', {
                required: t('errors.required') as string,
                onChange: (e) => {
                  const v = onlyDigits(e.target.value).slice(0, 11);
                  setValue('telefono', v, { shouldValidate: true, shouldDirty: true });
                },
              })}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 11 }}
              onKeyDown={(e) => {
                const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
                if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) e.preventDefault();
              }}
              error={!!errors.telefono}
              helperText={errors.telefono?.message}
            />
          </Grid>


          {/* ZIP opcional para filtrar tiendas */}
          {/* @ts-expect-error */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={`${t('zip')} (${t('optional')})`}
              value={zipFilter}
              onChange={handleZipChange}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 5 }}
              helperText={zipFilter ? `${t('filteringBy')}: ${zipFilter}` : t('zipHint')}
            />
          </Grid>

          {/* Tienda (Autocomplete) */}
          {/* @ts-expect-error */}
          <Grid item xs={12}>
            <Controller
              name="storeId"
              control={control}
              rules={{ required: t('errors.selectStore') as string }}
              render={({ field, fieldState }) => {
                const selectedOption =
                  (filteredStores as any[]).find(
                    (o) =>
                      String(o?.id ?? o?._id ?? o?.store_id) ===
                      String(field.value || '')
                  ) ?? null;

                return (
                  <Autocomplete
                    fullWidth
                    disablePortal
                    loading={loading}
                    options={filteredStores as any[]}
                    value={selectedOption}
                    onChange={(_, value) =>
                      field.onChange(
                        String(value?.id ?? value?._id ?? value?.store_id ?? '')
                      )
                    }
                    getOptionLabel={(o: any) =>
                      String(o?.name ?? o?.nombre ?? o?.store_name ?? '')
                    }
                    isOptionEqualToValue={(o: any, v: any) =>
                      String(o?.id ?? o?._id ?? o?.store_id) ===
                      String(v?.id ?? v?._id ?? v?.store_id)
                    }
                    clearOnEscape
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label={t('store') + ' *'}
                        placeholder={t('storePlaceholder')}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loading ? <CircularProgress size={18} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                );
              }}
            />
          </Grid>

          {/* Enviar */}
          {/* @ts-expect-error */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              sx={{ mt: 1.5, py: 1.25, borderRadius: 2 }}
            >
              {t('submit')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          sx={{ width: '100%' }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CashiersForm;
