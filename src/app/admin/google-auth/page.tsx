
'use client';

import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import GoogleAuthSetup from '@/components/GoogleAuthSetup';
import { Box, Typography } from '@mui/material';

export default function GoogleAuthPage() {
  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#ff0f6e' }}>
          Configuración de Google Meet
        </Typography>
        <GoogleAuthSetup />
      </Box>
    </AdminLayout>
  );
}


