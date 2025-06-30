import type { Metadata } from 'next';
import '../styles/variables.css'; // importa los estilos globales aquí
import '@/lib/i18n';

import './globals.css';

export const metadata: Metadata = {
  title: 'Sweepstouch | Promotoras',
  description:
    '¿Eres estudiante universitaria y buscas un trabajo que se adapte a tu horario académico? ¡Esta oportunidad es perfecta para ti!',
  keywords: [
    'trabajo para estudiantes',
    'ganar dinero desde casa',
    'empleo universitarias',
    'trabajo flexible',
  ],
  authors: [{ name: 'Sweepstouch', url: 'https://sweepstouch.com' }],
  creator: 'Sweepstouch',
  openGraph: {
    title: 'Sweepstouch - Trabajo Flexible para Estudiantes',
    description:
      'Conviértete en embajadora y gana hasta $25/hora adaptándote a tu horario universitario.',
    url: 'https://sweepstouch.com',
    siteName: 'Sweepstouch',
    images: [
      {
        url: 'https://sweepstouch.com/og-image.jpg', // Asegúrate que exista en /public o tu hosting
        width: 1200,
        height: 630,
        alt: 'Sweepstouch - Gana dinero siendo estudiante',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sweepstouch - Promotoras',
    description:
      'Descubre cómo puedes ganar dinero como estudiante universitaria con horarios flexibles.',
    images: ['https://sweepstouch.com/og-image.jpg'],
    creator: '@sweepstouch',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
