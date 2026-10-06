'use client';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Box, TextField, Button, Typography, Paper, InputAdornment,
  CircularProgress, Autocomplete, Snackbar, Alert
} from '@mui/material';
import { UserRound, Mail, Phone, MapPin, Store, ArrowRight } from 'lucide-react';
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

const DUPLICATE_MSG = 'Correo o teléfono ya registrado';

function isDuplicateError(err: any) {
  const status = err?.response?.status as number | undefined;
  const raw =
    (err?.response?.data?.message ??
      err?.message ??
      '') as string;

  const m = raw.toLowerCase();

  // 409 es muy común para duplicados; también checamos palabras clave
  return status === 409 ||
    /duplic|already|exist|unique|correo|email|tel[eé]fono|phone/.test(m);
}

const isActiveStore = (s: any) => {
  const raw = s?.status ?? s?.estado ?? s?.isActive ?? s?.active;
  if (typeof raw === 'string') return raw.toLowerCase() === 'active';
  return Boolean(raw);
};

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

  // Solo tiendas activas
  const activeStores = React.useMemo(() => {
    return (stores as any[]).filter(isActiveStore);
  }, [stores]);

  // Si hay zipFilter, aplicar sobre las activas
  const filteredStores = React.useMemo(() => {
    if (!zipFilter) return activeStores;
    return activeStores.filter((s) =>
      String(s?.zipCode ?? '').startsWith(zipFilter)
    );
  }, [activeStores, zipFilter]);

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

        } catch (e) {
          console.warn('No se pudo enviar el email (Gmail SMTP route)', e);
        }
      }
      reset();
      setZipFilter(''); // también limpiamos el filtro ZIP
    } catch (err: any) {
      const msg = isDuplicateError(err)
        ? DUPLICATE_MSG
        : (err?.response?.data?.message ||
          err?.message ||
          (t?.('errorGeneric') as string) ||
          'No fue posible guardar. Intenta de nuevo.');

      setSnack({ open: true, msg, severity: 'error' });
    }
  };

  return (
    <Paper className="cashiers-form" elevation={0} sx={{ p: { xs: 2.25, sm: 4 }, maxWidth: 600, mx: 'auto', position: 'relative', zIndex: 1, borderRadius: '22px 22px 45% 45% / 22px 22px 36px 36px', pb: { xs: 5, sm: 6 } }}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', sm: '2.25rem' }, color: '#ec0e7b', mb: 0.25 }}>
        {t('title')}
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2.5 }}>
        {t('subtitle')}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Nombre */}
          <Box>
            <TextField
              fullWidth
              label={t('firstName')} required size="small"
              InputProps={{ startAdornment: <InputAdornment position="start"><UserRound size={20} aria-hidden="true" /></InputAdornment> }}
              {...register('nombre', { required: t('errors.required') as string })}
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
            />
          </Box>

          {/* Apellido */}
          <Box>
            <TextField
              fullWidth
              label={t('lastName')} required size="small"
              InputProps={{ startAdornment: <InputAdornment position="start"><UserRound size={20} aria-hidden="true" /></InputAdornment> }}
              {...register('apellido', { required: t('errors.required') as string })}
              error={!!errors.apellido}
              helperText={errors.apellido?.message}
            />
          </Box>

          {/* Email */}
          <Box>
            <TextField
              fullWidth
              type="email"
              label={t('email')} required size="small"
              InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={20} aria-hidden="true" /></InputAdornment> }}
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
          </Box>

          {/* Teléfono: solo números y máx 11 */}
          <Box>
            <TextField
              fullWidth
              type="tel"
              label={t('phone')} required size="small"
              InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={20} aria-hidden="true" /></InputAdornment> }}
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
          </Box>


          {/* ZIP opcional para filtrar tiendas */}
          <Box>
            <TextField
              fullWidth
              label={`${t('zip')} (${t('optional')})`} size="small" InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={20} aria-hidden="true" /></InputAdornment> }}
              value={zipFilter}
              onChange={handleZipChange}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 5 }}
              helperText={zipFilter ? `${t('filteringBy')}: ${zipFilter}` : t('zipHint')}
            />
          </Box>

          {/* Tienda (Autocomplete) */}
          <Box>
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
                        label={t('store')} required size="small"
                        placeholder={t('storePlaceholder')}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{
                          ...params.InputProps, startAdornment: <InputAdornment position="start"><Store size={20} aria-hidden="true" /></InputAdornment>,
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
          </Box>

          {/* Enviar */}
          <Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              endIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <ArrowRight size={20} />} sx={{ py: 1.25, borderRadius: 999, fontWeight: 700, background: 'linear-gradient(100deg, #ed0078, #f01485)', boxShadow: '0 4px 10px #ec0e7b30', '&:hover': { background: '#cf0068' } }}
            >
              {t('submit')}
            </Button>
          </Box>
        </Box>
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
