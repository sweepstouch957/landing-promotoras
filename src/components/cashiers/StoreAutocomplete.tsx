'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from 'react';
import { Controller, Control } from 'react-hook-form';
import { TextField, CircularProgress, Autocomplete, Grid } from '@mui/material';
import useStore from '@/hooks/useStore';
import type { Store } from '@/services/store.service';

// Ampliamos el tipo para cubrir variaciones del backend
type StoreOption = Store & {
  _id?: string;
  store_id?: string;
  nombre?: string;
  store_name?: string;
};

type Props = {
  control: Control<any>;
  name?: string;   // default: 'storeId'
  label?: string;  // default: 'Tienda *'
  xs?: number;     // default: 12
  md?: number;     // default: 12 (ancho completo en desktop)
};

// Helpers seguros
const toLabel = (o: StoreOption | null | undefined) =>
  String(o?.name ?? o?.nombre ?? o?.store_name ?? '');

const toId = (o: StoreOption | null | undefined) =>
  String(o?.id ?? o?._id ?? o?.store_id ?? '');

export default function StoreAutocomplete({
  control,
  name = 'storeId',
  label = 'Tienda *',
  xs = 12,
  md = 12,
}: Props) {
  const { data: stores = [], isLoading: loading } = useStore();

  return (
    <>
      {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
      {/* @ts-expect-error: MUI Grid v2 typing vs legacy `item` prop */}
      <Grid item xs={xs}>
        <Controller
          name={name}
          control={control}
          rules={{ required: 'Selecciona una tienda' }}
          render={({ field, fieldState }) => (
            <Autocomplete<StoreOption, false, false, false>
              fullWidth
              disablePortal
              loading={loading}
              options={stores as StoreOption[]}
              getOptionLabel={(o) => toLabel(o)}
              isOptionEqualToValue={(o, v) => toId(o) === toId(v)}
              onChange={(_, value) => field.onChange(toId(value))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label={label}
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
    </>
  );
}
