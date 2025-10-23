'use client';
import React from 'react';
import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Box, TextField, Button, Typography, Paper, Grid, CircularProgress, Autocomplete, Snackbar, Alert } from '@mui/material';
import useStore from '@/hooks/useStore';
import { createCashier } from '@/services/cashier.service';

type FormData = { nombre: string; apellido: string; email: string; telefono: string; storeId: string; };

const CashiersForm: React.FC = () => {
  const { t } = useTranslation('common');
  const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    defaultValues: { nombre: '', apellido: '', email: '', telefono: '', storeId: '' },
  });
  const { data: stores = [], isLoading: loading } = useStore();
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });

  const [zipFilter, setZipFilter] = React.useState('');

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 5);
    setZipFilter(digits);
  };

  const filteredStores = useMemo(() => {
    if (!zipFilter) return stores;
    return (stores as any[]).filter((s) =>
      String(s?.zipCode ?? '').startsWith(zipFilter)
    );
  }, [stores, zipFilter]);

  const onSubmit = async (f: FormData) => {
    try {
      const payload = { firstName: f.nombre, lastName: f.apellido, storeId: f.storeId, email: f.email || undefined, phoneNumber: f.telefono || undefined, active: true };
      const res = await createCashier(payload);
      setSnack({ open: true, msg: res?.message ?? t('cashiers.success'), severity: 'success' });
      reset();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t('cashiers.errorGeneric');
      setSnack({ open: true, msg, severity: 'error' });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 720, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 600, mb: 1 }}>{t('cashiers.title')}</Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>{t('cashiers.subtitle')}</Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3} direction="column">
          {/* @ts-expect-error */}
          <Grid item xs={12}>
            <TextField fullWidth label={t('cashiers.firstName') + ' *'} {...register('nombre', { required: t('errors.required') as string })} error={!!errors.nombre} helperText={errors.nombre?.message} />
          </Grid>
          {/* @ts-expect-error */}
          <Grid item xs={12}>
            <TextField fullWidth label={t('cashiers.lastName') + ' *'} {...register('apellido', { required: t('errors.required') as string })} error={!!errors.apellido} helperText={errors.apellido?.message} />
          </Grid>
          {/* @ts-expect-error */}
          <Grid item xs={12}>
            <TextField fullWidth type="email" label={t('cashiers.email') + ' *'} {...register('email', { required: t('errors.required') as string, pattern: { value: /[^@\s]+@[^@\s]+\.[^@\s]+/, message: t('errors.emailInvalid') as string } })} error={!!errors.email} helperText={errors.email?.message} />
          </Grid>
          {/* @ts-expect-error */}
          <Grid item xs={12}>
            <TextField fullWidth type="tel" label={t('cashiers.phone') + ' *'} {...register('telefono', { required: t('errors.required') as string })} error={!!errors.telefono} helperText={errors.telefono?.message} />
          </Grid>

          {/* @ts-expect-error */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={`${t('cashiers.zip')} (${t('optional')})`}
              value={zipFilter}
              onChange={handleZipChange}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 5 }}
              helperText={
                zipFilter
                  ? `${t('cashiers.filteringBy')}: ${zipFilter}`
                  : t('cashiers.zipHint')
              }
            />
          </Grid>


          {/* @ts-expect-error */}
          <Grid item xs={12}>
            <Controller
              name="storeId"
              control={control}
              rules={{ required: 'Selecciona una tienda' }}
              render={({ field, fieldState }) => (
                <Autocomplete
                  fullWidth
                  disablePortal
                  loading={loading}
                  // 👇 usamos las tiendas filtradas
                  options={filteredStores as any[]}
                  getOptionLabel={(o: any) =>
                    String(o?.name ?? o?.nombre ?? o?.store_name ?? '')
                  }
                  isOptionEqualToValue={(o: any, v: any) =>
                    String(o?.id ?? o?._id ?? o?.store_id) === String(v?.id ?? v?._id ?? v?.store_id)
                  }
                  onChange={(_, value) =>
                    field.onChange(String(value?.id ?? value?._id ?? value?.store_id ?? ''))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Tienda *"
                      placeholder="Escribe para buscar..."
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
              )}
            />
          </Grid>
          {/* @ts-expect-error */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} sx={{ mt: 2, py: 1.25, borderRadius: 2 }}>{t('cashiers.submit')}</Button>
          </Grid>
        </Grid>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>{snack.msg}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default CashiersForm;
