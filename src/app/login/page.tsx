import { Metadata } from 'next';
import LoginForm from '@/components/LoginForm';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Sweepstouch Promotoras',
  description: 'Accede al panel de administración de Sweepstouch Promotoras',
  robots: 'noindex, nofollow', // Evitar indexación de la página de login
};

export default function LoginPage() {
  return <Suspense fallback={<>Loading...</>}>
    <LoginForm />
  </Suspense>;
}

