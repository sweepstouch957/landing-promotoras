'use client';

import React from 'react';
import { Container } from '@mui/material';
import SimpleSchedulingForm from '@/components/SimpleSchedulingForm';

const AgendarCitaPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SimpleSchedulingForm />
    </Container>
  );
};

export default AgendarCitaPage;

