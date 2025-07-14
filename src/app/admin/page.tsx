'use client';

import React from 'react';
import Grid from '@mui/material/Grid'; // ✅ Importación válida para MUI < 5.11
import { Box, Typography } from '@mui/material';

import AdminLayout from '@/components/AdminLayout';
import TodayAppointments from '@/components/TodayAppointments';
import AdminUserManagement from '@/components/AdminUserManagement';
import AppointmentCalendar from '@/components/AppointmentCalendar';

export default function AdminPage() {
  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#ED1F80' }}>
          Panel de Administración
        </Typography>

        <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
          Gestiona usuarios, citas y configuraciones del sistema de promotoras.
        </Typography>

        <Grid container spacing={3}>
          {/* Citas de hoy */}
          {/* @ts-expect-error: MUI Grid typing conflict workaround*/}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%' }}>
              <TodayAppointments />
            </Box>
          </Grid>

          {/* Calendario de citas */}
          {/* @ts-expect-error: MUI Grid typing conflict workaround*/}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%' }}>
              <AppointmentCalendar />
            </Box>
          </Grid>

          {/* Gestión de usuarios */}
          {/* @ts-expect-error: MUI Grid typing conflict workaround*/}
          <Grid item xs={12}>
            <AdminUserManagement />
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}
