'use client';

import React from 'react';
import { Container } from '@mui/material';
import JsonUploader from '@/components/JsonUploader';

const ImportarUsuariosPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <JsonUploader />
    </Container>
  );
};

export default ImportarUsuariosPage;

