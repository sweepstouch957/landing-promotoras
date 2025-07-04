'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Container, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'administrator',
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redireccionar al login con la URL actual como parámetro
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(loginUrl as any);
    }
  }, [isAuthenticated, loading, router, pathname]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          textAlign="center"
        >
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Verificando autenticación...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Si no está autenticado, no renderizar nada (se redireccionará)
  if (!isAuthenticated) {
    return null;
  }

  // Verificar permisos de rol si es necesario
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          textAlign="center"
        >
          <Typography variant="h4" color="error" gutterBottom>
            Acceso Denegado
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No tienes permisos para acceder a esta página.
          </Typography>
        </Box>
      </Container>
    );
  }

  // Si todo está bien, renderizar el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;
