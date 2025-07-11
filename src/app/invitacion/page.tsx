'use client';

import React from 'react';
import { Container } from '@mui/material';
import InvitationForm from '@/components/InvitationForm';

const InvitacionPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <InvitationForm />
    </Container>
  );
};

export default InvitacionPage;

