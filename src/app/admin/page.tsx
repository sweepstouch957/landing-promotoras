'use client';

import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
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
          <Grid item xs={12} lg={6}>
            <TodayAppointments />
          </Grid>
          
          {/* Calendario de citas */}
          <Grid item xs={12} lg={6}>
            <AppointmentCalendar />
          </Grid>

          {/* Gestión de usuarios */}
          <Grid item xs={12}>
            <AdminUserManagement />
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}

