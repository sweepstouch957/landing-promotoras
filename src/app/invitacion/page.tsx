import React, { Suspense } from 'react';
import { Container } from '@mui/material';
import InvitationForm from '@/components/InvitationForm';

export default function InvitacionPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Suspense fallback={<div>Cargando invitación...</div>}>
        <InvitationForm />
      </Suspense>
    </Container>
  );
}
