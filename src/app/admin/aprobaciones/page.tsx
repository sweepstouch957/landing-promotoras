'use client';

import React from 'react';
import { Box } from '@mui/material';
import AdminLayout from '@/components/AdminLayout';
import ApprovalManager from '@/components/ApprovalManager';

export default function AprobacionesPage() {
  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <ApprovalManager />
      </Box>
    </AdminLayout>
  );
}

