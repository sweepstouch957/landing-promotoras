'use client';

import React from 'react';
import { Box } from '@mui/material';
import AdminLayout from '@/components/AdminLayout';
import AttendanceManager from '@/components/AttendanceManager';

export default function AsistenciasPage() {
  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <AttendanceManager />
      </Box>
    </AdminLayout>
  );
}

