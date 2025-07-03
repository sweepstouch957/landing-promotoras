import { Metadata } from 'next';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Sweepstouch Promotoras',
  description: 'Accede al panel de administración de Sweepstouch Promotoras',
  robots: 'noindex, nofollow', // Evitar indexación de la página de login
};

export default function LoginPage() {
  return <LoginForm />;
}

