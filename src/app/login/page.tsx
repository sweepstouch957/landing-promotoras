import { Metadata } from 'next';
import React, { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Sweepstouch Promotoras',
  description: 'Accede al panel de administración de Sweepstouch Promotoras',
  robots: 'noindex, nofollow', // Evitar indexación de la página de login
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
