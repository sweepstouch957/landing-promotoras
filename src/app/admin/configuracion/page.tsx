'use client';

import React from 'react';
import { Box } from '@mui/material';
import AdminLayout from '@/components/AdminLayout';
import ScheduleConfigManager from '@/components/ScheduleConfigManager';

export default function ConfiguracionPage() {
  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <ScheduleConfigManager />
      </Box>
    </AdminLayout>
  );
}

